import { useState } from "react";
import "./App.css";
import { START_BOARD_FEN } from "./chess-board/FEN";
import Game from "./chess-board/Game";
import ChessGame from "./components/ChessGame";

function App() {
    const [flip, setFlip] = useState(false);
    const [formValue, setFormValue] = useState("");
    const [gameObj,setGameObj]=useState(new Game(START_BOARD_FEN));

    return (
        <div className="App">
            <ChessGame gameObj={gameObj} flipGame={flip} />
            <form>
                <button
                    type="button"
                    onClick={() => {
                        setGameObj(new Game(formValue))
                    }}
                >
                    Update Game
                </button>
            </form>

            <button
                onClick={() => {
                    setFlip(!flip);
                }}
            >
                Flip
            </button>
        </div>
    );
}

export default App;
