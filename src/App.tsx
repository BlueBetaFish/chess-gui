import "./App.css";
import { DEFAULT_BOARD } from "./chess-board/FEN";
import ChessBoard from "./components/ChessBoard";

function App() {
    console.log(DEFAULT_BOARD);

    return (
        <div className="App">
            <ChessBoard boardObj={DEFAULT_BOARD}  />
        </div>
    );
}


export default App;
