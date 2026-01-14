import React from 'react';
import { Collections, View } from '../../types';

interface PracticeMenuProps {
    collections: Collections;
    startSession: (chapter: string) => void;
    startCollectionSession: (collectionName: string) => void;
    setView: (view: View) => void;
    selectedPracticeCollection: string | null;
    setSelectedPracticeCollection: (collectionName: string | null) => void;
}

export default function PracticeMenu({ collections, startSession, startCollectionSession, setView, selectedPracticeCollection, setSelectedPracticeCollection }: PracticeMenuProps) {
    const allCollectionNames = Object.keys(collections);
    const sortedCollectionNames = ["All Verses", ...allCollectionNames.filter(name => name !== "All Verses").sort()];

    if (selectedPracticeCollection) {
        const versesInCollection = collections[selectedPracticeCollection] || [];
        // Assuming savedVerses is available in app.jsx and passed down, or fetched here.
        // For now, we'll just display the verseId (range) directly.
        // If the actual verse text is needed, it would need to be passed down or looked up.

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black">
                <h1 className="text-4xl font-black mb-10 tracking-tighter text-center">{selectedPracticeCollection}</h1>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button onClick={() => startCollectionSession(selectedPracticeCollection)}
                            disabled={versesInCollection.length === 0}
                            className="px-6 py-4 bg-black text-white border border-black rounded hover:bg-zinc-800 transition-all text-center font-bold uppercase tracking-widest text-xs disabled:bg-gray-300">
                        Practice All Verses
                    </button>
                    <div className="h-px bg-gray-200 my-2" />
                    {versesInCollection.length > 0 ? (
                        versesInCollection.map((verseId, idx) => (
                            <button key={idx} onClick={() => startSession(verseId)} className="w-full text-left py-2 border-b border-gray-300 last:border-b-0">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">{verseId}</span>
                                    <span className="text-black">&gt;</span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No verses in this collection.</p>
                    )}
                    <button onClick={() => setSelectedPracticeCollection(null)}
                        className="px-6 py-4 bg-gray-200 text-black border border-gray-200 rounded hover:bg-gray-300 transition-all text-center font-bold uppercase tracking-widest text-xs mt-6">
                        Back to Collections
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black">
            <h1 className="text-4xl font-black mb-10 tracking-tighter text-center">Practice Verses</h1>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                {sortedCollectionNames.map(name => (
                    <button key={name} onClick={() => setSelectedPracticeCollection(name)} className="w-full text-left py-2 border-b border-gray-300 last:border-b-0">
                        <div className="flex justify-between items-center">
                            <span className="font-bold">{name}</span>
                            <span className="text-black">&gt;</span>
                        </div>
                    </button>
                ))}
                <button onClick={() => setView('menu')}
                    className="px-6 py-4 bg-gray-200 text-black border border-gray-200 rounded hover:bg-gray-300 transition-all text-center font-bold uppercase tracking-widest text-xs mt-6">
                    Back to Main Menu
                </button>
            </div>
        </div>
    );
}
