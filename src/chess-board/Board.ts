import { Coordinate } from "./chessUtility";
import Piece, { Color } from "./Pieces";

export type CastlingAvailability = [boolean, boolean, boolean, boolean];

/**
 * Class representing a Chess Board
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

    /**
     * Creates a new board by copying the attributes of given "board" as paramater and returns the newBoard
     * @param board
     * @returns new Board Object
     */
    getNewBoard(): Board {
        let newSquares: Piece[][] = [];
        for (let i = 0; i < this.squares.length; i++)
            newSquares[i] = this.squares[i].slice();

        let currentPlayer =
            this.currentPlayer === Color.WHITE ? Color.WHITE : Color.BLACK;
        let castling: CastlingAvailability = [
            this.castling[0],
            this.castling[1],
            this.castling[2],
            this.castling[3],
        ];
        let enPassant = this.enPassant
            ? new Coordinate(this.enPassant.x, this.enPassant.y)
            : null;

        return new Board(
            newSquares,
            currentPlayer,
            castling,
            enPassant,
            this.halfMoveClock,
            this.fullMove
        );
    }
}
