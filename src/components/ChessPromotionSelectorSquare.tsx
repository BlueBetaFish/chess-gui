import React, { Component } from 'react'
import Piece, { Color, PieceType } from '../chess-board/Pieces'
import ChessPromotionSelector from './ChessPromotionSelector';
import styles from '../styles/ChessPromotionSelectorSquare.module.css';

type ChessPromotionSelectorSquareProps = {
    piece: Piece,
    boardClickListener: any
}
const themeStringPrefix = `assets/pieces/cardinal/`

export default class ChessPromotionSelectorSquare extends Component<ChessPromotionSelectorSquareProps, any> {


    constructor(props: ChessPromotionSelectorSquareProps) {
        super(props)
        this.getImageSrc = this.getImageSrc.bind(this);
    }

    getImageSrc(peiceType: PieceType, peiceColor: Color): string {

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

    render() {
        return (
            <div className={styles.selectorSquare} onClick={(event) => { this.props.boardClickListener(event, this.props.piece.pieceType) }}>
                <img
                    src={this.getImageSrc(this.props.piece.pieceType, this.props.piece.pieceColor)}
                />
            </div>
        )
    }
}
