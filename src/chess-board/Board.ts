/*
*Test FEN string for castling : r1b1k2r/p2p4/pq6/8/1P6/R3P3/P1PP4/4K2R w Kkq - 7 33

*/

import { Coordinate } from "./chessUtility";
import Move from "./Move";
import Piece, { Color, PieceType } from "./Pieces";

export type CastlingAvailability = [boolean, boolean, boolean, boolean];

/**
 * *Class Representing a Chess Board
 *
 * *Public member functions :
 * *_____________________________________________________________
 *
 * * 1. isCoordinateSafe(square) : checks if the given Coordinate is inside board or not
 * * 2. isSquareEmpty(square) : checks if the given Coordinate is empty or not
 * * 3. getNewBoard() : creates a newBoard(deep copy) and returns it
 * * 4. getPseudoLegalMovesOfGivenSquare(fromSquare) : gets the pseudo legal moves of a piece at fromSquare
 *
 *
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
        castling: CastlingAvailability = [true, true, true, true],
        enPassant: Coordinate | null = null,
        halfMoveClock: number = 0,
        fullMove: number = 1
    ) {
        this.currentPlayer = currentPlayer;
        this.boardSize = initialPosition.length;
        this.squares = initialPosition.map((arr) => arr.slice());
        this.castling = castling;
        this.enPassant = enPassant;
        this.halfMoveClock = halfMoveClock;
        this.fullMove = fullMove;
    }

    isCoordinateSafe(square: Coordinate) {
        return 0 <= square.x && square.x < (this.boardSize || -100) && 0 <= square.y && square.y < (this.boardSize || -100);
    }

    isSquareEmpty(square: Coordinate) {
        return (
            // this.isCoordinateSafe(square) &&
            this.squares[square.x][square.y].pieceType === PieceType.NONE
        );
    }

    /**
     * Creates a new board by copying the attributes of given "board" as paramater and returns the newBoard
     * @param board
     * @returns new Board Object
     */
    getNewBoard(): Board {
        let newSquares: Piece[][] = [];
        for (let i = 0; i < this.squares.length; i++) {
            newSquares[i] = this.squares[i].slice();
        }

        let currentPlayer = this.currentPlayer === Color.WHITE ? Color.WHITE : Color.BLACK;
        let castling: CastlingAvailability = [this.castling[0], this.castling[1], this.castling[2], this.castling[3]];
        let enPassant = this.enPassant ? new Coordinate(this.enPassant.x, this.enPassant.y) : null;

        return new Board(newSquares, currentPlayer, castling, enPassant, this.halfMoveClock, this.fullMove);
    }

    /**
     *
     * Finds the pseudo legal moves of sliding pieces from "fromSquare" and direction vector "dxy"
     *
     * @param fromSquare
     * @param dxy
     * @returns pseudo legal moves array : Move[]
     */
    private getSlidingPiecePseudoLegalMovesFromDirectionVector(fromSquare: Coordinate, dxy: number[][]): Move[] {
        //if square is not inside board
        if (!this.isCoordinateSafe(fromSquare)) return [];

        let currentPiece = this.squares[fromSquare.x][fromSquare.y];
        let moves: Move[] = [];

        //for each direction check upto which square the sliding piece can go to
        for (let i = 0; i < dxy.length; i++) {
            let toSquare = new Coordinate(fromSquare.x, fromSquare.y);
            while (true) {
                toSquare = new Coordinate(toSquare.x + dxy[i][0], toSquare.y + dxy[i][1]);

                //if toSquare is outside board, then break
                if (!this.isCoordinateSafe(toSquare)) break;

                let pieceAtToSquare = this.squares[toSquare.x][toSquare.y];

                //if there is a same color piece at toSquare, then break
                if (!this.isSquareEmpty(toSquare) && currentPiece?.pieceColor === pieceAtToSquare?.pieceColor) break;

                //add the newSquare as a move
                moves.push(new Move(fromSquare, toSquare, currentPiece, pieceAtToSquare));

                //if there is an opposite color piece at new square then add the square as move and break
                if (!this.isSquareEmpty(toSquare) && currentPiece?.pieceColor !== pieceAtToSquare?.pieceColor) break;
            }
        }

        return moves;
    }

    /**
     *
     * Finds the pseudolegal moves of rook from "fromSquare" coordinate
     * @param fromSquare
     * @returns pseudo legal moves of rook : Move[]
     */
    private getRookPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        //if square is not inside board
        if (!this.isCoordinateSafe(fromSquare)) return [];

        // //if piece at the given square is not rook
        // if (!this.squares[fromSquare.x][fromSquare.y].isPieceType(PieceType.ROOK)) return [];

        //direction vector for rook
        let dxy = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ];

        return this.getSlidingPiecePseudoLegalMovesFromDirectionVector(fromSquare, dxy);
    }

    /**
     *
     * Finds the pseudolegal moves of bishop from "fromSquare" coordinate
     * @param fromSquare
     * @returns pseudo legal moves of bishop : Move[]
     */
    private getBishopPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        //if square is not inside board
        if (!this.isCoordinateSafe(fromSquare)) return [];

        // //if piece at the given square is not rook
        // if (!this.squares[fromSquare.x][fromSquare.y].isPieceType(PieceType.BISHOP)) return [];

        //direction vector for bishop
        let dxy = [
            [-1, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
        ];

        return this.getSlidingPiecePseudoLegalMovesFromDirectionVector(fromSquare, dxy);
    }

    /**
     *
     * Finds the pseudolegal moves of Queen from "fromSquare" coordinate
     * @param fromSquare
     * @returns pseudo legal moves of Queen : Move[]
     */
    private getQueenPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        //if square is not inside board
        if (!this.isCoordinateSafe(fromSquare)) return [];

        //if piece at the given square is not rook
        // if (!this.squares[fromSquare.x][fromSquare.y].isPieceType(PieceType.QUEEN)) return [];

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

        let movesRook = this.getSlidingPiecePseudoLegalMovesFromDirectionVector(fromSquare, dxyRook);

        let movesBishop = this.getSlidingPiecePseudoLegalMovesFromDirectionVector(fromSquare, dxyBishop);

        return [...movesRook, ...movesBishop];
    }

    /**
     *
     * Finds the pseudolegal moves of knight from "fromSquare" coordinate
     * @param fromSquare
     * @returns pseudo legal moves of knight : Move[]
     */
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

        const currentPiece = this.squares[x][y];

        let moves: Move[] = [];
        for (const toSquare of toSquareList) {
            //if the toSquare is inside board and there is no same colored piece on toSquare then add it in moves
            if (this.isCoordinateSafe(toSquare) && currentPiece?.pieceColor !== this.squares[toSquare.x][toSquare.y].pieceColor) {
                moves.push(new Move(fromSquare, toSquare, currentPiece, this.squares[toSquare.x][toSquare.y]));
            }
        }

        return moves;
    }

    private getOpponentPseudoLegalMoves(): Move[] {
        let newBoard = this.getNewBoard();

        // make newBoard's current player as opponent to  get opponent's moves
        newBoard.currentPlayer = this.currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;

        let moves: Move[] = [];
        let n = this.boardSize;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (!this.isSquareEmpty(new Coordinate(i, j)) && newBoard.squares[i][j].pieceColor === newBoard.currentPlayer) {
                    //*remember here to get moves of newBoard, so that, opponent color's moves are generated

                    //* IMPORTANT : pass false as 2nd argument (includeCastlingMoves) , otherwise it will call getKingCastlingMoves() and get stuck in recursive loop
                    moves = [...moves, ...newBoard.getPseudoLegalMovesOfGivenSquare(new Coordinate(i, j), false)];
                }
            }
        }

        return moves;
    }

    private getKingCastlingMoves(): Move[] {
        let isKingSideCastlingPossible: boolean, isQueenSideCastlingPossible: boolean;
        let kingSideRookCoordinate: Coordinate, queenSideRookCoordinate: Coordinate;
        let kingSideInBetweenSquares: Coordinate[], queenSideInBetweenSquares: Coordinate[]; //*squares between king and rook

        let currentPlayerKingCoordinate: Coordinate = new Coordinate(-1, -1);
        let n = this.boardSize ? this.boardSize : -100;
        //*get king coordinate of current player
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (this.squares[i][j].isPieceType(PieceType.KING) && this.squares[i][j].pieceColor === this.currentPlayer) {
                    currentPlayerKingCoordinate = new Coordinate(i, j);
                    break;
                }
            }
        }

        if (this.currentPlayer === Color.WHITE) {
            if (currentPlayerKingCoordinate.x !== 0) return [];

            isKingSideCastlingPossible = this.castling[0];
            isQueenSideCastlingPossible = this.castling[1];

            kingSideRookCoordinate = new Coordinate(0, this.boardSize - 1);
            queenSideRookCoordinate = new Coordinate(0, 0);

            kingSideInBetweenSquares = [new Coordinate(0, 5), new Coordinate(0, 6)];
            queenSideInBetweenSquares = [new Coordinate(0, 3), new Coordinate(0, 2)];
        } else {
            if (currentPlayerKingCoordinate.x !== this.boardSize - 1) return [];

            isKingSideCastlingPossible = this.castling[2];
            isQueenSideCastlingPossible = this.castling[3];

            kingSideRookCoordinate = new Coordinate(this.boardSize - 1, this.boardSize - 1);
            queenSideRookCoordinate = new Coordinate(this.boardSize - 1, 0);

            kingSideInBetweenSquares = [new Coordinate(this.boardSize - 1, 5), new Coordinate(this.boardSize - 1, 6)];
            queenSideInBetweenSquares = [new Coordinate(this.boardSize - 1, 3), new Coordinate(this.boardSize - 1, 2)];
        }

        if (!isKingSideCastlingPossible && !isQueenSideCastlingPossible) return [];

        //*get squares attacked by opponent
        const squaresAttackedByOpponent: Coordinate[] = this.getOpponentPseudoLegalMoves().map((move) => move.toSquare);

        //*if king is in check
        for (const squareAttackedByOpponent of squaresAttackedByOpponent) {
            if (squareAttackedByOpponent.equals(currentPlayerKingCoordinate)) return [];
        }

        let moves: Move[] = [];

        //*check kingSide Castling
        if (isKingSideCastlingPossible) {
            for (const inBetweenSquare of kingSideInBetweenSquares) {
                if (this.isSquareEmpty(inBetweenSquare)) {
                    isKingSideCastlingPossible = false;
                    break;
                }

                for (const squareAttackedByOpponent of squaresAttackedByOpponent) {
                    if (squareAttackedByOpponent.equals(inBetweenSquare)) {
                        isKingSideCastlingPossible = false;
                        break;
                    }
                }
            }

            if (kingSideInBetweenSquares) {
                moves.push(
                    new Move(
                        currentPlayerKingCoordinate,
                        new Coordinate(currentPlayerKingCoordinate.x, currentPlayerKingCoordinate.y + 2),
                        this.squares[currentPlayerKingCoordinate.x][currentPlayerKingCoordinate.y],
                        new Piece(),
                        new Piece(),
                        false,
                        true
                    )
                );
            }
        }

        //*check queen Castling
        if (isQueenSideCastlingPossible) {
            for (const inBetweenSquare of queenSideInBetweenSquares) {
                if (this.isSquareEmpty(inBetweenSquare)) {
                    isQueenSideCastlingPossible = false;
                    break;
                }

                for (const squareAttackedByOpponent of squaresAttackedByOpponent) {
                    if (squareAttackedByOpponent.equals(inBetweenSquare)) {
                        isQueenSideCastlingPossible = false;
                        break;
                    }
                }
            }

            if (isQueenSideCastlingPossible) {
                moves.push(
                    new Move(
                        currentPlayerKingCoordinate,
                        new Coordinate(currentPlayerKingCoordinate.x, currentPlayerKingCoordinate.y - 2),
                        this.squares[currentPlayerKingCoordinate.x][currentPlayerKingCoordinate.y],
                        new Piece(),
                        new Piece(),
                        false,
                        true
                    )
                );
            }
        }

        return moves;
    }

    /**
     *
     * Finds the pseudolegal moves of king from "fromSquare" coordinate.
     * If you do not want to call the getKingCastlingMoves() function , then pass false as value of "includeCastlingMoves"
     *
     * @param fromSquare , includeCastlingMoves(by defaule true)
     * @returns pseudo legal moves of king : Move[]
     */
    //*TODO: castling remaining
    private getKingPseudoLegalMoves(fromSquare: Coordinate, includeCastlingMoves: boolean = true): Move[] {
        if (!this.isCoordinateSafe(fromSquare)) return [];

        let x = fromSquare.x,
            y = fromSquare.y;
        const currentPiece = this.squares[x][y];

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
            if (this.isCoordinateSafe(toSquare) && currentPiece?.pieceColor !== this.squares[toSquare.x][toSquare.y].pieceColor) {
                moves.push(new Move(fromSquare, toSquare, currentPiece, this.squares[toSquare.x][toSquare.y]));
            }
        }

        if (includeCastlingMoves) moves = [...moves, ...this.getKingCastlingMoves()];

        return moves;
    }

    /**
     *
     * Finds the pseudolegal moves of pawn from "fromSquare" coordinate
     * @param fromSquare
     * @returns pseudo legal moves of pawn : Move[]
     */
    private getPawnPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        if (!this.isCoordinateSafe(fromSquare)) return [];

        let x = fromSquare.x,
            y = fromSquare.y;
        const currentPiece = this.squares[x][y];

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
        if (currentPiece?.pieceColor === Color.WHITE) toSquare = new Coordinate(x + 1, y);
        //for black pawn
        else toSquare = new Coordinate(x - 1, y);

        //if the square infront of pawn is inside board
        if (this.isCoordinateSafe(toSquare)) {
            //if square infront of pawn is empty , then it can move to that square
            if (this.isSquareEmpty(toSquare)) {
                moves.push(new Move(fromSquare, toSquare, currentPiece, this.squares[toSquare.x][toSquare.y]));

                //*if the pawn is on 2nd rank for white or on 7th rank for black , it can move 2 steps
                if ((currentPiece?.pieceColor === Color.WHITE && x === 1) || (currentPiece?.pieceColor === Color.BLACK && x === 6)) {
                    //we already checked the first square in front of pawn is empty
                    //only check if the square after 2 step is empty or not
                    if (currentPiece.pieceColor === Color.WHITE) toSquare = new Coordinate(x + 2, y);
                    else toSquare = new Coordinate(x - 2, y);

                    if (this.isSquareEmpty(toSquare)) moves.push(new Move(fromSquare, toSquare, currentPiece, this.squares[toSquare.x][toSquare.y]));
                }
            }

            //*check for captures :_____________________________________________________________________________
            //*Front right square
            if (currentPiece?.pieceColor === Color.WHITE) toSquare = new Coordinate(x + 1, y + 1);
            else toSquare = new Coordinate(x - 1, y - 1);

            if (this.isCoordinateSafe(toSquare)) {
                //if an opposite colored piece is present at front right corner
                if (this.squares[toSquare.x][toSquare.y].pieceColor === currentPiece?.getOppositeColor())
                    moves.push(new Move(fromSquare, toSquare, currentPiece, this.squares[toSquare.x][toSquare.y]));

                //*check if enPassant is possible at the front right square of the pawn
                if (this.enPassant && this.enPassant.equals(toSquare)) {
                    let capturedPieceCoordinate =
                        currentPiece?.pieceColor === Color.WHITE ? new Coordinate(toSquare.x - 1, toSquare.y) : new Coordinate(toSquare.x + 1, toSquare.y);
                    moves.push(
                        new Move(
                            fromSquare,
                            toSquare,
                            currentPiece,
                            /* Here capturedPiece's coordinate is not equal to toSquare  */
                            this.squares[capturedPieceCoordinate.x][capturedPieceCoordinate.y],
                            new Piece() /*Promoted piece is empty*/,
                            true /* tick the "wasEnPassant" as true */
                        )
                    );
                }
            }

            //*Front left square
            if (currentPiece?.pieceColor === Color.WHITE) toSquare = new Coordinate(x + 1, y - 1);
            else toSquare = new Coordinate(x - 1, y + 1);

            if (this.isCoordinateSafe(toSquare)) {
                //if an opposite colored piece is present at front right corner
                if (this.squares[toSquare.x][toSquare.y].pieceColor === currentPiece?.getOppositeColor())
                    moves.push(new Move(fromSquare, toSquare, currentPiece, this.squares[toSquare.x][toSquare.y]));

                //*check if enPassant is possible at the front left square of the pawn
                if (this.enPassant && this.enPassant.equals(toSquare)) {
                    let capturedPieceCoordinate =
                        currentPiece?.pieceColor === Color.WHITE ? new Coordinate(toSquare.x - 1, toSquare.y) : new Coordinate(toSquare.x + 1, toSquare.y);
                    moves.push(
                        new Move(
                            fromSquare,
                            toSquare,
                            currentPiece,
                            /* Here capturedPiece's coordinate is not equal to toSquare  */
                            this.squares[capturedPieceCoordinate.x][capturedPieceCoordinate.y],
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
            if ((move.pieceMoved.pieceColor === Color.WHITE && move.toSquare.x === 7) || (move.pieceMoved.pieceColor === Color.BLACK && move.toSquare.x === 0)) {
                //make the current move as promotion to queen
                newMovesWithPromotions[i].promotedPiece = new Piece(PieceType.QUEEN, move.pieceMoved.pieceColor);

                //and add other moves which will promote the pawn to rook , bishop and knight
                newMovesWithPromotions.push(new Move(move.fromSquare, move.toSquare, move.pieceMoved, move.capturedPiece, new Piece(PieceType.ROOK)));
                newMovesWithPromotions.push(new Move(move.fromSquare, move.toSquare, move.pieceMoved, move.capturedPiece, new Piece(PieceType.BISHOP)));
                newMovesWithPromotions.push(new Move(move.fromSquare, move.toSquare, move.pieceMoved, move.capturedPiece, new Piece(PieceType.KNIGHT)));
            }
        }

        // console.log(`pawn pseudo moves of (${fromSquare.x} , ${fromSquare.y})`);
        // console.log(newMovesWithPromotions);

        return newMovesWithPromotions;
    }

    /**
     *
     * Finds the pseudolegal moves of a piece from "fromSquare" coordinate
     * If you do not want to call the getKingCastlingMoves() function (i.e if u do not want to get castling moves), then pass false as value of "includeCastlingMoves"
     *
     * @param fromSquare , includeCastlingMoves(by defaule true)
     * @returns pseudo legal moves of a piece :Move[]
     */
    getPseudoLegalMovesOfGivenSquare(fromSquare: Coordinate, includeCastlingMoves: boolean = true): Move[] {
        //if fromSquare is not inside board or empty
        if (!this.isCoordinateSafe(fromSquare) || this.isSquareEmpty(fromSquare)) return [];

        let currentPiece = this.squares[fromSquare.x][fromSquare.y];

        //if the piece at fromSquare is not of currentPlayer
        if (currentPiece?.pieceColor !== this.currentPlayer) return [];

        if (currentPiece?.isPieceType(PieceType.BISHOP)) return this.getBishopPseudoLegalMoves(fromSquare);
        else if (currentPiece?.isPieceType(PieceType.KING)) return this.getKingPseudoLegalMoves(fromSquare, includeCastlingMoves);
        else if (currentPiece?.isPieceType(PieceType.KNIGHT)) return this.getKnightPseudoLegalMoves(fromSquare);
        else if (currentPiece?.isPieceType(PieceType.QUEEN)) return this.getQueenPseudoLegalMoves(fromSquare);
        else if (currentPiece?.isPieceType(PieceType.ROOK)) return this.getRookPseudoLegalMoves(fromSquare);
        else if (currentPiece?.isPieceType(PieceType.PAWN)) return this.getPawnPseudoLegalMoves(fromSquare);

        //if anything goes wrong, return empty list
        return [];
    }
}
