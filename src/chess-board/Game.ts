import { count } from "console";
import { Board } from "./Board";
import { Coordinate } from "./chessUtility";
import { boardToFEN, FENToBoard, START_BOARD_FEN } from "./FEN";
import Move from "./Move";
import Piece, { Color, PieceType, PIECE_POOL } from "./Pieces";

/**
 * *Game Class :
 *
 * *Public Member Functions :
 * *_____________________________________________________________________________
 *
 * * 1. getEmptySquare() : creates and returns a piece denoting an empty square
 *
 * * 2. getNewBoardAfterExecutingMove(move) :  creates a new copy of board , executes the move,  and returns the new board without mutating the orginal board field , returns null if something goes wrong
 *
 ** 3. rollBackLastMove() : rolls back the last move of this.board, and returns new board (i mean old board before that move) , without mutating the this.board , returns null if something goes wrong
 *
 * *4 : getLegalMovesOfGivenSquare(fromSquare) : finds legal moves' list from  "fromSquare
 *
 */

export default class Game {
    board: Board | null;
    moveHistory: Move[];

    //*Dont include. It is causing redundancy problem
    // currentPlayer: Color | undefined;

    constructor(fen: string = START_BOARD_FEN) {
        this.board = FENToBoard(fen);

        // this.currentPlayer = this.board?.currentPlayer;
        this.moveHistory = [];
    }

    private getEmptySquare() {
        return new Piece();
    }

    //*TODO: Move it to Board class
    // //*TODO: requires testing
    // //*rolls back the last move of this.board, and returns new board (i mean old board before that move) , without mutating the this.board , returns null if something goes wrong
    // rollBackLastMove(): Board | null {
    //     //to satisfy the null value of this.board
    //     if (!this.board) return null;

    //     //*create new board
    //     let newBoard = this.board.getNewBoard();

    //     if (this.moveHistory.length === 0) return newBoard;

    //     //*get the last move
    //     let move = this.moveHistory[this.moveHistory.length - 1];
    //     if (!move) return newBoard;

    //     //*TODO:-2. Update halfMoveClock and fullMove attributes of board

    //     //*-1. Change currentPlayer
    //     newBoard.currentPlayer = newBoard.currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;

    //     //*1.put the moved piece at fromSquare
    //     newBoard.squares[move.fromSquare.x][move.fromSquare.y] = move.pieceMoved;

    //     //*make the toSquare empty first, later put capturedPiece if the move was not enPassant --> without making the toSquare empty at first, code was producing bog :)
    //     newBoard.squares[move.toSquare.x][move.toSquare.y] = this.getEmptySquare();

    //     //*2.put the captured piece at targetSquare if the move was not enPassant
    //     if (!move.wasEnPassant) newBoard.squares[move.toSquare.x][move.toSquare.y] = move.capturedPiece;

    //     //*3. if we roll back enPassant , then put the capturedPiece at correct square, and set the enPassant attribute of board
    //     if (move.wasEnPassant) {
    //         if (move.pieceMoved.pieceColor === Color.WHITE) {
    //             newBoard.squares[move.toSquare.x - 1][move.toSquare.y] = move.capturedPiece;

    //             newBoard.enPassant = new Coordinate(move.toSquare.x, move.toSquare.y);
    //         } else if (move.pieceMoved.pieceColor === Color.BLACK) {
    //             newBoard.squares[move.toSquare.x + 1][move.toSquare.y] = move.capturedPiece;

    //             newBoard.enPassant = new Coordinate(move.toSquare.x, move.toSquare.y);
    //         }
    //     }

    //     //*4. if the move was a pawn move of 2 steps, then update the "enPassant" Coordinate attribute
    //     if (move.pieceMoved.isPieceType(PieceType.PAWN)) {
    //         //if white pawn moved from 2nd rank to 4th rank ,or black pawn moved from 7th rank to 5th rank

    //         if (
    //             (move.fromSquare.x === 1 && move.toSquare.x === 3 && move.pieceMoved.pieceColor === Color.WHITE) ||
    //             (move.fromSquare.x === 6 && move.toSquare.x === 4 && move.pieceMoved.pieceColor === Color.BLACK)
    //         )
    //             newBoard.enPassant = null;
    //     }

    //     //*TODO:5. for promotion

    //     //*TODO:6. for castling

    //     //*TODO:7. after making the move check if any castling ability is violated , and update the "castling" attribute of board

    //     return newBoard;
    // }

    /**
     * finds legal moves' list from "fromSquare"
     *
     * @param fromSquare
     * @returns legal moves' list from "fromSquare" : Move[]
     */
    getLegalMovesOfGivenSquare(fromSquare: Coordinate): Move[] {
        if (!this.board) return [];

        return this.board.getLegalMovesOfGivenSquare(fromSquare);
    }

    executeMoveAndMutateGame(move: Move) {
        if (!this.board) return [];

        //*-----------------------------------------FOR TESTING NUMBER OF BOARD POSITIONS UPTO CERTAIN DEPT-------------------------------------------------------------
        // let depth = 2;
        // let countPositionsUptoDepth = this.board.countPositionsUptoDepth(depth);
        // console.log("No of boardPositions upto depth : " + depth + " ply  =   " + countPositionsUptoDepth);
        //*-----------------------------------------FOR TESTING NUMBER OF BOARD POSITIONS UPTO CERTAIN DEPT-------------------------------------------------------------

        this.board = this.board.getNewBoardAfterExecutingMove(move);

        //*add move to moveHistory
        this.moveHistory.push(move);

        if (this.board) console.log("new Board : " + boardToFEN(this.board));
    }
}
