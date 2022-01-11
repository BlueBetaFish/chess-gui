import { Component } from 'react'
import { Board } from '../chess-board/Board';
import ChessGrid from './ChessSquare';
import styles from '../styles/ChessBoard.module.css'
import { Coordinate } from '../chess-board/chessUtility'
import Move from '../chess-board/Move';


type BoardProps = {
    boardObj: Board | null,
    showMoveinSquare: Move[],
    gameClickListener: any,
    flipBoard?: boolean
}

type BoardState = {
    highlightedCoords: Coordinate[]
}



export default class ChessBoard extends Component<BoardProps, BoardState> {


    showMoveIndicator(index: Coordinate) {
        return (
            this.props.showMoveinSquare.find(move =>
                move.toSquare.x === index.x &&
                move.toSquare.y === index.y
            ) !== undefined)
    }


    render() {
        return (
            <div className={styles.board}>

                {
                    (this.props.flipBoard ?? false) ?
                        this.props.boardObj?.squares.map((rank, rankNum) =>
                            <div className={styles.boardRow} key={rankNum}>
                                {
                                    rank.reverse().map((piece, fileNum) => {
                                        const index = new Coordinate((rankNum), (7 - fileNum));
                                        return (
                                            <ChessGrid
                                                piece={piece}
                                                key={rankNum * rank.length + fileNum}
                                                index={index}
                                                colorIndex={new Coordinate(rankNum, fileNum)}
                                                boardClickListener={this.props.gameClickListener}
                                                showMoveIndicator={this.showMoveIndicator(index)}
                                            />)
                                    })
                                }
                            </div>
                        )

                        :

                        this.props.boardObj?.squares.reverse().map((rank, rankNum) =>
                            <div className={styles.boardRow} key={rankNum}>
                                {
                                    rank.map((piece, fileNum) => {
                                        const index = new Coordinate((7 - rankNum), (fileNum));
                                        return (
                                            <ChessGrid
                                                piece={piece}
                                                key={rankNum * rank.length + fileNum}
                                                index={index}
                                                colorIndex={new Coordinate(rankNum, fileNum)}
                                                boardClickListener={this.props.gameClickListener}
                                                showMoveIndicator={this.showMoveIndicator(index)}

                                            />)
                                    }
                                    )
                                }
                            </div>
                        )

                }
            </div>
        )
    }
}



