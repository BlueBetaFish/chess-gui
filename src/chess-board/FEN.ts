import { Board } from "./Board";
import Piece, { Color, PieceType } from "./Pieces";

const fenCharToPiece : Map<String, Piece> = new Map<String, Piece>();
fenCharToPiece.set(PieceType.NONE, new Piece(PieceType.NONE,   Color.UNDEFINED));
fenCharToPiece.set("k", new Piece(PieceType.KING,   Color.BLACK));
fenCharToPiece.set("q", new Piece(PieceType.QUEEN,  Color.BLACK));
fenCharToPiece.set("r", new Piece(PieceType.ROOK,   Color.BLACK));
fenCharToPiece.set("b", new Piece(PieceType.BISHOP, Color.BLACK));
fenCharToPiece.set("n", new Piece(PieceType.KNIGHT, Color.BLACK));
fenCharToPiece.set("p", new Piece(PieceType.PAWN,   Color.BLACK));
fenCharToPiece.set("K", new Piece(PieceType.KING,   Color.WHITE));
fenCharToPiece.set("Q", new Piece(PieceType.QUEEN,  Color.WHITE));
fenCharToPiece.set("R", new Piece(PieceType.ROOK,   Color.WHITE));
fenCharToPiece.set("B", new Piece(PieceType.BISHOP, Color.WHITE));
fenCharToPiece.set("N", new Piece(PieceType.KNIGHT, Color.WHITE));
fenCharToPiece.set("P", new Piece(PieceType.PAWN,   Color.WHITE));

/**
 * 
 * @param fen FEN representation 
 * @returns Board corresponding to FEN string or null if
 * unknown character is encountered
 */
export function getBoardPositionFromFEN(fen : string) : Board | null {
    const pieces : Piece[][] = [];

    let rank : Piece[] = [];
    let rankNumber = 7;
    for (const char of fen) {
        if (char === "/") {  
            pieces[rankNumber--] = rank;
            rank = [];
        }
        else if (Number.isInteger(+char)) {
            let count = +char;
            while (count-- > 0) {
                const piece: Piece | undefined = fenCharToPiece.get(PieceType.NONE);
                if (piece === undefined) return null;
                rank.push(piece);
            }
        } else {
            const piece: Piece | undefined = fenCharToPiece.get(char);
            if (piece === undefined) return null;
            rank.push(piece);
        }
    }
    pieces[rankNumber] = rank;
    return new Board(pieces, Color.WHITE)
};

export const DEFAULT_BOARD = getBoardPositionFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");