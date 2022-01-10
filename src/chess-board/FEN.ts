import { Board } from "./Board";
import Piece, { Color, PIECE_POOL } from "./Pieces";

/**
 * 
 * @param FEN FEN representation 
 * @returns Board corresponding to FEN string or null if
 * unknown character is encountered
 */
export function getBoardPositionFromFEN(FEN : string) : Board | null {
    const pieces : Piece[][] = [];

    let rank : Piece[] = [];
    let rankNumber = 7;
    for (const char of FEN) {
        if (char === "/") {  
            pieces[rankNumber--] = rank;
            rank = [];
        }
        else if (Number.isInteger(+char)) {
            let count = +char;
            while (count-- > 0) {
                const piece: Piece | undefined = PIECE_POOL.getPiece("");
                if (piece === undefined) return null;
                rank.push(piece);
            }
        } else {
            const piece: Piece | undefined = PIECE_POOL.getPiece(char);
            if (piece === undefined) return null;
            rank.push(piece);
        }
    }
    pieces[rankNumber] = rank;
    return new Board(pieces, Color.WHITE);
}

export const DEFAULT_BOARD = getBoardPositionFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");