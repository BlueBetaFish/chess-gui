import React, { Suspense } from 'react'
import Piece, { Color, PieceType } from '../chess-board/Pieces'
import styles from "../styles/ChessGrid.module.css"

type Props = {
    piece: Piece,
    index: {
        rankNum: number,
        fileNum: number
    },
    theme?: string
}

export default function ChessGrid(props: Props) {

    const themeStringPrefix = `assets/pieces/cardinal/`

    function getImageSrc(peiceType: PieceType, peiceColor: Color): string {

        if (peiceColor === Color.WHITE) {

            switch (peiceType) {

                case PieceType.PAWN:
                    return themeStringPrefix + "wp.svg";

                case PieceType.KNIGHT:
                    return themeStringPrefix + "wn.svg";

                case PieceType.BISHOP:
                    return themeStringPrefix + "wb.svg";

                case PieceType.ROOK:
                    return themeStringPrefix + "wr.svg";

                case PieceType.QUEEN:
                    return themeStringPrefix + "wq.svg";

                case PieceType.KING:
                    return themeStringPrefix + "wk.svg";

            }
        }
        else {

            switch (peiceType) {

                case PieceType.PAWN:
                    return themeStringPrefix + "bp.svg";

                case PieceType.KNIGHT:
                    return themeStringPrefix + "bn.svg";

                case PieceType.BISHOP:
                    return themeStringPrefix + "bb.svg";

                case PieceType.ROOK:
                    return themeStringPrefix + "br.svg";

                case PieceType.QUEEN:
                    return themeStringPrefix + "bq.svg";

                case PieceType.KING:
                    return themeStringPrefix + "bk.svg";
            }
        }
        return ""
    }

    function isLightSquare(): boolean {
        const { rankNum, fileNum } = props.index;
        if (rankNum % 2 == 0) {
            return (fileNum % 2 === 0)
        }
        else {
            return (fileNum % 2 !== 0)
        }
    }


    return (
        <div className={[styles.grid, (isLightSquare()) ? styles.light : styles.dark].join(' ')}>
            {
                (props.piece.pieceColor !== Color.UNDEFINED) ?
                    <img src={getImageSrc(props.piece.pieceType, props.piece.pieceColor)} />
                    : <></>
            }
        </div>
    )
}
