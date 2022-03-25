import { Component } from 'react'
import { GameStatus } from '../chess-board/chessUtility'
import { Color } from '../chess-board/Pieces'
import styles from "../styles/GameOverModal.module.css"

type GameOverModalProps = {
    gameStatus: GameStatus,
    winner: Color,
}

export default class GameOverModal extends Component<any, GameOverModalProps> {

    themeStringPrefix: string;
    constructor(props: GameOverModalProps) {
        super(props)
        this.themeStringPrefix = `assets/pieces/cardinal/`
    }
    render() {
        switch (this.props.gameStatus) {
            case GameStatus.CHECKMATE:
                return (
                    <div className={styles.modal}>
                        <div className={styles.modalBox}>
                            {((this.props.winner == Color.WHITE) ? "White" : "Black") + " won!"}
                            <img src={this.themeStringPrefix + ((this.props.winner == Color.WHITE) ? "wk.svg" : "bk.svg")} />
                            <span><a href="/">New Match?</a></span>
                        </div>
                    </div >
                )
            case GameStatus.STALEMATE:
                return (
                    <div className={styles.modal}>
                        <div className={styles.modalBox}>
                            Draw by Stalemate!
                            <div className={styles.drawDiv}>
                                <img src={this.themeStringPrefix + "wk.svg"} />
                                 ½ - ½ 
                                <img src={this.themeStringPrefix + "bk.svg"} />
                            </div>
                            <span><a href="/">New Match?</a></span>
                        </div>
                    </div >
                )
            default:
                return <></>
        }

    }
}
