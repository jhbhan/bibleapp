import { SavedVerse, Collections } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VersesState {
    savedVerses: SavedVerse[];
    collections: Collections;
}

const initialState: VersesState = {
    savedVerses: [],
    collections: { "All Verses": [] },
};

const versesSlice = createSlice({
    name: 'verses',
    initialState,
    reducers: {
        setSavedVerses: (state, action: PayloadAction<SavedVerse[]>) => {
            state.savedVerses = action.payload;
        },
        addSavedVerse: (state, action: PayloadAction<SavedVerse>) => {
            state.savedVerses.push(action.payload);
            state.collections["All Verses"].push(action.payload.range);
        },
        deleteSavedVerse: (state, action: PayloadAction<string>) => {
            state.savedVerses = state.savedVerses.filter(verse => verse.range !== action.payload);
            Object.keys(state.collections).forEach(collectionName => {
                state.collections[collectionName] = state.collections[collectionName].filter(verseId => verseId !== action.payload);
            });
        },
        setCollections: (state, action: PayloadAction<Collections>) => {
            state.collections = action.payload;
        },
        createCollection: (state, action: PayloadAction<string>) => {
            state.collections[action.payload] = [];
        },
        deleteCollection: (state, action: PayloadAction<string>) => {
            delete state.collections[action.payload];
        },
        addVerseToCollection: (state, action: PayloadAction<{ collectionName: string; verseId: string }>) => {
            const { collectionName, verseId } = action.payload;
            if (state.collections[collectionName] && !state.collections[collectionName].includes(verseId)) {
                state.collections[collectionName].push(verseId);
            }
        },
        removeVerseFromCollection: (state, action: PayloadAction<{ collectionName: string; verseId: string }>) => {
            const { collectionName, verseId } = action.payload;
            if (state.collections[collectionName]) {
                state.collections[collectionName] = state.collections[collectionName].filter(id => id !== verseId);
            }
        },
    },
});

export const {
    setSavedVerses,
    addSavedVerse,
    deleteSavedVerse,
    setCollections,
    createCollection,
    deleteCollection,
    addVerseToCollection,
    removeVerseFromCollection,
} = versesSlice.actions;

export const versesReducer = versesSlice.reducer;
