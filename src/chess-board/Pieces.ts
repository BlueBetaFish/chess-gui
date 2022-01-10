export enum Color {
    WHITE = "WHITE",
    BLACK = "BLACK",
}

export enum PieceType {
    NONE    = "NONE",
    PAWN    = "PAWN",
    KNIGHT  = "KNIGHT",
    BISHOP  = "BISHOP",
    ROOK    = "ROOK",
    QUEEN   = "QUEEN",
    KING    = "KING",
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
}
