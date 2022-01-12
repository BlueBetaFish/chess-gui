import { Board, CastlingAvailability } from "./Board";
import { Coordinate, getAlgebricCoordinateFromIndices, getIndicesFromAlgebricCoordinate, isValidAlgebricCoordinate } from "./chessUtility";
import Piece, { Color, PIECE_POOL, PieceType } from "./Pieces";

const PIECE_SYMBOLS = ["k", "q", "r", "b", "n", "p", "K", "Q", "R", "B", "N", "P"];

// Default start FEN
// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

export const START_BOARD_FEN = "n2B4/2P1p3/2P2p2/1P4PK/N7/kB6/pp2Pb2/8 w - - 0 1";
export const DEFAULT_BOARD = FENToBoard(START_BOARD_FEN);



// -------------------- FEN to Board --------------------

/**
* @param FEN FEN string 
* @returns Board corresponding to FEN string or null if FEN string is invalid / 
* PIECE_POOL failed to return some piece / some bug
*/
export function FENToBoard(FEN: string): Board | null {
    let fields = FEN.split(" ");
    if (fields.length !== 6) return null;

    const pieces = FENToBoardPiece(fields[0]);
    if (pieces === null) return null;
    // console.log("piece position field (1st) correct");

    const currentPlayer = FENToBoardPlayer(fields[1]);
    if (currentPlayer === null || currentPlayer === Color.UNDEFINED) return null;
    // console.log("current player field (2nd) correct");

    const castlingAvailability = FENToBoardCastling(fields[2]);
    if (castlingAvailability === null) return null;
    // console.log("castling availability (3rd) field correct");

    const enPassant = FENToBoardEnPassant(fields[3]);
    if (enPassant === undefined) return null;
    // console.log("En Passant field (4th) correct");

    if (!Number.isInteger(+fields[4]) || +fields[4] < 0) return null;
    const halfMoves = +fields[4];
    // console.log("halfmove field (5th) correct");

    if (!Number.isInteger(+fields[5]) || +fields[5] < 1) return null;
    const fullMove = +fields[5];
    // console.log("fullmove field (6th) correct");

    return new Board(pieces, currentPlayer, castlingAvailability, enPassant, halfMoves, fullMove);
}


/**
 * @param piecePlacement piece placement field (1st) of a FEN string
 * @returns 8*8 matrix containing pieces or null if piece placement
 * is invalid or could not get some piece from the PIECE_POOL 
 */
function FENToBoardPiece(piecePlacement: string): Piece[][] | null {
    const pieces = getEmptyBoard();
    if (pieces === null) return null;
    let rank = 7, file = 0;
    for (const char of piecePlacement) {
        if (isDigit(char)) {
            file += +char;
            if (file > 8) return null;
        } else if (isPieceSymbol(char)) {
            const piece = PIECE_POOL.getPiece(char);
            if (piece === undefined) return null;
            pieces[rank][file] = piece;
            if (++file > 8) return null;
        } else if (char === "/") {
            if (file !== 8) return null;
            if (--rank < 0) return null;
            file = 0;
        } else return null;
    }
    return (rank === 0 && file === 8) ? pieces : null;
}

/**
 * @param currentPlayer current player (2nd) field of FEN string
 * @returns the corresponding colour or null
 */
function FENToBoardPlayer(currentPlayer: string): Color | null {
    if (currentPlayer === "w") return Color.WHITE;
    if (currentPlayer === "b") return Color.BLACK;
    return null;
}

/**
 * @param castling castling availability field (3rd) of FEN string
 * @returns a 4-tuple of boolean representing castling availability
 * or null if castlling is not a valid string
 */
function FENToBoardCastling(castling: string): CastlingAvailability | null {
    if (!isValidCastlingAvailability(castling)) return null;
    const availability: CastlingAvailability = [false, false, false, false];
    for (const char of castling) {
        if (char === "K") availability[0] = true;
        if (char === "Q") availability[1] = true;
        if (char === "k") availability[2] = true;
        if (char === "q") availability[3] = true;
    }
    return availability;
}

/**
 * @param enPassantField En Passant field of FEN string
 * @returns Coordinate corresponding to En Passant square, null if "-" or undefined
 * if string is neither "-" nor a valid algebraic coordinate 
 */
