/*
*Test FEN string for castling : r1b1k2r/p2p4/pq6/8/1P6/R3P3/P1PP4/4K2R w Kkq - 7 33

*/

import { Coordinate } from "./chessUtility";
import { boardToFEN } from "./FEN";
import Move from "./Move";
import Piece, { Color, PieceType } from "./Pieces";

export type CastlingAvailability = [boolean, boolean, boolean, boolean];
export enum GameStatus {
    CHECKMATE = "CHECKMATE",
    STALEMATE = "STALEMATE",
    RUNNING = "RUNNING",
}

/**
 ** <------------------------------------------------------:::::::::::::DOCUMENTATION :::::::::::----------------------------------------------------------->
 ** <------------------------------------------------------------------------------------------------------------------------------------------------------->
 *
 * *Class Representing a Chess Board
 *
 * *Public member functions :
 * *_____________________________________________________________
 *
 * * 1. isCoordinateSafe(square: Coordinate): boolean ----------------------->
 *          checks if the given Coordinate is inside board or not
 *
 * * 2. isSquareEmpty(square: Coordinate): boolean -------------------------->
 *          checks if the given Coordinate is empty or not
 *
 * * 3. getNewBoard(): Board ------------------------------------------------>
 *          creates a newBoard(deep copy) and returns it
 *
 * * 4. getPseudoLegalMovesOfGivenSquare(fromSquare: Coordinate): Move[]----->
 *          gets the pseudo legal moves of a piece at fromSquare
 *
 * * 5. getNewBoardAfterExecutingMove(move: Move): Board | null ------------->
 *          creates a new copy of board , executes the move,  and returns the new board without mutating the orginal board field , returns null if something goes wrong
 *
 * * 6. getLegalMovesOfGivenSquare(fromSquare: Coordinate): Move[] ---------->
 *          finds legal moves' list from "fromSquare"
 *
 * * 7. getAllLegalMovesOfCurrentPlayer(): Move[] --------------------------->
 *          finds all legal moves of all pieces of current player
 *
 * * 8. isCurrentPlayerKingInCheck(): { isKingInCheck: boolean; kingCoordinate: Coordinate } ----->
 *          if current player's king is in check , returns ---> {isKingInCheck : true, kingCoordinate : coordinate of current player's king}
 *          else , returns ---> {isKingInCheck : false, kingCoordinate : (-1,-1)}
 *
 * * 9. getGameStatus(): GameStatus :------->
 *          1. If current player is check mated : returns "GameStatus.CHECKMATE"
 *          2. If game current player is stalemated : returns "GameStatus.STALEMATE"
 *          3. Else returns "GameStatus.RUNNING"
 *
 *  * 10. countPositionsUptoDepth(depth: number): number :-------------->
 *          number of board positions(need not necessarily be distinct) upto given depth(ply)
 *
 *
 ** <------------------------------------------------------------------------------------------------------------------------------------------------------->
 ** <------------------------------------------------------:::::::::::::DOCUMENTATION :::::::::::----------------------------------------------------------->
 */

export class Board {
    boardSize: number;
    squares: Piece[][];
    currentPlayer: Color;
    //CastlingAvailability Convention : [WhiteKingSide, WhiteQueenSide, BlackKingSide, BlackQueenSide]
    castling: CastlingAvailability;
    enPassant: Coordinate | null;
    halfMoveClock: number;
    fullMove: number;

    /*
    *PROBLEM :
        if i declare "currentPlayerLegalMoves: Move[][][] | null[][];"
        then   "if(this.currentPlayerLegalMoves[i][j]) allLegalMoves = [...allLegalMoves, ...this.currentPlayerLegalMoves[i][j]];"  is still telling that
            this.currentPlayerLegalMoves[i][j] is possibly null  , although i am using the if() condition before
        
        So i delcared      "currentPlayerLegalMoves: Move[][][] ;" instead of "currentPlayerLegalMoves: Move[][][]  | null[][];"
    */
    currentPlayerLegalMoves: Move[][][];

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

