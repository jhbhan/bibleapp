import { View, TypingMode, Mode } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
 
interface ViewState {
    view: View;
    mode: Mode;
    typingMode: TypingMode;
    selectedChapter: string | null;
    editingCollection: string | null;
    selectedPracticeCollection: string | null;
}

const initialState: ViewState = {
    view: 'menu',
    mode: 'practice',
    typingMode: 'firstLetter',
    selectedChapter: null,
    editingCollection: null,
    selectedPracticeCollection: null,
};

const viewSlice = createSlice({
    name: 'view',
    initialState,
    reducers: {
        setView: (state, action: PayloadAction<View>) => {
            state.view = action.payload;
        },
        setMode: (state, action: PayloadAction<Mode>) => {
            state.mode = action.payload;
        },
        setTypingMode: (state, action: PayloadAction<TypingMode>) => {
            state.typingMode = action.payload;
        },
        setSelectedChapter: (state, action: PayloadAction<string | null>) => {
            state.selectedChapter = action.payload;
        },
        setEditingCollection: (state, action: PayloadAction<string | null>) => {
            state.editingCollection = action.payload;
        },
        setSelectedPracticeCollection: (state, action: PayloadAction<string | null>) => {
            state.selectedPracticeCollection = action.payload;
        },
    },
});

export const {
    setView,
    setMode,
    setTypingMode,
    setSelectedChapter,
    setEditingCollection,
    setSelectedPracticeCollection,
} = viewSlice.actions;

export const viewReducer = viewSlice.reducer;