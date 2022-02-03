import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Game from '../../chess-board/Game'
import { START_BOARD_FEN } from "../../chess-board/FEN";


type GameState = {
    gameObj: Game
}

const initialState: GameState = {
    gameObj: new Game(START_BOARD_FEN),
};

const gameSlice = createSlice({
    name: 'AppState',
    initialState,
    reducers: {
        updateGame(state, action: PayloadAction<Game>) {
            console.log("called")
            state.gameObj = action.payload;
        },
    },
});

export const { updateGame } = gameSlice.actions;
export default gameSlice.reducer;