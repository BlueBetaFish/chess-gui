import { Component } from 'react'
import { Board } from '../chess-board/Board';
import ChessSquare from './ChessSquare';
import styles from '../styles/ChessBoard.module.css'
import { Coordinate, getIndexinMoveList } from '../chess-board/chessUtility'
import Move from '../chess-board/Move';


type BoardProps = {
    boardObj: Board | null,
    showMoveinSquare: Move[],
    gameClickListener: any,
    gameDropListener: any,
    gameDragOverListener: any,
    checkIndex: Coordinate,
    flipBoard?: boolean
}

type BoardState = any



export default class ChessBoard extends Component<BoardProps, BoardState> {


    render() {
        // console.log(this.props.checkIndex)
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
                                            <ChessSquare
                                                piece={piece}
                                                key={rankNum * rank.length + fileNum}
                                                index={index}
                                                colorIndex={new Coordinate(rankNum, fileNum)}
                                                boardClickListener={this.props.gameClickListener}
                                                boardDragStartListener={this.props.gameDropListener}
                                                boardDropListener={this.props.gameDragOverListener}
                                                showMoveIndicator={getIndexinMoveList(index, this.props.showMoveinSquare) !== undefined}
                                                isInCheck={this.props.checkIndex.equals(index)}
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
                                            <ChessSquare
                                                piece={piece}
                                                key={rankNum * rank.length + fileNum}
                                                index={index}
                                                colorIndex={new Coordinate(rankNum, fileNum)}
                                                boardClickListener={this.props.gameClickListener}
                                                boardDragStartListener={this.props.gameDropListener}
                                                boardDropListener={this.props.gameDragOverListener}
                                                showMoveIndicator={getIndexinMoveList(index, this.props.showMoveinSquare) !== undefined}
                                                isInCheck={this.props.checkIndex.equals(index)}
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



