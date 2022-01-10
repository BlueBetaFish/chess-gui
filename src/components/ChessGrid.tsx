import React from 'react'
import Piece,{Color, PieceType} from '../chess-board/Pieces'
import styles from "../styles/ChessGrid.module.css"

type Props={
    piece:Piece 
}


export default function ChessGrid (props:Props) {

    if(props.piece.pieceType === 'NONE'){
        return (
            <div className={styles.grid}>
                blank
            </div>
        )
    }
    else if(props.piece.pieceColor === 'WHITE'){
        return (
            <div className={styles.grid}>
               {props.piece.pieceType}
            </div>
        )
    }
    else if(props.piece.pieceColor === 'BLACK'){
        return (
            <div className={styles.grid}>
               {props.piece.pieceType.toLowerCase()}
            </div>
        )
    }
    return (
        <div>
            <div className={styles.grid}>
                undefined
            </div>
        </div>
    )
}
