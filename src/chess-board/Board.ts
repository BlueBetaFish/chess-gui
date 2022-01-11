import { Coordinate } from "./chessUtility";
import Piece, { Color } from "./Pieces";

export type CastlingAvailability = [boolean, boolean, boolean, boolean];

/**
 * Class representing a Chess Board
 */
export class Board {
    boardSize: number;
    squares: Piece[][];
    currentPlayer: Color;
    castling: CastlingAvailability;
    enPassant: Coordinate | null;
    halfMoveClock: number;
    fullMove: number;

    constructor(
        initialPosition: Piece[][],
        currentPlayer: Color = Color.WHITE,
        castling: CastlingAvailability = [true, true,true, true],
        enPassant: Coordinate | null = null,
        halfMoveClock: number = 0,
        fullMove: number = 1,
    ) {
        this.currentPlayer = currentPlayer;
        this.boardSize = initialPosition.length;
        this.squares = initialPosition.map((arr) => arr.slice());
        this.castling = castling;
        this.enPassant = enPassant;
        this.halfMoveClock = halfMoveClock;
        this.fullMove = fullMove;
    }
}
