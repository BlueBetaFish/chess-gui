export enum Color {
    WHITE = "WHITE",
    BLACK = "BLACK",
    UNDEFINED = "UNDEFINED"
}

export enum PieceType {
    NONE    = "NONE",
    PAWN    = "P",
    KNIGHT  = "N",
    BISHOP  = "B",
    ROOK    = "R",
    QUEEN   = "Q",
    KING    = "K",
}

/**
 * Class representing a Chess Piece
 */
export default class Piece {
    readonly pieceColor: Color;
    readonly pieceType: PieceType;

    constructor(
        pieceType: PieceType = PieceType.NONE,
        pieceColor: Color = Color.WHITE
    ) {
        this.pieceType = pieceType;
        this.pieceColor = pieceColor;
    }

    getFENSymbol() : string {
        if (this.pieceColor === Color.BLACK) 
            return this.pieceType.toLowerCase();
        return this.pieceType;
    }
}


class PiecePool {
    private readonly FENSymbolToPiece : Map<String, Piece> = new Map<String, Piece>();

    constructor() {
        this.FENSymbolToPiece.set("",  new Piece(PieceType.NONE,   Color.UNDEFINED));
        this.FENSymbolToPiece.set("k", new Piece(PieceType.KING,   Color.BLACK));
        this.FENSymbolToPiece.set("q", new Piece(PieceType.QUEEN,  Color.BLACK));
        this.FENSymbolToPiece.set("r", new Piece(PieceType.ROOK,   Color.BLACK));
        this.FENSymbolToPiece.set("b", new Piece(PieceType.BISHOP, Color.BLACK));
        this.FENSymbolToPiece.set("n", new Piece(PieceType.KNIGHT, Color.BLACK));
        this.FENSymbolToPiece.set("p", new Piece(PieceType.PAWN,   Color.BLACK));
        this.FENSymbolToPiece.set("K", new Piece(PieceType.KING,   Color.WHITE));
        this.FENSymbolToPiece.set("Q", new Piece(PieceType.QUEEN,  Color.WHITE));
        this.FENSymbolToPiece.set("R", new Piece(PieceType.ROOK,   Color.WHITE));
        this.FENSymbolToPiece.set("B", new Piece(PieceType.BISHOP, Color.WHITE));
        this.FENSymbolToPiece.set("N", new Piece(PieceType.KNIGHT, Color.WHITE));
        this.FENSymbolToPiece.set("P", new Piece(PieceType.PAWN,   Color.WHITE));
    }

    /**
     * 
     * @param FENSymbol FEN symbol for piece, empty string "" for NONE type
     * @returns Piece or undefined
     */
    getPiece(FENSymbol : string) : Piece | undefined {
        return this.FENSymbolToPiece.get(FENSymbol);
    }
}

export const PIECE_POOL = new PiecePool();
