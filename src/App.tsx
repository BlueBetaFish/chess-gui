import { useState } from "react";
import "./App.css";
import Game from "./chess-board/Game";
import ChessGame from "./components/ChessGame";

function App() {
    const [flip,setFlip] = useState(false);
    return (
        <div className="App">
            <ChessGame gameObj={new Game()} flipGame={flip}/>
            <button onClick={()=>{setFlip(!flip)}}>Flip</button>
        </div>
    );
}


export default App;
