import { Board } from "./Board";
import { Coordinate } from "./chessUtility";
import { FENToBoard, START_BOARD_FEN } from "./FEN";
import Move from "./Move";
import Piece, { Color, PieceType } from "./Pieces";

export default class Game {
    board: Board | null;
    currentPlayer: Color | undefined;
    moveHistory: Move[];

    constructor(fen: string = START_BOARD_FEN) {
        this.board = FENToBoard(fen);

        this.currentPlayer = this.board?.currentPlayer;
        this.moveHistory = [];
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

        //*check for promotions : if the toSquare of any move is the last rank then add promotion (for testing purpose now , the pawn is promoted to queen)
        let newMovesWithPromotions = [...moves];
        for (let i = 0; i < moves.length; i++) {
            let move = moves[i];

            //if the moved pawn is white and toSquare is 8-th rank || the moved pawn is black and toSquare is 1-st rank
            if (
                (move.pieceMoved.pieceColor === Color.WHITE &&
                move.toSquare.x === this.board?.boardSize
                    ? this.board?.boardSize - 1
                    : -100) ||
                (move.pieceMoved.pieceColor === Color.BLACK &&
                    move.toSquare.x === 0)
            ) {
                //make the current move as promotion to queen
                move.promotedPiece = new Piece(
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

        return newMovesWithPromotions;
    }

    getPseudoLegalMovesOfGivenSquare(fromSquare: Coordinate): Move[] {
        //if fromSquare is not inside board or empty
        if (
            !this.isCoordinateSafe(fromSquare) ||
            this.isSquareEmpty(fromSquare)
        )
            return [];

        let currentPiece = this.board?.squares[fromSquare.x][fromSquare.y];

        //*TODO: uncomment this after testing
        // //if the piece at fromSquare is not of currentPlayer
        // if (currentPiece?.pieceColor !== this.currentPlayer) return [];

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

    //*TODO: extract the legal moves from pseudo legal moves
    //sosta function for testing
    getLegalMovesOfGivenSquare(fromSquare: Coordinate): Move[] {
        if (!this.isCoordinateSafe(fromSquare)) return [];

        return this.getPseudoLegalMovesOfGivenSquare(fromSquare);
    }

    //*TODO: after making the move check if it a pawn moving 2 steps, if yes , then update the enPassant attribute of board
    //*TODO: after making the move check if any castling ability is violated , and update the "castling" attribute of board
    //* execute the move, update the board, and return a new board
    executeMove(move: Move) {}
}
