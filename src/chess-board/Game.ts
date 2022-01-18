import { Board } from "./Board";
import { Coordinate, GameStatus } from "./chessUtility";
import { boardToFEN, FENToBoard, START_BOARD_FEN } from "./FEN";
import Move from "./Move";
import Piece, { Color, PieceType, PIECE_POOL } from "./Pieces";

/**
 ** <------------------------------------------------------:::::::::::::DOCUMENTATION :::::::::::----------------------------------------------------------->
 ** <------------------------------------------------------------------------------------------------------------------------------------------------------->
 *
 * *Game Class : Class representing a chess game
 *
 * *Public member functions :
 * *_____________________________________________________________
 *
 * * 1. getLegalMovesOfGivenSquare(fromSquare: Coordinate): Move[] ---------------->
 *          finds legal moves' list from "fromSquare"
 *
 * * 2. executeMoveAndMutateGame(move: Move) ----------->
 *          executes the given move and mutates the board
 *
 * * 3. isCurrentPlayerKingInCheck(): { isKingInCheck: boolean; kingCoordinate: Coordinate } | null ----->
 *          if current player's king is in check , returns ---> {isKingInCheck : true, kingCoordinate : coordinate of current player's king}
 *          else , returns ---> {isKingInCheck : false, kingCoordinate : (-1,-1)}
 *          if board is null , returns null
 *
 * * 4. getGameStatus(): GameStatus :------->
 *          1. If current player is check mated : returns "GameStatus.CHECKMATE"
 *          2. If current player is stalemated : returns "GameStatus.STALEMATE"
 *          3. Else returns "GameStatus.RUNNING"
 *          4. If board is null, returns null
 *
 *
 ** <------------------------------------------------------------------------------------------------------------------------------------------------------->
 ** <------------------------------------------------------:::::::::::::DOCUMENTATION :::::::::::----------------------------------------------------------->
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

        // console.log("best move : ");
        // console.log(this.board.getBestMove(7));

        // console.log("gameStatus before executing move: " + this.getGameStatus());

        //*-----------------------------------------FOR TESTING NUMBER OF BOARD POSITIONS UPTO CERTAIN DEPT-------------------------------------------------------------

        this.board = this.board.getNewBoardAfterExecutingMove(move);

        //*add move to moveHistory
        this.moveHistory.push(move);

        if (this.board) console.log("new Board : " + boardToFEN(this.board));

        // console.log("gameStatus after executing move: " + this.getGameStatus());
    }

    /**
     *
     * @returns { isKingInCheck: boolean; kingCoordinate: Coordinate }
     * if current player's king is in check , returns ---> {isKingInCheck : true, kingCoordinate : coordinate of current player's king}
     *                                 else , returns ---> {isKingInCheck : false, kingCoordinate : (-1,-1)}
     *                                 if board is null , returns null
     */
    isCurrentPlayerKingInCheck(): { isKingInCheck: boolean; kingCoordinate: Coordinate } | null {
        if (!this.board) return null;
        return this.board?.isCurrentPlayerKingInCheck();
    }

    /**
     *
     * @returns GameStatus
     *  *1. If current player is check mated : returns "GameStatus.CHECKMATE"
     *  *2. If game current player is stalemated : returns "GameStatus.STALEMATE"
     *  *3. Else returns "GameStatus.RUNNING"
     *  *4. If board is null, returns null
     */
    getGameStatus(): GameStatus | null {
        if (!this.board) return null;

        return this.board?.getGameStatus();
    }
}
