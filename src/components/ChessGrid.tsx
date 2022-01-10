import React from 'react'
import Piece,{Color, PieceType} from '../chess-board/Pieces'
import styles from "../styles/ChessGrid.module.css"

type Props={
    piece:Piece 
}


export default function ChessGrid (props:Props) {
    return (
        <div>
            <div className={styles.grid}>
                {props.piece.getFENSymbol()}
            </div>
        </div>
    )
}
