import React, { useState } from 'react';
import { Collections, SavedVerse, View } from '../../types';

interface EditCollectionsProps {
    collections: Collections;
    savedVerses: SavedVerse[];
    handleCreateCollection: (name: string) => void;
    handleDeleteCollection: (name: string) => void;
    handleAddVerseToCollection: (collectionName: string, verseId: string) => void;
    handleRemoveVerseFromCollection: (collectionName: string, verseId: string) => void;
    setView: (view: View) => void;
}

export default function EditCollections({ collections, savedVerses, handleCreateCollection, handleDeleteCollection, handleAddVerseToCollection, handleRemoveVerseFromCollection, setView }: EditCollectionsProps) {
    const [newCollectionName, setNewCollectionName] = useState('');
    const [editingCollection, setEditingCollection] = useState<string | null>(null);

    const onCreateCollection = () => {
        handleCreateCollection(newCollectionName);
        setNewCollectionName('');
    }

    if (editingCollection) {
        const verseIdsInCollection = collections[editingCollection];
        const versesNotInCollection = savedVerses.filter(v => !verseIdsInCollection.includes(v.range));

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black">
                <h1 className="text-3xl font-black mb-6 tracking-tighter text-center">Editing: {editingCollection}</h1>
                <div className="w-full max-w-md">
                    <h2 className="text-xl font-bold mb-2">Verses in this Collection</h2>
                    {verseIdsInCollection.map(verseId => (
                        <div key={verseId} className="flex justify-between items-center p-2 border-b">
                            <span>{verseId}</span>
                            <button onClick={() => handleRemoveVerseFromCollection(editingCollection, verseId)} className="btn btn-danger">Remove</button>
                        </div>
                    ))}

                    <h2 className="text-xl font-bold mt-6 mb-2">Add Verses</h2>
                    {versesNotInCollection.map(v => (
                         <div key={v.range} className="flex justify-between items-center p-2 border-b">
                            <span>{v.range}</span>
                            <button onClick={() => handleAddVerseToCollection(editingCollection, v.range)} className="btn btn-primary">Add</button>
                        </div>
                    ))}
                </div>
                <button onClick={() => setEditingCollection(null)}
                    className="btn btn-secondary mt-6">
                    Back to Collections
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black">
            <h1 className="text-4xl font-black mb-10 tracking-tighter text-center">Create/Edit Collections</h1>
            <div className="w-full max-w-xs">
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="New collection name"
                        className="px-4 py-3 border border-gray-300 rounded w-full"
                    />
                    <button onClick={onCreateCollection} className="btn btn-primary px-6 py-3">Create</button>
                </div>

                <div className="flex flex-col gap-3">
                    {Object.keys(collections).filter(name => name !== "All Verses").map(name => (
                        <div key={name} className="flex justify-between items-center p-3 border rounded">
                            <span className="font-bold">{name}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingCollection(name)} className="text-sm text-blue-500 hover:underline">Edit</button>
                                {name !== "All Verses" && (
                                    <button onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete the collection "${name}"?`)) {
                                            handleDeleteCollection(name);
                                        }
                                    }} className="text-sm text-red-500 hover:underline">Delete</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={() => setView('menu')}
                    className="btn btn-secondary w-full mt-6">
                    Back to Main Menu
                </button>
            </div>
        </div>
    );
}
