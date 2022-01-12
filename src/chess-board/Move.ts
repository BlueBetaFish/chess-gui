import { Coordinate } from "./chessUtility";
import Piece from "./Pieces";

export default class Move {
    fromSquare: Coordinate;
    toSquare: Coordinate;
    pieceMoved: Piece;
    capturedPiece: Piece;
    promotedPiece: Piece;

    //true => means the piece was captured en passant
    wasEnPassant: boolean;

    //true => means the move was castling move
    wasCastle: boolean;

    constructor(
        fromSquare: Coordinate = new Coordinate(),
        toSquare: Coordinate = new Coordinate(),
        pieceMoved: Piece = new Piece(),
        capturedPiece: Piece = new Piece(),
        promotedPiece: Piece = new Piece(),
        wasEnPassant: boolean = false,
        wasCastle: boolean = false
    ) {
        this.fromSquare = fromSquare;
        this.toSquare = toSquare;
        this.pieceMoved = pieceMoved;
        this.capturedPiece = capturedPiece;
        this.promotedPiece = promotedPiece;
        this.wasEnPassant = wasEnPassant;
        this.wasCastle = wasCastle;
    }

    equals(newMove: Move): boolean {
        return (
            this.fromSquare === newMove.fromSquare &&
            this.toSquare === newMove.toSquare &&
            this.pieceMoved === newMove.pieceMoved &&
            this.capturedPiece === newMove.capturedPiece &&
            this.promotedPiece === newMove.promotedPiece &&
            this.wasEnPassant === newMove.wasEnPassant &&
            this.wasCastle === newMove.wasCastle
        );
    }
}
