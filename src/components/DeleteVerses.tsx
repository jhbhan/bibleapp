import { SavedVerse, View } from '@/types';
import React from 'react';

interface DeleteVersesProps {
    savedVerses: SavedVerse[];
    handleDeleteVerse: (verseRange: string) => void;
    setView: (view: View) => void;
}

export default function DeleteVerses({ savedVerses, handleDeleteVerse, setView }: DeleteVersesProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black">
            <h1 className="text-4xl font-black mb-10 tracking-tighter text-center">Delete Verses</h1>
            <div className="w-full max-w-xl">
                {savedVerses.map((verse, index) => (
                    <div key={index} className="flex items-center justify-between py-4 border-b border-gray-300">
                        <span className="font-bold">{verse.range}</span>
                        <button onClick={() => handleDeleteVerse(verse.range)}
                            className="btn btn-danger px-4 py-2">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={() => setView('add-verse')}
                className="btn btn-secondary mt-10">
                Back
            </button>
        </div>
    );
}