        this.currentPlayerLegalMoves = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.currentPlayerLegalMoves[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.currentPlayerLegalMoves[i][j] = [];
            }
        }
    }

    /**
     *
     * @param square
     * @returns checks if given square is inside board or not
     */
    isCoordinateSafe(square: Coordinate): boolean {
        return 0 <= square.x && square.x < (this.boardSize || -100) && 0 <= square.y && square.y < (this.boardSize || -100);
    }

    /**
     *
     * @param square
     * @returns checks if the given square is empty or not
     */
    isSquareEmpty(square: Coordinate): boolean {
        return (
            // this.isCoordinateSafe(square) &&
            this.squares[square.x][square.y].pieceType === PieceType.NONE
        );
    }

    private getEmptySquare() {
        return new Piece();
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

    //*Gets the pseudo legal moves of opponent exluding castling moves
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
        // console.log("getkingCastlingMoves called for fen : " + boardToFEN(this));

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

        // console.log("squares attacked by opponent : ");
        // console.log(squaresAttackedByOpponent);

        //*if king is in check
        for (const squareAttackedByOpponent of squaresAttackedByOpponent) {
            if (squareAttackedByOpponent.equals(currentPlayerKingCoordinate)) return [];
        }

        let moves: Move[] = [];

        //*check kingSide Castling
        if (isKingSideCastlingPossible) {
            for (const inBetweenSquare of kingSideInBetweenSquares) {
                if (!this.isSquareEmpty(inBetweenSquare)) {
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

            if (isKingSideCastlingPossible) {
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
            //*__________________________________________________________________________________________
            //*IMPORTANT : check if the extra square of knight's position is empty or not. It was not included in "queenSideInBetweenSquares" .
            //*__________________________________________________________________________________________
            if (!this.isSquareEmpty(new Coordinate(currentPlayerKingCoordinate.x, 1))) {
                isQueenSideCastlingPossible = false;
            } else {
                for (const inBetweenSquare of queenSideInBetweenSquares) {
                    if (!this.isSquareEmpty(inBetweenSquare)) {
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

        //*check for promotions : if the toSquare of any move is the last rank then add promotion (for testing purpose now , the pawn is promoted to queen)
        let newMovesWithPromotions = [...moves];

        for (let i = 0; i < moves.length; i++) {
            let move = moves[i];

            //if the moved pawn is white and toSquare is 8-th rank || the moved pawn is black and toSquare is 1-st rank
            if ((move.pieceMoved.pieceColor === Color.WHITE && move.toSquare.x === 7) || (move.pieceMoved.pieceColor === Color.BLACK && move.toSquare.x === 0)) {
                // make the current move as promotion to queen
                newMovesWithPromotions[i].promotedPiece = new Piece(PieceType.QUEEN, move.pieceMoved.pieceColor);

                //and add other moves which will promote the pawn to rook , bishop and knight
                newMovesWithPromotions.push(new Move(move.fromSquare, move.toSquare, move.pieceMoved, move.capturedPiece, new Piece(PieceType.ROOK, currentPiece.pieceColor)));
                newMovesWithPromotions.push(new Move(move.fromSquare, move.toSquare, move.pieceMoved, move.capturedPiece, new Piece(PieceType.KNIGHT, currentPiece.pieceColor)));
                newMovesWithPromotions.push(new Move(move.fromSquare, move.toSquare, move.pieceMoved, move.capturedPiece, new Piece(PieceType.BISHOP, currentPiece.pieceColor)));
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

    //*TODO:
    //* creates a new copy of board , executes the move,  and returns the new board without mutating the orginal board field , returns null if something goes wrong
    getNewBoardAfterExecutingMove(move: Move): Board | null {
        //*create new board
        let newBoard = this.getNewBoard();

        //*-3: make the enPassant attribute of board null before executing move, and if the move causes enPassant , then update it later
        newBoard.enPassant = null;

        //*TODO:-2. Update halfMoveClock and fullMove attributes of board

        // //*0.Add move to moveHistory
        // this.moveHistory.push(move); //dont add move in movehistory inside this function

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
        if (move.promotedPiece && move.promotedPiece.pieceType != PieceType.NONE) {
            newBoard.squares[move.toSquare.x][move.toSquare.y] = move.promotedPiece;
        }

        //*6. for castling : remove the rook from its initial position and put it in castled position
        if (move.wasCastle) {
            // console.log("executing castling move: for fen : " + boardToFEN(this.board));
            // console.log("move : ");
            // console.log(move);

            //*move the rook to the required square
            let rookInitialCoordinate;
            let rookTargetCoordinate;

            //*for king side castling
            if (move.toSquare.y === 6) {
                rookInitialCoordinate = new Coordinate(move.toSquare.x, newBoard.boardSize - 1);
                rookTargetCoordinate = new Coordinate(move.toSquare.x, move.toSquare.y - 1);
            }
            //*for queen side castling
            else if (move.toSquare.y === 2) {
                rookInitialCoordinate = new Coordinate(move.toSquare.x, 0);
                rookTargetCoordinate = new Coordinate(move.toSquare.x, move.toSquare.y + 1);
            }

            //*put the rook at its correct position
            if (rookInitialCoordinate && rookTargetCoordinate) {
                newBoard.squares[rookTargetCoordinate.x][rookTargetCoordinate.y] = newBoard.squares[rookInitialCoordinate.x][rookInitialCoordinate.y];
                newBoard.squares[rookInitialCoordinate.x][rookInitialCoordinate.y] = this.getEmptySquare();
            }
        }

        //*7. after making the move check if any castling ability is violated , and update the "castling" attribute of board
        //*for white
        if (newBoard.currentPlayer === Color.WHITE) {
            if (move.pieceMoved.isPieceType(PieceType.KING)) {
                newBoard.castling[0] = newBoard.castling[1] = false;
            } else {
                //*--------------------------------------------for king side----------------------------------------------------------------
                //*if currentPlayer moves rook
                if (move.fromSquare.equals(new Coordinate(0, newBoard.boardSize - 1))) newBoard.castling[0] = false;

                //*if i capture opponent's rook
                if (move.toSquare.equals(new Coordinate(newBoard.boardSize - 1, newBoard.boardSize - 1))) newBoard.castling[2] = false;

                //*--------------------------------------------for queen side----------------------------------------------------------------
                //*if currentPlayer moves rook
                if (move.fromSquare.equals(new Coordinate(0, 0))) newBoard.castling[1] = false;

                //*if i capture opponent's rook
                if (move.toSquare.equals(new Coordinate(newBoard.boardSize - 1, 0))) newBoard.castling[3] = false;
            }
        }
        //*for black
        else {
            if (move.pieceMoved.isPieceType(PieceType.KING)) {
                newBoard.castling[2] = newBoard.castling[3] = false;
            } else {
                //*--------------------------------------------for king side----------------------------------------------------------------
                //*if currentPlayer moves rook
                if (move.fromSquare.equals(new Coordinate(newBoard.boardSize - 1, newBoard.boardSize - 1))) newBoard.castling[2] = false;

                //*if i capture opponent's rook
                if (move.toSquare.equals(new Coordinate(0, newBoard.boardSize - 1))) newBoard.castling[0] = false;

                //*--------------------------------------------for queen side----------------------------------------------------------------
                //*if currentPlayer moves rook
                if (move.fromSquare.equals(new Coordinate(newBoard.boardSize - 1, 0))) newBoard.castling[3] = false;

                //*if i capture opponent's rook
                if (move.toSquare.equals(new Coordinate(0, 0))) newBoard.castling[1] = false;
            }
        }

        //*-1. Change currentPlayer
        newBoard.currentPlayer = newBoard.currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;

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

        if (!this.isCoordinateSafe(fromSquare)) return [];

        //* if currentPlayerLegalMoves[i][j] was not cached before, then call the function to find moves, and cache
        /*
            *PROBLEM :
                if i declare "currentPlayerLegalMoves: Move[][][] | null[][];"
                then   "if(this.currentPlayerLegalMoves[i][j]) allLegalMoves = [...allLegalMoves, ...this.currentPlayerLegalMoves[i][j]];"  is still telling that
                    this.currentPlayerLegalMoves[i][j] is possibly null  , although i am using the if() condition before
                
                So i delcared      "currentPlayerLegalMoves: Move[][][] ;" instead of "currentPlayerLegalMoves: Move[][][]  | null[][];"
        */
        if (this.currentPlayerLegalMoves[fromSquare.x][fromSquare.y].length > 0) return this.currentPlayerLegalMoves[fromSquare.x][fromSquare.y];

        const currentPlayer = this.currentPlayer;
        const opponentPlayer = currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;

        let currentPlayerKingCoordinate: Coordinate = new Coordinate(-1, -1);

        let n = this.boardSize ? this.boardSize : -100;

        //*get king coordinate of current player
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (this.squares[i][j].isPieceType(PieceType.KING) && this.squares[i][j].pieceColor === currentPlayer) {
                    currentPlayerKingCoordinate = new Coordinate(i, j);
                    break;
                }
            }
        }

        let legalMoves: Move[] = [];
        let pseudoLegalMoves = this.getPseudoLegalMovesOfGivenSquare(fromSquare);

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

        //* if currentPlayerLegalMoves[i][j] was not cached before, then call the function to find moves, and cache
        return (this.currentPlayerLegalMoves[fromSquare.x][fromSquare.y] = legalMoves);
    }

    /**
     * finds all legal moves of all pieces of current player
     * @returns Move[]
     */
    getAllLegalMovesOfCurrentPlayer(): Move[] {
        let allLegalMoves: Move[] = [];

        let n = this.boardSize;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (!this.isSquareEmpty(new Coordinate(i, j)) && this.squares[i][j].pieceColor === this.currentPlayer) {
                    if (this.currentPlayerLegalMoves[i][j].length !== 0) {
                        allLegalMoves = [...allLegalMoves, ...this.getLegalMovesOfGivenSquare(new Coordinate(i, j))];
                    }
                }
            }
        }

        return allLegalMoves;
    }

    /**
     *
     * @returns { isKingInCheck: boolean; kingCoordinate: Coordinate }
     * if current player's king is in check , returns ---> {isKingInCheck : true, kingCoordinate : coordinate of current player's king}
     *                                 else , returns ---> {isKingInCheck : false, kingCoordinate : (-1,-1)}
     */
    isCurrentPlayerKingInCheck(): { isKingInCheck: boolean; kingCoordinate: Coordinate } {
        //*get all pseudo legal moves of opponent and check if opponent can capture my king or not
        const opponentPlayer = this.currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;
        const n = this.boardSize;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (this.squares[i][j].pieceColor === opponentPlayer) {
                    let moves: Move[] = this.getPseudoLegalMovesOfGivenSquare(new Coordinate(i, j));

                    for (const move of moves) {
                        if (move.capturedPiece.equals(new Piece(PieceType.KING, this.currentPlayer))) {
                            return { isKingInCheck: true, kingCoordinate: new Coordinate(move.toSquare.x, move.toSquare.y) };
                        }
                    }
                }
            }
        }
        return { isKingInCheck: false, kingCoordinate: new Coordinate(-1, -1) };
    }

    /**
     *
     * @returns GameStatus
     *  *1. If current player is check mated : returns "GameStatus.CHECKMATE"
     *  *2. If game current player is stalemated : returns "GameStatus.STALEMATE"
     *  *3. Else returns "GameStatus.RUNNING"
     */
    getGameStatus(): GameStatus {
        if (this.getAllLegalMovesOfCurrentPlayer().length > 0) return GameStatus.RUNNING;

        // if current player has no move
        if (this.isCurrentPlayerKingInCheck()) return GameStatus.CHECKMATE;
        else return GameStatus.STALEMATE;
    }

    //*FOR TESTING------------------------------------------------------------------------------------------------------------------------------------

    /**
     *
     * @param depth
     * @returns number of board positions(need not necessarily be distinct) upto given depth(ply)
     */
    countPositionsUptoDepth(depth: number): number {
        if (depth < 0) {
            // console.log(boardToFEN(this));
            return 0;
        }
        if (depth === 0) {
            // console.log(boardToFEN(this));
            return 1;
        }

        let count: number = 0;

        let moves = this.getAllLegalMovesOfCurrentPlayer();

        for (const move of moves) {
            let newBoard = this.getNewBoardAfterExecutingMove(move);

            if (newBoard) count += newBoard.countPositionsUptoDepth(depth - 1);
        }
        return count;
    }
    //*FOR TESTING------------------------------------------------------------------------------------------------------------------------------------

    getStaticEvaluation(): number {
        let score: number = 0;

        let n = this.boardSize;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (!this.isSquareEmpty(new Coordinate(i, j))) {
                    if (this.squares[i][j].pieceColor === Color.WHITE) score = score + this.squares[i][j].getBaseMaterialScore();
                    else if (this.squares[i][j].pieceColor === Color.BLACK) score = score - this.squares[i][j].getBaseMaterialScore();
                }
            }
        }

        return score;
    }

    minimax(depth: number, alpha: number, beta: number): { bestScore: number; bestMove: Move } {
        if (depth === 0) return { bestScore: this.getStaticEvaluation(), bestMove: new Move() };

        let moves = this.getAllLegalMovesOfCurrentPlayer();
        if (moves.length === 0) return { bestScore: this.getStaticEvaluation(), bestMove: new Move() };

        if (this.currentPlayer === Color.WHITE) {
            let maxScore: number = -100000;
            let bestMove: Move = new Move();
            for (const currMove of moves) {
                let newBoard = this.getNewBoardAfterExecutingMove(currMove);
                if (!newBoard) continue;

                let { bestScore: currScore } = newBoard.minimax(depth - 1, alpha, beta);

                if (currScore > maxScore) {
                    maxScore = currScore;
                    alpha = currScore;
                    bestMove = currMove;
                }

                if (alpha >= beta) return { bestScore: maxScore, bestMove: bestMove };
            }

            return { bestScore: maxScore, bestMove: bestMove };
        } else {
            let minScore: number = 100000;
            let bestMove: Move = new Move();
            for (const currMove of moves) {
                let newBoard = this.getNewBoardAfterExecutingMove(currMove);
                if (!newBoard) continue;

                let { bestScore: currScore } = newBoard.minimax(depth - 1, alpha, beta);

                if (currScore < minScore) {
                    minScore = currScore;
                    beta = currScore;
                    bestMove = currMove;
                }

                if (alpha >= beta) return { bestScore: minScore, bestMove: bestMove };
            }

            return { bestScore: minScore, bestMove: bestMove };
        }
    }

    getBestMove(depth: number): { bestScore: number; bestMove: Move } {
        return this.minimax(depth, -10000, 10000);
    }
}
