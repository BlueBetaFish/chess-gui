import Piece, { Color } from "./Pieces";


/**
 * Class representing a Chess Board
 */
export class Board {
    boardSize: number;
    squares: Piece[][];
    currentPlayer: Color;
    moveHistory: string[];

    constructor(
        initialPosition: Piece[][],
        currentPlayer: Color = Color.WHITE
    ) {
        this.currentPlayer = currentPlayer;
        this.boardSize = initialPosition.length;
        this.squares = initialPosition.map((arr) => arr.slice());
        this.moveHistory = new Array();
    }
}