function FENToBoardEnPassant(enPassantField: string): Coordinate | null | undefined {
    if (enPassantField === "-") return null;
    if (!isValidAlgebricCoordinate(enPassantField)) return undefined;
    return getIndicesFromAlgebricCoordinate(enPassantField);
}

// -------------------- -------------------- --------------------



// -------------------- Board to FEN --------------------

/**
 * @param board Board object to be converted
 * @returns FEN string on succesful conversion, null otherwise
 */
export function boardToFEN(board: Board): string | null {
    const fields: string[] = new Array(6);

    const pieceField = boardToFENPieces(board.squares);
    if (pieceField === null) return null;
    fields[0] = pieceField;

    if (board.currentPlayer === Color.UNDEFINED) return null;
    fields[1] = board.currentPlayer;

    fields[2] = boardToFENCastling(board.castling);

    if (board.enPassant === null) {
        fields[3] = "-";
    }
    else {
        const algeraicCoordinate = getAlgebricCoordinateFromIndices(board.enPassant);
        if (algeraicCoordinate === null) return null;
        fields[3] = algeraicCoordinate;
    }

    fields[4] = "" + board.halfMoveClock;
    fields[5] = "" + board.fullMove;


    return fields.join(" ");
}

/**
 * @param pieces squares array from Board object (8*8 matrix)
 * @returns string representing FEN field for piece position or null
 */
function boardToFENPieces(pieces: Piece[][]): string | null {
    const result: string[] = [];
    for (let i = 7; i >= 0; i--) {
        for (let j = 0; j < 8; j++) {
            if (pieces[i][j].pieceType !== PieceType.NONE)
                result.push(pieces[i][j].getFENSymbol());
            else if (result.length === 0 || !isDigit(result[result.length - 1]))
                result.push("1");
            else {
                if (+result[result.length - 1] > 8) return null;
                result[result.length - 1] = String.fromCharCode(result[result.length - 1].charCodeAt(0) + 1);
            }
        }
        if (i > 0) result.push("/");
    }
    return result.join("");
}

/**
 * @param castling castling availability of a board object
 * @returns string representing FEN field for castling availability
 */
function boardToFENCastling(castling: CastlingAvailability): string {
    let result = "";
    if (castling[0]) result += "K";
    if (castling[1]) result += "Q";
    if (castling[2]) result += "k";
    if (castling[3]) result += "q";
    if (result.length === 0) result = "-";
    return result;
}


// -------------------- -------------------- -------------



// -------------------- FEN validation --------------------


/**
 * @param FEN a FEN string
 * @returns true if it is a pseudo valid FEN string, false otherwise
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
            if (file !== 8) return false;
            if (--rank < 0) return false;
            file = 0;
        } else return false;
    }
    return (rank === 0 && file === 8);
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
    if (char.length !== 1) return false;
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
 * @returns an 8*8 board filled with NONE type pieces, 
 * or null if NONE piece is not found in the PIECE_POOL
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

export function testFENBoardConversions() {
    console.log("Testing FEN, Board conversions");
    const FENS = [
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        "n2B4/2P1p3/2P2p2/1P4PK/N7/kB6/pp2Pb2/8 w - - 0 1",
        "2Nr4/3B1R1P/6K1/1P2p3/4kp2/4P2p/4pp1p/5r2 w - - 0 1",
        "3b3r/4Pp1k/3q2p1/1KnB2P1/5rbN/8/7p/4R3 w - - 0 1",
        "8/2Rn4/3b2PK/4p1pb/4k1pq/4N3/pP1p3n/8 w - - 0 1",
        "6R1/r5b1/P2q3R/3kP3/1P4p1/Bp3N1P/1K5P/8 w - - 0 1",
    ];

    let failed = false;

    for (const FEN of FENS) {
        const board = FENToBoard(FEN);
        if (board === null || FEN !== boardToFEN(board)) {
            console.log("testFENBoardConversions failed for:", FEN, board);
            failed = true;
        }
    }
    console.log(`FEN, Board conversions ${(failed) ? "failed" : "passed"}`);
}

// -------------------- -------------------- --------------------