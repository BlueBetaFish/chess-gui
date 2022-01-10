import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Board } from '../chess-board/Board';
import { type } from 'os';
import ChessGrid from './ChessGrid';
import styles from '../styles/ChessBoard.module.css'


type Props={
    boardObj: Board | null
}
type State={
    boardObj: Board | null
}

const RANKS =['a','b','c','d','e','f','h'];
const FILES =['1','2','3','4','5','6','7','8'];
let i=0,j=0
export default class ChessBoard extends Component<Props,State> {

    constructor(props:Props){
        super(props);
        this.state = {
            boardObj:props.boardObj
        }
    }
    render() {
        return (
            <div className={styles.board}>
              {
              this.props.boardObj?.squares.reverse().map(file =>
                    <div className={styles.boardRow} key={i++}>
                    {file.map(piece =>
                        <ChessGrid piece={piece} key={j++} />
                    )}
                    </div>
                   
                )
              }
            </div>
        )
    }
}



