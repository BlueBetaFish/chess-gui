import { useState } from "react";
import "./App.css";
import { START_BOARD_FEN } from "./chess-board/FEN";
import Game from "./chess-board/Game";
import ChessGame from "./components/ChessGame";

function App() {
    const [flip, setFlip] = useState(false);
    const [formValue, setFormValue] = useState("");
    const [gameObj, setGameObj] = useState(new Game("2R5/q3p1p1/P1p1P1bn/8/5k2/5n2/2PP1p1P/2K5 w - - 0 1"));

    return (
        <div className="App">
            <ChessGame gameObj={gameObj} flipGame={flip} />
            <form>
                <input
                    type="text"
                    name="fen"
                    onChange={(event) => {
                        setFormValue(event.target.value);
                    }}
                />
                <button
                    type="button"
                    onClick={(event) => {
                        event.preventDefault()
                        setGameObj(new Game(formValue))
                    }}
                >
                    Update Game
                </button>
                <button
                    onClick={(event) => {
                        event.preventDefault()
                        setFlip(!flip);
                    }}
                >
                    Flip
                </button>
            </form>


        </div>
    );
}

export default App;
