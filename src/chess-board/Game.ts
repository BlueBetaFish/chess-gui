import { getEmitHelpers } from "typescript";
import { Board } from "./Board";
import { Coordinate } from "./chessUtility";
import { boardToFEN, FENToBoard, START_BOARD_FEN } from "./FEN";
import Move from "./Move";
import Piece, { Color, PieceType, PIECE_POOL } from "./Pieces";

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

    private isCoordinateSafe(square: Coordinate) {
        return (
            0 <= square.x &&
            square.x < (this.board?.boardSize || -100) &&
            0 <= square.y &&
            square.y < (this.board?.boardSize || -100)
        );
    }

    private isSquareEmpty(square: Coordinate) {
        return (
            // this.isCoordinateSafe(square) &&
            this.board?.squares[square.x][square.y].pieceType === PieceType.NONE
        );
    }

    private getSlidingPiecePseudoLegalMovesFromDirectionVector(
        fromSquare: Coordinate,
        dxy: number[][]
    ): Move[] {
        //if square is not inside board
        if (!this.isCoordinateSafe(fromSquare)) return [];

        let currentPiece = this.board?.squares[fromSquare.x][fromSquare.y];
        let moves: Move[] = [];

        //for each direction check upto which square the sliding piece can go to
        for (let i = 0; i < dxy.length; i++) {
            let toSquare = new Coordinate(fromSquare.x, fromSquare.y);
            while (true) {
                toSquare = new Coordinate(
                    toSquare.x + dxy[i][0],
                    toSquare.y + dxy[i][1]
                );

                //if toSquare is outside board, then break
                if (!this.isCoordinateSafe(toSquare)) break;

                let pieceAtToSquare =
                    this.board?.squares[toSquare.x][toSquare.y];

                //if there is a same color piece at toSquare, then break
                if (
                    !this.isSquareEmpty(toSquare) &&
                    currentPiece?.pieceColor === pieceAtToSquare?.pieceColor
                )
                    break;

                //add the newSquare as a move
                moves.push(
                    new Move(
                        fromSquare,
                        toSquare,
                        currentPiece,
                        pieceAtToSquare
                    )
                );

                //if there is an opposite color piece at new square then add the square as move and break
                if (
                    !this.isSquareEmpty(toSquare) &&
                    currentPiece?.pieceColor !== pieceAtToSquare?.pieceColor
                )
                    break;
            }
        }

        return moves;
    }

    private getRookPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        //if square is not inside board
        if (!this.isCoordinateSafe(fromSquare)) return [];

        // //if piece at the given square is not rook
        // if (
        //     !this.board?.squares[fromSquare.x][fromSquare.y].isPieceType(
        //         PieceType.ROOK
        //     )
        // )
        //     return [];

        //direction vector for rook
        let dxy = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ];

        return this.getSlidingPiecePseudoLegalMovesFromDirectionVector(
            fromSquare,
            dxy
        );
    }

    private getBishopPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        //if square is not inside board
        if (!this.isCoordinateSafe(fromSquare)) return [];

        // //if piece at the given square is not rook
        // if (
        //     !this.board?.squares[fromSquare.x][fromSquare.y].isPieceType(
        //         PieceType.BISHOP
        //     )
        // )
        //     return [];

        //direction vector for bishop
        let dxy = [
            [-1, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
        ];

        return this.getSlidingPiecePseudoLegalMovesFromDirectionVector(
            fromSquare,
            dxy
        );
    }

    private getQueenPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        //if square is not inside board
        if (!this.isCoordinateSafe(fromSquare)) return [];

        // //if piece at the given square is not rook
        // if (
        //     !this.board?.squares[fromSquare.x][fromSquare.y].isPieceType(
        //         PieceType.QUEEN
        //     )
        // )
        //     return [];

        //direction vector for rook
        let dxyRook = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ];

        //direction vector for bishop
        let dxyBishop = [
            [-1, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
        ];

        let movesRook = this.getSlidingPiecePseudoLegalMovesFromDirectionVector(
            fromSquare,
            dxyRook
        );

        let movesBishop =
            this.getSlidingPiecePseudoLegalMovesFromDirectionVector(
                fromSquare,
                dxyBishop
            );

        return [...movesRook, ...movesBishop];
    }

    private getKnightPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        if (!this.isCoordinateSafe(fromSquare)) return [];

        let x = fromSquare.x,
            y = fromSquare.y;

        //knight moves in L shape
        let toSquareList = [
            new Coordinate(x - 2, y - 1),
            new Coordinate(x - 2, y + 1),
            new Coordinate(x - 1, y + 2),
            new Coordinate(x + 1, y + 2),
            new Coordinate(x + 2, y + 1),
            new Coordinate(x + 2, y - 1),
            new Coordinate(x + 1, y - 2),
            new Coordinate(x - 1, y - 2),
        ];

        const currentPiece = this.board?.squares[x][y];

        let moves: Move[] = [];
        for (const toSquare of toSquareList) {
            //if the toSquare is inside board and there is no same colored piece on toSquare then add it in moves
            if (
                this.isCoordinateSafe(toSquare) &&
                currentPiece?.pieceColor !==
                    this.board?.squares[toSquare.x][toSquare.y].pieceColor
            ) {
                moves.push(
                    new Move(
                        fromSquare,
                        toSquare,
                        currentPiece,
                        this.board?.squares[toSquare.x][toSquare.y]
                    )
                );
            }
        }

        return moves;
    }

    //*TODO: castling remaining

    private getKingPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        if (!this.isCoordinateSafe(fromSquare)) return [];

        let x = fromSquare.x,
            y = fromSquare.y;
        const currentPiece = this.board?.squares[x][y];

        let toSquareList = [
            new Coordinate(x - 1, y - 1),
            new Coordinate(x - 1, y),
            new Coordinate(x - 1, y + 1),
            new Coordinate(x, y + 1),
            new Coordinate(x + 1, y + 1),
            new Coordinate(x + 1, y),
            new Coordinate(x + 1, y - 1),
            new Coordinate(x, y - 1),
        ];

        let moves: Move[] = [];
        for (const toSquare of toSquareList) {
            //if the toSquare is inside board and there is no same colored piece on toSquare then add it in moves
            if (
                this.isCoordinateSafe(toSquare) &&
                currentPiece?.pieceColor !==
                    this.board?.squares[toSquare.x][toSquare.y].pieceColor
            ) {
                moves.push(
                    new Move(
                        fromSquare,
                        toSquare,
                        currentPiece,
                        this.board?.squares[toSquare.x][toSquare.y]
                    )
                );
            }
        }

        return moves;
    }

    //*TODO: pawn moves for Black pawns
    private getPawnPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        if (!this.isCoordinateSafe(fromSquare)) return [];

        let x = fromSquare.x,
            y = fromSquare.y;
        const currentPiece = this.board?.squares[x][y];

        let moves: Move[] = [];

        /*
        *White Pawn : 
            Case 1 (Pawn is on 2nd rank): can move from i-th rank to (i+1)-th rank or (i+2)-th rank
            Case 2 (Pawn is on > 2nd rank) : can move from i-th rank to only (i+1)-th rank
        
        *Black Pawn : 
            Case 1 (Pawn is on 7-th rank): can move from i-th rank to (i-1)-th rank or (i-2)-th rank
            Case 2 (Pawn is on < 7-th rank) : can move from i-th rank to only (i-1)-th rank
    
        *Corner Cases :
            1. Check promotion : Done 
            2. Check En passant : DONE
        */

        let toSquare: Coordinate;

        //*get the square infront of pawn in 1 step
        if (currentPiece?.pieceColor === Color.WHITE)
            toSquare = new Coordinate(x + 1, y);
        //for black pawn
        else toSquare = new Coordinate(x - 1, y);

        //if the square infront of pawn is inside board
        if (this.isCoordinateSafe(toSquare)) {
            //if square infront of pawn is empty , then it can move to that square
            if (this.isSquareEmpty(toSquare)) {
                moves.push(
                    new Move(
                        fromSquare,
                        toSquare,
                        currentPiece,
                        this.board?.squares[toSquare.x][toSquare.y]
                    )
                );

                //*if the pawn is on 2nd rank for white or on 7th rank for black , it can move 2 steps
                if (
                    (currentPiece?.pieceColor === Color.WHITE && x === 1) ||
                    (currentPiece?.pieceColor === Color.BLACK && x === 6)
                ) {
                    //we already checked the first square in front of pawn is empty
                    //only check if the square after 2 step is empty or not
                    if (currentPiece.pieceColor === Color.WHITE)
                        toSquare = new Coordinate(x + 2, y);
                    else toSquare = new Coordinate(x - 2, y);

                    if (this.isSquareEmpty(toSquare))
                        moves.push(
                            new Move(
                                fromSquare,
                                toSquare,
                                currentPiece,
                                this.board?.squares[toSquare.x][toSquare.y]
                            )
                        );
                }
            }

            //*check for captures :_____________________________________________________________________________
            //*Front right square
            if (currentPiece?.pieceColor === Color.WHITE)
                toSquare = new Coordinate(x + 1, y + 1);
            else toSquare = new Coordinate(x - 1, y - 1);

            if (this.isCoordinateSafe(toSquare)) {
                //if an opposite colored piece is present at front right corner
                if (
                    this.board?.squares[toSquare.x][toSquare.y].pieceColor ===
                    currentPiece?.getOppositeColor()
                )
                    moves.push(
                        new Move(
                            fromSquare,
                            toSquare,
                            currentPiece,
                            this.board?.squares[toSquare.x][toSquare.y]
                        )
                    );

                //*check if enPassant is possible at the front right square of the pawn
                if (
                    this.board &&
                    this.board?.enPassant &&
                    this.board.enPassant.equals(toSquare)
                ) {
                    let capturedPieceCoordinate =
                        currentPiece?.pieceColor === Color.WHITE
                            ? new Coordinate(toSquare.x - 1, toSquare.y)
                            : new Coordinate(toSquare.x + 1, toSquare.y);
                    moves.push(
                        new Move(
                            fromSquare,
                            toSquare,
                            currentPiece,
                            /* Here capturedPiece's coordinate is not equal to toSquare  */
                            this.board?.squares[capturedPieceCoordinate.x][
                                capturedPieceCoordinate.y
                            ],
                            new Piece() /*Promoted piece is empty*/,
                            true /* tick the "wasEnPassant" as true */
                        )
                    );
                }
            }

            //*Front left square
            if (currentPiece?.pieceColor === Color.WHITE)
                toSquare = new Coordinate(x + 1, y - 1);
            else toSquare = new Coordinate(x - 1, y + 1);

            if (this.isCoordinateSafe(toSquare)) {
                //if an opposite colored piece is present at front right corner
                if (
                    this.board?.squares[toSquare.x][toSquare.y].pieceColor ===
                    currentPiece?.getOppositeColor()
                )
                    moves.push(
                        new Move(
                            fromSquare,
                            toSquare,
                            currentPiece,
                            this.board?.squares[toSquare.x][toSquare.y]
                        )
                    );

                //*check if enPassant is possible at the front left square of the pawn
                if (
                    this.board?.enPassant &&
                    this.board.enPassant.equals(toSquare)
                ) {
                    let capturedPieceCoordinate =
                        currentPiece?.pieceColor === Color.WHITE
                            ? new Coordinate(toSquare.x - 1, toSquare.y)
                            : new Coordinate(toSquare.x + 1, toSquare.y);
                    moves.push(
                        new Move(
                            fromSquare,
                            toSquare,
                            currentPiece,
                            /* Here capturedPiece's coordinate is not equal to toSquare  */
                            this.board?.squares[capturedPieceCoordinate.x][
                                capturedPieceCoordinate.y
                            ],
                            new Piece() /*Promoted piece is empty*/,
                            true /* tick the "wasEnPassant" as true */
                        )
                    );
                }
            }
        }

        // console.log(
        //     `pawn pseudo moves without promotion of (${fromSquare.x} , ${fromSquare.y})`
        // );
        // console.log(moves);

        //*check for promotions : if the toSquare of any move is the last rank then add promotion (for testing purpose now , the pawn is promoted to queen)
        let newMovesWithPromotions = [...moves];

        for (let i = 0; i < moves.length; i++) {
            let move = moves[i];

            //if the moved pawn is white and toSquare is 8-th rank || the moved pawn is black and toSquare is 1-st rank
            if (
                (move.pieceMoved.pieceColor === Color.WHITE &&
                    move.toSquare.x === 7) ||
                (move.pieceMoved.pieceColor === Color.BLACK &&
                    move.toSquare.x === 0)
            ) {
                //make the current move as promotion to queen
                newMovesWithPromotions[i].promotedPiece = new Piece(
                    PieceType.QUEEN,
                    move.pieceMoved.pieceColor
                );

                //and add other moves which will promote the pawn to rook , bishop and knight
                newMovesWithPromotions.push(
                    new Move(
                        move.fromSquare,
                        move.toSquare,
                        move.pieceMoved,
                        move.capturedPiece,
                        new Piece(PieceType.ROOK)
                    )
                );
                newMovesWithPromotions.push(
                    new Move(
                        move.fromSquare,
                        move.toSquare,
                        move.pieceMoved,
                        move.capturedPiece,
                        new Piece(PieceType.BISHOP)
                    )
                );
                newMovesWithPromotions.push(
                    new Move(
                        move.fromSquare,
                        move.toSquare,
                        move.pieceMoved,
                        move.capturedPiece,
                        new Piece(PieceType.KNIGHT)
                    )
                );
            }
        }

        // console.log(`pawn pseudo moves of (${fromSquare.x} , ${fromSquare.y})`);
        // console.log(newMovesWithPromotions);

        return newMovesWithPromotions;
    }

    getPseudoLegalMovesOfGivenSquare(fromSquare: Coordinate): Move[] {
        if (!this.board) return [];

        //if fromSquare is not inside board or empty
        if (
            !this.isCoordinateSafe(fromSquare) ||
            this.isSquareEmpty(fromSquare)
        )
            return [];

        let currentPiece = this.board?.squares[fromSquare.x][fromSquare.y];

        //*TODO: uncomment this after testing
        //if the piece at fromSquare is not of currentPlayer
        if (currentPiece?.pieceColor !== this.board.currentPlayer) return [];

        if (currentPiece?.isPieceType(PieceType.BISHOP))
            return this.getBishopPseudoLegalMoves(fromSquare);
        else if (currentPiece?.isPieceType(PieceType.KING))
            return this.getKingPseudoLegalMoves(fromSquare);
        else if (currentPiece?.isPieceType(PieceType.KNIGHT))
            return this.getKnightPseudoLegalMoves(fromSquare);
        else if (currentPiece?.isPieceType(PieceType.QUEEN))
            return this.getQueenPseudoLegalMoves(fromSquare);
        else if (currentPiece?.isPieceType(PieceType.ROOK))
            return this.getRookPseudoLegalMoves(fromSquare);
        else if (currentPiece?.isPieceType(PieceType.PAWN))
            return this.getPawnPseudoLegalMoves(fromSquare);

        //if anything goes wrong, return empty list
        return [];
    }

    //*TODO:
    //* execute the move, update the board, and return a new board
    executeMove(move: Move): Board | null {
        //to satisfy the null value of this.board
        if (!this.board) return null;

        //*TODO:-2. Update halfMoveClock and fullMove attributes of board

        //*-1. Change currentPlayer
        //*TODO: uncomment this after testing
        this.board.currentPlayer =
            this.board.currentPlayer === Color.WHITE
                ? Color.BLACK
                : Color.WHITE;

        //*0.Add move to moveHistory
        this.moveHistory.push(move);

        //*1.make the fromSquare empty
        this.board.squares[move.fromSquare.x][move.fromSquare.y] =
            this.getEmptySquare();

        //*2.put the moved piece at targetSquare
        this.board.squares[move.toSquare.x][move.toSquare.y] = move.pieceMoved;

        /*
         *3.if the captured piece was at targetSquare, then it would have been removed while putting the moved piece at targetSquare,
         *but if the captured piece was at enPassant square then we have to remove that
         */
        if (move.wasEnPassant) {
            if (move.pieceMoved.pieceColor === Color.WHITE) {
                this.board.squares[move.toSquare.x - 1][move.toSquare.y] =
                    this.getEmptySquare();
            } else if (move.pieceMoved.pieceColor === Color.BLACK) {
                this.board.squares[move.toSquare.x + 1][move.toSquare.y] =
                    this.getEmptySquare();
            }
        }

        //*4. after making the move check if it a pawn moved 2 steps, if yes , then update the enPassant Coordinate attribute of board
        if (move.pieceMoved.isPieceType(PieceType.PAWN)) {
            //if white pawn moved from 2nd rank to 4th rank
            if (
                move.fromSquare.x === 1 &&
                move.toSquare.x === 3 &&
                move.pieceMoved.pieceColor === Color.WHITE
            )
                this.board.enPassant = new Coordinate(
                    move.fromSquare.x + 1,
                    move.fromSquare.y
                );
            //if black pawn moved from 7th rank to 5th rank
            else if (
                move.fromSquare.x === 6 &&
                move.toSquare.x === 4 &&
                move.pieceMoved.pieceColor === Color.BLACK
            )
                this.board.enPassant = new Coordinate(
                    move.fromSquare.x - 1,
                    move.fromSquare.y
                );
        }

        //*TODO:5. for promotion

        //*TODO:6. for castling

        //*TODO:7. after making the move check if any castling ability is violated , and update the "castling" attribute of board

        // console.log("for move : ");
        // console.log(move);
        // console.log("fen after executing move: ");
        // console.log(boardToFEN(this.board));

        return this.board.getNewBoard();
    }

    //*TODO:
    //roll back the move, update the board and return new board
    rollBackMove(move: Move): Board | null {
        //to satisfy the null value of this.board
        if (!this.board) return null;

        //*TODO:-2. Update halfMoveClock and fullMove attributes of board

        //*-1. Change currentPlayer
        //*TODO: uncomment this after testing
        this.board.currentPlayer =
            this.board.currentPlayer === Color.WHITE
                ? Color.BLACK
                : Color.WHITE;

        //*0.Remove last move from moveHistory
        this.moveHistory.pop();

        //*1.put the move piece at fromSquare
        this.board.squares[move.fromSquare.x][move.fromSquare.y] =
            move.pieceMoved;

        //*2.put the captured at targetSquare if the move was not enPassant
        if (!move.wasEnPassant)
            this.board.squares[move.toSquare.x][move.toSquare.y] =
                move.capturedPiece;
        //*3. if move was enPassant , then put the capturedPiece at correct square
        else {
            if (move.pieceMoved.pieceColor === Color.WHITE) {
                this.board.squares[move.toSquare.x - 1][move.toSquare.y] =
                    move.capturedPiece;
            } else if (move.pieceMoved.pieceColor === Color.BLACK) {
                this.board.squares[move.toSquare.x + 1][move.toSquare.y] =
                    move.capturedPiece;
            }
        }

        //*4. if the move was a pawn move of 2 steps, then update the "enPassant" Coordinate attribute
        if (move.pieceMoved.isPieceType(PieceType.PAWN)) {
            //if white pawn moved from 2nd rank to 4th rank ,or black pawn moved from 7th rank to 5th rank

            if (
                (move.fromSquare.x === 1 &&
                    move.toSquare.x === 3 &&
                    move.pieceMoved.pieceColor === Color.WHITE) ||
                (move.fromSquare.x === 6 &&
                    move.toSquare.x === 4 &&
                    move.pieceMoved.pieceColor === Color.BLACK)
            )
                this.board.enPassant = null;
        }

        //*TODO:5. for promotion

        //*TODO:6. for castling

        //*TODO:7. after making the move check if any castling ability is violated , and update the "castling" attribute of board

        console.log("for move : ");
        console.log(move);
        console.log("fen after rolling back move: ");
        console.log(boardToFEN(this.board));

        return this.board.getNewBoard();
    }

    //*TODO: extract the legal moves from pseudo legal moves
    getLegalMovesOfGivenSquare(fromSquare: Coordinate): Move[] {
        // console.log("getLegalMovesOfGivenSquare called");

        if (!this.board) return [];

        if (!this.isCoordinateSafe(fromSquare)) return [];

        const currentPlayer = this.board?.currentPlayer;
        let currentPlayerKingCoordinate: Coordinate = new Coordinate(-1, -1);

        let n = this.board?.boardSize ? this.board.boardSize : -100;

        //*get king coordinate of current player
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (
                    this.board.squares[i][j].isPieceType(PieceType.KING) &&
                    this.board.squares[i][j].pieceColor === currentPlayer
                ) {
                    currentPlayerKingCoordinate = new Coordinate(i, j);
                    break;
                }
            }
        }

        let legalMoves: Move[] = [];
        let pseudoLegalMoves =
            this.getPseudoLegalMovesOfGivenSquare(fromSquare);

        console.log(
            `king coordinate : (${currentPlayerKingCoordinate.x} , ${currentPlayerKingCoordinate.y})`
        );

        // console.log("pseudo legal moves : ");
        // console.log(pseudoLegalMoves);
        // // return pseudoLegalMoves;

        /*
            for each pseudo legal moves, execute the move and check if after executig the pseudo legal move any of the oponent's pieces can capture
            my king or not , if no , then include the pseudoLegalMove in legalmoves list
        */
        for (const pseudoLegalMove of pseudoLegalMoves) {
            let newKingCoordinate = currentPlayerKingCoordinate;

            //*check if the king's coordinate is changed
            if (pseudoLegalMove.pieceMoved.isPieceType(PieceType.KING))
                newKingCoordinate = pseudoLegalMove.toSquare;

            //*execute the psuedo legal move
            this.executeMove(pseudoLegalMove);

            //*check if any of enemy's piece can capture my king or not
            let kingCanBeCaptured = false;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    let opponentPiece = this.board?.squares[i][j];
                    if (
                        !this.isSquareEmpty(new Coordinate(i, j)) &&
                        opponentPiece?.pieceColor !== currentPlayer
                    ) {
                        let opponentPseudoLegalMoves =
                            this.getPseudoLegalMovesOfGivenSquare(
                                new Coordinate(i, j)
                            );

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

                            if (
                                opponentPseudoLegalMove.toSquare.equals(
                                    newKingCoordinate
                                )
                            ) {
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

            //*roll back the executed pseudoLegalMove
            this.rollBackMove(pseudoLegalMove);
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
}
