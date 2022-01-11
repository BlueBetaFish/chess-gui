import { Board } from "./Board";
import { Coordinate, getIndicesFromAlgebricCoordinate, isValidAlgebricCoordinate } from "./chessUtility";
import Piece, { Color, PieceType, PIECE_POOL } from "./Pieces";

const PIECE_SYMBOLS = ["k", "q", "r", "b", "n", "p", "K", "Q", "R", "B", "N", "P"];

// Tested FEN Strings
// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
// rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
// rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2
// rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2
// n2B4/2P1p3/2P2p2/1P4PK/N7/kB6/pp2Pb2/8 w - - 0 1
// 2Nr4/3B1R1P/6K1/1P2p3/4kp2/4P2p/4pp1p/5r2 w - - 0 1
// 3b3r/4Pp1k/3q2p1/1KnB2P1/5rbN/8/7p/4R3 w - - 0 1
// 8/2Rn4/3b2PK/4p1pb/4k1pq/4N3/pP1p3n/8 w - - 0 1
// 6R1/r5b1/P2q3R/3kP3/1P4p1/Bp3N1P/1K5P/8 w - - 0 1

export const START_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const DEFAULT_BOARD = getBoardFromFEN(START_BOARD_FEN);


/**
 * @param FEN FEN string 
 * @returns Board corresponding to FEN string or null if invalid FEN string
 */
export function getBoardFromFEN(FEN: string): Board | null {
    let fields = FEN.split(" ");
    if (fields.length !== 6) return null;

    const pieces = getBoardPositionFromFENField(fields[0]);
    if (pieces === null) return null;

    const currentPlayer = getCurrentPlaterFromFENField(fields[1]);
    if (currentPlayer === null || currentPlayer === Color.UNDEFINED) return null;

    const availability = getCastlingFromFENField(fields[2]);
    if (availability === null) return null;

    const enPassant = getEnPassantFromFENField(fields[3]);
    if (enPassant === undefined) return null;

    if (!Number.isInteger(+fields[4]) || +fields[4] < 0) return null;
    const halfMoves = +fields[4];

    if (!Number.isInteger(+fields[5]) || +fields[5] < 1) return null;
    const fullMove = +fields[5];

    return new Board(pieces, currentPlayer, availability, enPassant, halfMoves, fullMove);
}

/**
 * @param piecePlacement piece placement field of a FEN string
 * @returns 8*8 matrix containing pieces or null if invalid 
 */
function getBoardPositionFromFENField(piecePlacement: string): Piece[][] | null {
    const pieces: Piece[][] = getEmptyBoard();
    let rank = 7, file = 0;
    for (const char of piecePlacement) {
        if (isDigit(char)) {
            file += +char;
            if (file > 8) return null;
        } else if (isPieceSymbol(char)) {
            const piece = PIECE_POOL.getPiece(char);
            if (piece === undefined) return null;
            pieces[rank][file++] = piece;
        } else if (char === "/") {
            if (file != 8) return null;
            if (--rank < 0) return null;
            file = 0;
        } else return null;
    }
    return (rank == 0 && file == 8) ? pieces : null;
}

function getCurrentPlaterFromFENField(currentPlayer: string): Color | null {
    if (currentPlayer === "w") return Color.WHITE;
    if (currentPlayer === "b") return Color.BLACK;
    return null;
}

function getCastlingFromFENField(castling: string): [boolean, boolean, boolean, boolean] | null {
    if (!isValidCastlingAvailability(castling)) return null;
    const availability: [boolean, boolean, boolean, boolean] = [false, false, false, false];
    for (const char of castling) {
        if (char === "K") availability[0] = true;
        if (char === "Q") availability[1] = true;
        if (char === "k") availability[2] = true;
        if (char === "q") availability[3] = true;
    }
    return availability;
}

function getEnPassantFromFENField(enPassantField: string): Coordinate | null | undefined {
    if (enPassantField === "-") return null;
    if (!isValidAlgebricCoordinate(enPassantField)) return undefined;
    return getIndicesFromAlgebricCoordinate(enPassantField);
}
// -------------------- FEN validation --------------------

/**
 * @param FEN a FEN string
 * @returns true if it is a pseudo valid, false otherwise
 */
export function isPseudoValidFENString(FEN: string): boolean {
    let fields = FEN.split(" ");
    if (fields.length !== 6) return false;

    return isPseudoValidPiecePlacement(fields[0])
        && (fields[1] === 'w' || fields[1] === 'b')
        && isValidCastlingAvailability(fields[2])
        && (fields[3] === "-" || isValidAlgebricCoordinate(fields[3]))
        && (Number.isInteger(+fields[4]) && +fields[4] >= 0)
        && (Number.isInteger(+fields[5]) && +fields[5] >= 1)
        ;
}


/**
 * @param piecePlacement piece placement field of a FEN string
 * @returns true if it is pseudo valid, false otherwise
 */
function isPseudoValidPiecePlacement(piecePlacement: string): boolean {
    let rank = 7, file = 0;
    for (const char of piecePlacement) {
        if (isDigit(char)) {
            file += +char;
            if (file > 8) return false;
        } else if (isPieceSymbol(char)) {
            if (++file > 8) return false;
        } else if (char === '/') {
            if (file != 8) return false;
            if (--rank < 0) return false;
            file = 0;
        } else return false;
    }
    return (rank == 0 && file == 8);
}


/**
 * @param castlingAvailability string representing the castling availability 
 * of a FEN string
 * @returns true if castlingAvailability is a valid castling availability field,
 * false otherwise
 */
function isValidCastlingAvailability(castlingAvailability: string): boolean {
    if (String.length < 1 || String.length > 4) return false;
    if (castlingAvailability === "-") return true;
    const found: string[] = [];
    for (const char of castlingAvailability) {
        if (char === "K" || char === "Q" || char === "k" || char === "q") {
            for (const foundChar of found)
                if (foundChar === char) return false;
            found.push(char);
        } else return false;
    }
    return true;
}

// -------------------- -------------------- --------------------

// -------------------- Util functions --------------------

/**
 * @param char a character (string of length 1)
 * @returns true if char is a digit, false otherwise
 */
function isDigit(char: string): boolean {
    if (char.length != 1) return false;
    return Number.isInteger(+char);
}

/**
 * @param char a character (string of length 1)
 * @returns true if it is a valid piece symbol, false otherwise
 */
function isPieceSymbol(char: string): boolean {
    if (char.length !== 1) return false;
    return PIECE_SYMBOLS.find((elem) => elem === char) !== undefined;
}

/**
 * @returns an 8*8 board filled with NONE type pieces
 */
function getEmptyBoard(): Piece[][] {
    let nonePiece = PIECE_POOL.getPiece("")
    if (nonePiece === undefined) nonePiece = new Piece(PieceType.NONE, Color.UNDEFINED);
    const pieces: Piece[][] = [];
    for (let i = 0; i < 8; i++) {
        const row: Piece[] = new Array(8).fill(nonePiece);
        pieces.push(row);
    }
    return pieces;
}