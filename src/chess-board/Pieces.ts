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
