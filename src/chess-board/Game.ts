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

    //*TODO:
    //* creates a new copy of board , executes the move,  and returns the new board without mutating the orginal board field , returns null if something goes wrong
    getNewBoardAfterExecutingMove(move: Move): Board | null {
        //to satisfy the null value of this.board
        if (!this.board) return null;

        //*create new board
        let newBoard = this.board.getNewBoard();

        //*-3: make the enPassant attribute of board null before executing move, and if the move causes enPassant , then update it later
        newBoard.enPassant = null;

        //*TODO:-2. Update halfMoveClock and fullMove attributes of board

        //*-1. Change currentPlayer
        newBoard.currentPlayer = newBoard.currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;

        //*0.Add move to moveHistory
        this.moveHistory.push(move);

        //*1.make the fromSquare empty
        newBoard.squares[move.fromSquare.x][move.fromSquare.y] = this.getEmptySquare();

        //*2.put the moved piece at targetSquare
        newBoard.squares[move.toSquare.x][move.toSquare.y] = move.pieceMoved;

        /*
         *3.if the captured piece was at targetSquare, then it would have been removed while putting the moved piece at targetSquare,
         *but if the captured piece was at enPassant square then we have to remove that
         */
        if (move.wasEnPassant) {
            if (move.pieceMoved.pieceColor === Color.WHITE) {
                newBoard.squares[move.toSquare.x - 1][move.toSquare.y] = this.getEmptySquare();
            } else if (move.pieceMoved.pieceColor === Color.BLACK) {
                newBoard.squares[move.toSquare.x + 1][move.toSquare.y] = this.getEmptySquare();
            }
        }

        //*4. after making the move check if it a pawn moved 2 steps, if yes , then update the enPassant Coordinate attribute of board
        if (move.pieceMoved.isPieceType(PieceType.PAWN)) {
            //if white pawn moved from 2nd rank to 4th rank
            if (move.fromSquare.x === 1 && move.toSquare.x === 3 && move.pieceMoved.pieceColor === Color.WHITE)
                newBoard.enPassant = new Coordinate(move.fromSquare.x + 1, move.fromSquare.y);
            //if black pawn moved from 7th rank to 5th rank
            else if (move.fromSquare.x === 6 && move.toSquare.x === 4 && move.pieceMoved.pieceColor === Color.BLACK)
                newBoard.enPassant = new Coordinate(move.fromSquare.x - 1, move.fromSquare.y);
        }

        //*TODO:5. for promotion

        //*TODO:6. for castling

        //*TODO:7. after making the move check if any castling ability is violated , and update the "castling" attribute of board

        // console.log("for move : ");
        // console.log(move);
        // console.log("fen after executing move: ");
        // console.log(boardToFEN(newBoard));

        return newBoard;
    }

    //*TODO:
    //*rolls back the last move of this.board, and returns new board (i mean old board before that move) , without mutating the this.board , returns null if something goes wrong
    rollBackLastMove(): Board | null {
        //to satisfy the null value of this.board
        if (!this.board) return null;

        //*create new board
        let newBoard = this.board.getNewBoard();

        if (this.moveHistory.length === 0) return newBoard;

        //*get the last move
        let move = this.moveHistory[this.moveHistory.length - 1];
        if (!move) return newBoard;

        //*TODO:-2. Update halfMoveClock and fullMove attributes of board

        //*-1. Change currentPlayer
        newBoard.currentPlayer = newBoard.currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;

        //*1.put the moved piece at fromSquare
        newBoard.squares[move.fromSquare.x][move.fromSquare.y] = move.pieceMoved;

        //*make the toSquare empty first, later put capturedPiece if the move was not enPassant --> without making the toSquare empty at first, code was producing bog :)
        newBoard.squares[move.toSquare.x][move.toSquare.y] = this.getEmptySquare();

        //*2.put the captured piece at targetSquare if the move was not enPassant
        if (!move.wasEnPassant) newBoard.squares[move.toSquare.x][move.toSquare.y] = move.capturedPiece;

        //*3. if we roll back enPassant , then put the capturedPiece at correct square, and set the enPassant attribute of board
        if (move.wasEnPassant) {
            if (move.pieceMoved.pieceColor === Color.WHITE) {
                newBoard.squares[move.toSquare.x - 1][move.toSquare.y] = move.capturedPiece;

                newBoard.enPassant = new Coordinate(move.toSquare.x, move.toSquare.y);
            } else if (move.pieceMoved.pieceColor === Color.BLACK) {
                newBoard.squares[move.toSquare.x + 1][move.toSquare.y] = move.capturedPiece;

                newBoard.enPassant = new Coordinate(move.toSquare.x, move.toSquare.y);
            }
        }

        //*4. if the move was a pawn move of 2 steps, then update the "enPassant" Coordinate attribute
        if (move.pieceMoved.isPieceType(PieceType.PAWN)) {
            //if white pawn moved from 2nd rank to 4th rank ,or black pawn moved from 7th rank to 5th rank

            if (
                (move.fromSquare.x === 1 && move.toSquare.x === 3 && move.pieceMoved.pieceColor === Color.WHITE) ||
                (move.fromSquare.x === 6 && move.toSquare.x === 4 && move.pieceMoved.pieceColor === Color.BLACK)
            )
                newBoard.enPassant = null;
        }

        //*TODO:5. for promotion

        //*TODO:6. for castling

        //*TODO:7. after making the move check if any castling ability is violated , and update the "castling" attribute of board

        // console.log("for move : ");
        // console.log(move);
        // console.log("fen after rolling back move: ");
        // console.log(boardToFEN(newBoard));

        return newBoard;
    }

    /**
     * finds legal moves' list from "fromSquare"
     *
     * @param fromSquare
     * @returns legal moves' list from "fromSquare" : Move[]
     */
    getLegalMovesOfGivenSquare(fromSquare: Coordinate): Move[] {
        // console.log("getLegalMovesOfGivenSquare called");

        if (!this.board) return [];

        if (!this.board.isCoordinateSafe(fromSquare)) return [];

        const currentPlayer = this.board?.currentPlayer;
        const opponentPlayer = currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;

        let currentPlayerKingCoordinate: Coordinate = new Coordinate(-1, -1);

        let n = this.board?.boardSize ? this.board.boardSize : -100;

        //*get king coordinate of current player
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (this.board.squares[i][j].isPieceType(PieceType.KING) && this.board.squares[i][j].pieceColor === currentPlayer) {
                    currentPlayerKingCoordinate = new Coordinate(i, j);
                    break;
                }
            }
        }

        let legalMoves: Move[] = [];
        let pseudoLegalMoves = this.board.getPseudoLegalMovesOfGivenSquare(fromSquare);

        /*
            for each pseudo legal moves, execute the move and check if after executig the pseudo legal move any of the oponent's pieces can capture
            my king or not , if no , then include the pseudoLegalMove in legalmoves list
        */
        for (const pseudoLegalMove of pseudoLegalMoves) {
            //*check if using the pseudoLegalMove i can capture opponent's king
            if (pseudoLegalMove.capturedPiece && pseudoLegalMove.capturedPiece.isPieceType(PieceType.KING) && pseudoLegalMove.capturedPiece.pieceColor === opponentPlayer) {
                legalMoves.push(pseudoLegalMove);
                continue;
            }

            let newKingCoordinate = currentPlayerKingCoordinate;

            //*check if the king's coordinate is changed
            if (pseudoLegalMove.pieceMoved.isPieceType(PieceType.KING)) newKingCoordinate = pseudoLegalMove.toSquare;

            //*execute the psuedo legal move (Remember : Dont mutate the this.board)
            let newBoard = this.getNewBoardAfterExecutingMove(pseudoLegalMove);
            if (!newBoard) return [];

            //*check if any of enemy's piece can capture my king or not
            let kingCanBeCaptured = false;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    let opponentPiece = newBoard?.squares[i][j];
                    if (!newBoard?.isSquareEmpty(new Coordinate(i, j)) && opponentPiece?.pieceColor !== currentPlayer) {
                        /*
                         *we dont need to check the castling moves of opponent , because castling moves of opponent can not capture my king
                         *so dont include the castling moves, becaues calling the getKingCastlingMoves() functions many times was causing problem in debugging :)
                         * so pass false as the value of the parameter "includeCastlingMoves" of  getPseudoLegalMovesOfGivenSquare() function
                         */
                        let opponentPseudoLegalMoves = newBoard?.getPseudoLegalMovesOfGivenSquare(new Coordinate(i, j), false);

                        //if any of the opponent's pseudo legal moves can capture the current player's king
                        for (const opponentPseudoLegalMove of opponentPseudoLegalMoves) {
                            // console.log(
                            //     "opponentPseudoLegalMove : pieceType = " +
                            //         opponentPseudoLegalMove.pieceMoved
                            //             .pieceType +
                            //         " , toSquare : (" +
                            //         opponentPseudoLegalMove.toSquare.x +
                            //         ", " +
                            //         opponentPseudoLegalMove.toSquare.y +
                            //         " ) "
                            // );

                            if (opponentPseudoLegalMove.toSquare.equals(newKingCoordinate)) {
                                // console.log("king can be captured");

                                kingCanBeCaptured = true;
                                break;
                            }
                        }

                        if (kingCanBeCaptured) break;
                    }
                }
                if (kingCanBeCaptured) break;
            }

            if (!kingCanBeCaptured) legalMoves.push(pseudoLegalMove);

            // //*roll back the executed pseudoLegalMove (updated : no need to rollback , because we are not mutating the this.board)
            // this.rollBackLastMove();
        }

        //*for testing purpose
        // console.log("pseudoLegal moves : ");
        // console.log(pseudoLegalMoves);

        // console.log("legal moves : ");
        // console.log(legalMoves);

        // let discardedMoves: Move[] = [];
        // for (const pseudoLegalMove of pseudoLegalMoves) {
        //     let currMoveIsDiscarded = true;
        //     for (const legalMove of legalMoves) {
        //         if (pseudoLegalMove.equals(legalMove)) {
        //             currMoveIsDiscarded = false;
        //             break;
        //         }
        //     }
        //     if (currMoveIsDiscarded) discardedMoves.push(pseudoLegalMove);
        // }
        // console.log("discarded Moves : ");
        // console.log(discardedMoves);

        return legalMoves;
    }

    executeMoveAndMutateGame(move: Move) {
        this.board = this.getNewBoardAfterExecutingMove(move);

        //*add move to moveHistory
    }
}
