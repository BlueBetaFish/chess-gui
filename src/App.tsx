import { type } from "os";
import { useState, Component } from "react";
import "./App.css";
import { START_BOARD_FEN } from "./chess-board/FEN";
import Game from "./chess-board/Game";
import ChessGame from "./components/ChessGame";


type AppState = {
    flip: boolean;
    formValue: string;
    gameObj: Game;
}

export default class App extends Component<any, AppState> {
    state: AppState = {
        flip: false,
        formValue: "",
        gameObj: new Game(START_BOARD_FEN)
    }


    render() {
        return (
            <div className="App">
                <ChessGame gameObj={this.state.gameObj} flipGame={this.state.flip} />
                <form>
                    <input
                        type="text"
                        name="fen"
                        onChange={(event) => {
                            this.setState({
                                formValue: event.target.value
                            })
                        }}
                    />
                    <button
                        type="button"
                        onClick={(event) => {
                            event.preventDefault()
                            this.setState({
                                gameObj: new Game(this.state.formValue)
                            })
                        }}
                    >
                        Update Game
                    </button>
                    <button
                        onClick={(event) => {
                            event.preventDefault()
                            this.setState({
                                flip: !this.state.flip
                            })
                        }}
                    >
                        Flip
                    </button>
                </form>


            </div>
        )
    }
}

