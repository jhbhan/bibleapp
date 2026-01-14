import React, { useState } from 'react';
import SearchableDropdown from './SearchableDropdown';
import { BibleData, View } from '../../types';

interface AddVerseProps {
    bibleData: BibleData;
    handleAddVerse: (selectedBook: string, startChapter: string, startVerse: string, endChapter: string | null, endVerse: string | null) => void;
    setView: (view: View) => void;
}

export default function AddVerse({ bibleData, handleAddVerse, setView }: AddVerseProps) {
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [startChapter, setStartChapter] = useState<string | null>(null);
    const [startVerse, setStartVerse] = useState<string | null>(null);
    const [endChapter, setEndChapter] = useState<string | null>(null);
    const [endVerse, setEndVerse] = useState<string | null>(null);

    const books = Object.keys(bibleData || {}); // Defensive check

    const chapters = selectedBook ? Object.keys(bibleData[selectedBook] || {}) : []; // Defensive check

    // Defensive checks for startChapter and selectedBook before accessing bibleData
    const startVerses = selectedBook && startChapter && bibleData[selectedBook] && bibleData[selectedBook][startChapter]
        ? Object.keys(bibleData[selectedBook][startChapter])
        : [];

    // Defensive checks for selectedBook before accessing bibleData
    const endChapters = selectedBook && startChapter && bibleData[selectedBook]
        ? Object.keys(bibleData[selectedBook]).slice(chapters.indexOf(startChapter))
        : [];

    // Defensive checks for endChapter and selectedBook before accessing bibleData
    const endVerses = selectedBook && endChapter && bibleData[selectedBook] && bibleData[selectedBook][endChapter]
        ? Object.keys(bibleData[selectedBook][endChapter])
        : [];

    const onAddVerse = () => {
        if(selectedBook && startChapter && startVerse)
        handleAddVerse(selectedBook, startChapter, startVerse, endChapter, endVerse);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black">
            <h1 className="text-4xl font-black mb-10 tracking-tighter text-center">Add/Edit Verses</h1>
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <SearchableDropdown
                    options={books}
                    value={selectedBook}
                    onChange={(book) => {
                        setSelectedBook(book);
                        setStartChapter(null);
                        setStartVerse(null);
                        setEndChapter(null);
                        setEndVerse(null);
                    }}
                    placeholder="Select a Book"
                />

                <div className="w-full border-b border-gray-300 my-4"></div>
                <h2 className="text-xl font-bold mb-2">Start Verse</h2>

                <SearchableDropdown
                    options={chapters}
                    value={startChapter}
                    onChange={(chapter) => {
                        setStartChapter(chapter);
                        setStartVerse(null);
                        setEndChapter(null);
                        setEndVerse(null);
                    }}
                    placeholder="Select a Start Chapter"
                    disabled={!selectedBook}
                />
                <SearchableDropdown
                    options={startVerses}
                    value={startVerse}
                    onChange={(verse) => {
                        setStartVerse(verse);
                        setEndChapter(null);
                        setEndVerse(null);
                    }}
                    placeholder="Select a Start Verse"
                    disabled={!startChapter}
                />

                <div className="w-full border-b border-gray-300 my-4"></div>
                <h2 className="text-xl font-bold mb-2">End Verse (Optional)</h2>
                
                <SearchableDropdown
                    options={endChapters}
                    value={endChapter}
                    onChange={(chapter) => {
                        setEndChapter(chapter);
                        setEndVerse(null);
                    }}
                    placeholder="Select an End Chapter"
                    disabled={!startVerse}
                />
                <SearchableDropdown
                    options={endVerses}
                    value={endVerse}
                    onChange={setEndVerse}
                    placeholder="Select an End Verse"
                    disabled={!endChapter}
                />
                <button onClick={onAddVerse} disabled={!startVerse}
                    className="btn btn-primary disabled:bg-gray-300">
                    Add Verse
                </button>
                <div className="w-full border-b border-gray-300 my-4"></div>
                <button onClick={() => setView('import-verses')}
                    className="btn btn-secondary">
                    Import Verses
                </button>
                <button onClick={() => setView('delete-verses')}
                    className="btn btn-secondary">
                    Delete Verses
                </button>
                <div className="w-full border-b border-gray-300 my-4"></div>
                <button onClick={() => setView('menu')}
                    className="btn btn-secondary">
                    Back to Main Menu
                </button>
            </div>
        </div>
    );
}
