import { Coordinate } from "./chessUtility";
import Piece, { Color } from "./Pieces";


/**
 * Class representing a Chess Board
 */
export class Board {
    boardSize: number;
    squares: Piece[][];
    currentPlayer: Color;
    castling: [boolean, boolean, boolean, boolean];
    enPassant: Coordinate | null;
    halfMoveClock: number;
    fullMove: number;

    constructor(
        initialPosition: Piece[][],
        currentPlayer: Color = Color.WHITE,
        castling: [boolean, boolean, boolean, boolean] = [true, true,true, true],
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
