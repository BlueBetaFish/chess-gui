import { Component } from 'react'
import { Board } from '../chess-board/Board';
import ChessGrid from './ChessSquare';
import styles from '../styles/ChessBoard.module.css'
import {Coordinate} from '../chess-board/chessUtility'


type BoardProps = {
    boardObj: Board | null,
    gameClickListener: any,
    flipBoard?:boolean
}



export default class ChessBoard extends Component<BoardProps, any> {

    constructor(props:BoardProps){
        super(props)
        console.log(this.props.boardObj?.squares)
    }

    componentDidUpdate(){
        console.log(this.props.flipBoard ?? false)
    
    }

    render() {
        return (
            <div className={styles.board}>
                
                {
                (this.props.flipBoard ?? false)?
                    this.props.boardObj?.squares.map((rank, rankNum) =>
                        <div className={styles.boardRow} key={rankNum}>
                            {
                                rank.reverse().map((piece, fileNum) =>
                                    <ChessGrid
                                        piece={piece}
                                        key={rankNum * rank.length + fileNum}
                                        index={new Coordinate( (rankNum),(7-fileNum) )}
                                        colorIndex={ new Coordinate (rankNum,fileNum) }
                                        boardClickListener={this.props.gameClickListener}
                                    />
                                )
                            }
                        </div>
                        )
                    
                    :

                    this.props.boardObj?.squares.reverse().map((rank, rankNum) =>
                        <div className={styles.boardRow} key={rankNum}>
                            {
                                rank.map((piece, fileNum) =>
                                    <ChessGrid
                                        piece={piece}
                                        key={rankNum * rank.length + fileNum}
                                        index={new Coordinate((7-rankNum),(fileNum)) }
                                        colorIndex={new Coordinate (rankNum,fileNum) }
                                        boardClickListener={this.props.gameClickListener}
                                    />
                                )
                            }
                        </div>
                    )

                }
            </div>
        )
    }
}



