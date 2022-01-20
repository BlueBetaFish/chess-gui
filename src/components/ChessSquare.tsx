import Piece, { Color, PieceType } from '../chess-board/Pieces'
import styles from "../styles/ChessSquare.module.css"
import { Coordinate } from '../chess-board/chessUtility'
import { Component } from 'react'



type ChessSquareProps = {
    piece: Piece,
    index: Coordinate,
    colorIndex: Coordinate,
    boardClickListener: any,
    boardDropListener: any,
    boardDragStartListener: any,
    showMoveIndicator: boolean,
    isInCheck: boolean,
    theme?: string
}

export default class ChessSquare extends Component<ChessSquareProps, any> {

    themeStringPrefix: string;
    constructor(props: ChessSquareProps) {
        super(props)
        this.themeStringPrefix = `assets/pieces/cardinal/`
    }

    getImageSrc = (peiceType: PieceType, peiceColor: Color): string => {

        if (peiceColor === Color.WHITE) {

            switch (peiceType) {

                case PieceType.PAWN:
                    return this.themeStringPrefix + "wp.svg";

                case PieceType.KNIGHT:
                    return this.themeStringPrefix + "wn.svg";

                case PieceType.BISHOP:
                    return this.themeStringPrefix + "wb.svg";

                case PieceType.ROOK:
                    return this.themeStringPrefix + "wr.svg";

                case PieceType.QUEEN:
                    return this.themeStringPrefix + "wq.svg";

                case PieceType.KING:
                    return this.themeStringPrefix + "wk.svg";

            }
        }
        else {

            switch (peiceType) {

                case PieceType.PAWN:
                    return this.themeStringPrefix + "bp.svg";

                case PieceType.KNIGHT:
                    return this.themeStringPrefix + "bn.svg";

                case PieceType.BISHOP:
                    return this.themeStringPrefix + "bb.svg";

                case PieceType.ROOK:
                    return this.themeStringPrefix + "br.svg";

                case PieceType.QUEEN:
                    return this.themeStringPrefix + "bq.svg";

                case PieceType.KING:
                    return this.themeStringPrefix + "bk.svg";
            }
        }
        return ""
    }

    isLightSquare = (): boolean => ((this.props.colorIndex.x + this.props.colorIndex.y) % 2 === 0)

    render() {
        return (
            <div className={
                [styles.grid, (this.isLightSquare()) ? styles.light : styles.dark].join(' ')}
                onClick={(event) => { this.props.boardClickListener(event, this.props.index) }}
                onDrop={(event: any) => { this.props.boardDropListener(event, this.props.index) }}
                onDragOver={(event: any) => { event.preventDefault() }}
                style={(this.props.isInCheck) ? { backgroundColor: "#E67B6E" } : {}} 
                >
                {
                    (this.props.piece.pieceColor !== Color.UNDEFINED) ?
                        <img
                            id={this.props.piece.pieceType + this.props.piece.pieceColor + this.props.index.x + this.props.index.y}
                            src={this.getImageSrc(this.props.piece.pieceType, this.props.piece.pieceColor)}
                            draggable={true}
                            onDragStart={(event: any) => { this.props.boardDragStartListener(event, this.props.index) }}
                        />
                        : (<></>)
                }
                <span className={styles.debug}>({this.props.index.x + ", " + this.props.index.y}) </span>
                <img src={'assets/moveIndicator.svg'} className={[styles.moveIndicator, (this.props.showMoveIndicator) ? styles.showMoveIndicator : " "].join(' ')} />
            </div>
        )
    }
}
