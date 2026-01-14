import { configureStore } from '@reduxjs/toolkit';
import versesReducer from './versesSlice';
import viewReducer from './viewSlice';

export const store = configureStore({
    reducer: {
        verses: versesReducer,
        view: viewReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
