import { Board } from "./Board";
import { Coordinate } from "./chessUtility";
import { getBoardPositionFromFEN } from "./FEN";
import Move from "./Move";
import { Color, PieceType, PIECE_POOL } from "./Pieces";

export default class Game {
    board: Board | null;
    currentPlayer: Color | undefined;
    moveHistory: Move[];

    constructor(fen: string = "") {
        this.board = getBoardPositionFromFEN(fen);

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

        //if piece at the given square is not rook
        if (
            !this.board?.squares[fromSquare.x][fromSquare.y].isPieceType(
                PieceType.ROOK
            )
        )
            return [];

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

        //if piece at the given square is not rook
        if (
            !this.board?.squares[fromSquare.x][fromSquare.y].isPieceType(
                PieceType.BISHOP
            )
        )
            return [];

        //direction vector for bishop
        let dxy = [
            [-1, -1],
            [1, 1],
            [1, -1],
            [1, 1],
        ];

        return this.getSlidingPiecePseudoLegalMovesFromDirectionVector(
            fromSquare,
            dxy
        );
    }

    private getQueenPseudoLegalMoves(fromSquare: Coordinate): Move[] {
        //if square is not inside board
        if (!this.isCoordinateSafe(fromSquare)) return [];

        //if piece at the given square is not rook
        if (
            !this.board?.squares[fromSquare.x][fromSquare.y].isPieceType(
                PieceType.QUEEN
            )
        )
            return [];

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
            [1, 1],
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

    private getKnightPseudoLegalMoves(fromSquare: Coordinate) {}
    private getKingPseudoLegalMoves(fromSquare: Coordinate) {}
    private getPawnPseudoLegalMoves(fromSquare: Coordinate) {}

    getPseudoLegalMovesOfGivenSquare(fromSquare: Coordinate) {}
}
