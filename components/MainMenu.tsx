import React from 'react';
import { View } from '../../types';

interface MainMenuProps {
    setView: (view: View) => void;
}

export default function MainMenu({ setView }: MainMenuProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black">
            <h1 className="text-4xl font-black mb-10 tracking-tighter text-center">ActsType</h1>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button onClick={() => setView('practice-menu')}
                    className="px-6 py-4 bg-black text-white border border-black rounded hover:bg-zinc-800 transition-all text-center font-bold uppercase tracking-widest text-xs">
                    Practice Verses
                </button>
                <button onClick={() => setView('add-verse')}
                    className="px-6 py-4 bg-black text-white border border-black rounded hover:bg-zinc-800 transition-all text-center font-bold uppercase tracking-widest text-xs">
                    Add/Edit Verses
                </button>
                <button onClick={() => setView('edit-collections')}
                    className="px-6 py-4 bg-black text-white border border-black rounded hover:bg-zinc-800 transition-all text-center font-bold uppercase tracking-widest text-xs">
                    Create/Edit Collections
                </button>
            </div>
        </div>
    );
}
