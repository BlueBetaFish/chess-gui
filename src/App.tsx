import { useState } from "react";
import "./App.css";
import { START_BOARD_FEN } from "./chess-board/FEN";
import Game from "./chess-board/Game";
import ChessGame from "./components/ChessGame";

function App() {
    const [flip, setFlip] = useState(false);
    const [formValue, setFormValue] = useState("");
    const [gameObj,setGameObj]=useState(new Game("8/6P1/8/1k6/8/1K6/6p1/8 w - - 0 1"));

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
