import { configureStore } from "@reduxjs/toolkit"
import gameReducers from './slices/gameSlice'



export const store = configureStore({
    reducer: {
        game: gameReducers
    },

})


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;