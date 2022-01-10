import Piece, { Color } from "./Pieces";

// const getBoardPositionFromFEN = function() {

// };

/*
Class for chess board 
*/
export class Board {
    boardSize: Number;
    squares: Piece[][];
    currentPlayer: Color;
    moveHistory: String[];

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
