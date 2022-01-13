import Piece, { Color, PieceType } from '../chess-board/Pieces'
import styles from "../styles/ChessSquare.module.css"
import { Coordinate } from '../chess-board/chessUtility'



type Props = {
    piece: Piece,
    index: Coordinate,
    colorIndex: Coordinate,
    boardClickListener: any,
    boardDropListener: any,
    boardDragStartListener: any,
    showMoveIndicator: boolean,
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
        const { x, y } = props.colorIndex;
        return ((x+y)%2===0)
    }


    return (
        <div className={
            [styles.grid, (isLightSquare()) ? styles.light : styles.dark].join(' ')} 
            onClick={(event) => { props.boardClickListener(event, props.index) }} 
            onDrop={(event: any)=>{props.boardDropListener(event, props.index)}}
            onDragOver={(event: any)=>{event.preventDefault()}} >
            {
                (props.piece.pieceColor !== Color.UNDEFINED) ?
                    <img 
                    id={props.piece.pieceType+props.piece.pieceColor+props.index.x+props.index.y}
                    src={getImageSrc(props.piece.pieceType, props.piece.pieceColor)}
                    draggable={true}
                    onDragStart={(event:any)=>{props.boardDragStartListener(event,props.index)}}
                     />
                    : (<></>)

            }
            <img src={'assets/moveIndicator.svg'} className={[styles.moveIndicator, (props.showMoveIndicator) ? styles.showMoveIndicator : " "].join(' ')} />

        </div>
    )
}
