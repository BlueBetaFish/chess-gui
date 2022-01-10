export enum Color {
    WHITE,
    BLACK,
}

export enum PieceType {
    NONE,
    PAWN,
    KNIGHT,
    BISHOP,
    ROOK,
    QUEEN,
    KING,
}

/*
class for piece 
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
