import { useState } from "react";
import "./App.css";
import Game from "./chess-board/Game";
import ChessGame from "./components/ChessGame";

function App() {
    const [flip, setFlip] = useState(false);
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [fromValue, setFromValue] = useState('');
    
    return (
        <div className="App">
            <ChessGame gameObj={new Game(fen)} flipGame={flip} />
            <form>
                <label>
                    Name:
                    <input type="text" name="fen" onChange={(event)=>{setFromValue(event.target.value)}}/>
                </label>
                <button type="button" onClick={()=>{setFen(fromValue)}}>Update Game</button>
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
