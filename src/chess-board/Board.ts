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
        currentPlayer: Color = Color.WHITE
    ) {
        this.currentPlayer = currentPlayer;
        this.boardSize = initialPosition.length;
        this.squares = initialPosition.map((arr) => arr.slice());
        this.castling = [true, true,true, true];
        this.enPassant = null;
        this.halfMoveClock = 0;
        this.fullMove = 1;
    }
}
