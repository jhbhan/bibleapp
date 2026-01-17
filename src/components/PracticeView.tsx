import React from 'react';
import { Word, Mode, TypingMode, View, LetterStatus } from '@/types';

interface PracticeViewProps {
    accuracy: number;
    currentIndex: number;
    currentWordIndex: number;
    currentLetterIndex: number;
    sessionWords: Word[];
    toggleMode: () => void;
    mode: Mode;
    typingMode: TypingMode;
    toggleTypingMode: () => void;
    startSession: (chapter: string) => void;
    selectedChapter: string | null;
    setView: (view: View) => void;
    history: Word[];
    cursorRef: React.RefObject<HTMLSpanElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    letterStatus: LetterStatus;
}

export default function PracticeView({
    accuracy,
    currentIndex,
    currentWordIndex,
    currentLetterIndex,
    sessionWords,
    toggleMode,
    mode,
    typingMode,
    toggleTypingMode,
    startSession,
    selectedChapter,
    setView,
    history,
    cursorRef,
    inputRef,
    handleKeyPress,
    letterStatus
}: PracticeViewProps) {
    return (
        <div className="min-h-screen bg-white text-black">
            <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-100 p-4">
                <div className="max-w-3xl mx-auto flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                    <div className="flex gap-8">
                        {typingMode === 'firstLetter' && <div>ACCURACY: <span className={accuracy < 90 ? 'text-red-500' : 'text-black'}>{accuracy}%</span></div>}
                        <div>PROGRESS: <span className="text-black">{currentWordIndex} / {sessionWords.length}</span></div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={toggleTypingMode}
                            className={`btn-sm ${typingMode === 'allLetters' ? 'btn-primary' : 'border-gray-200 hover:border-black hover:text-black text-gray-400'}`}
                        >
                            {typingMode === 'firstLetter' ? 'Type First Letter' : 'Type All Letters'}
                        </button>
                        <button
                            onClick={toggleMode}
                            className={`btn-sm ${mode === 'test' ? 'btn-primary' : 'border-gray-200 hover:border-black hover:text-black text-gray-400'}`}
                        >
                            {mode === 'practice' ? 'Practice Mode' : 'Test Mode'}
                        </button>
                        <button onClick={() => selectedChapter && startSession(selectedChapter)} className="hover:text-black transition-colors px-1">Retry</button>
                        <button onClick={() => setView('practice-menu')} className="hover:text-black transition-colors px-1">Back</button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-8 pt-32 pb-64 min-h-screen flex flex-col">
                <div className={`flex flex-wrap gap-x-2 gap-y-3 text-2xl leading-relaxed tracking-tight text-justify`}>
                    {history.map((word, wordIdx) => {
                        const prevWord = wordIdx > 0 ? history[wordIdx - 1] : null;
                        const showBook = word.isVerseStart && (!prevWord || prevWord.book !== word.book);
                        return (
                            <React.Fragment key={wordIdx}>
                                {showBook && (
                                    <div className="w-full mt-4">
                                        <span className="text-[15px] text-gray-300 font-black">{word.book}</span>
                                    </div>
                                )}
                                {word.isVerseStart && (
                                    <span className="text-[15px] text-gray-300 font-black self-center mr-1 select-none">
                                        {word.verseNum}
                                    </span>
                                )}
                                {typingMode === 'firstLetter' ? (
                                    <span className={word.letters.every(letter => letter.status === 'correct') ? 'text-black font-bold' : 'text-red-500 font-bold'}>
                                        {word.original}
                                    </span>
                                ) : (
                                    <span className="font-bold">
                                        {word.letters.map((letter, letterIdx) => (
                                            <span key={letterIdx} className="text-black">
                                                {letter.original}
                                            </span>
                                        ))}
                                    </span>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {currentWordIndex < sessionWords.length && (() => {
                        const currentWord = sessionWords[currentWordIndex];
                        const prevWord = history.length > 0 ? history[history.length - 1] : null;
                        const showBook = currentWord.isVerseStart && (!prevWord || prevWord.book !== currentWord.book);

                        return (
                            <React.Fragment>
                                {showBook && (
                                    <div className="w-full mt-4">
                                        <span className="text-[15px] text-gray-300 font-black">{currentWord.book}</span>
                                    </div>
                                )}
                                {currentWord.isVerseStart && (
                                    <span className="text-[15px] text-gray-300 font-black self-center mr-1 select-none">
                                        {currentWord.verseNum}
                                    </span>
                                )}
                                {typingMode === 'firstLetter' ? (
                                    <span ref={cursorRef} className="relative flex items-center cursor-marker">
                                        <span className="w-4 h-8 bg-black/5 border-b-2 border-black animate-pulse"></span>
                                        {mode === 'practice' && (
                                            <span className="absolute left-6 whitespace-nowrap text-[9px] text-gray-300 font-bold tracking-widest animate-pulse pointer-events-none">
                                                ← ARROW KEY TO REWIND
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="font-bold">
                                        {currentWord.letters.map((letter, letterIdx) => {
                                            if (letterIdx < currentLetterIndex) {
                                                return (
                                                    <span key={letterIdx} className="text-black">
                                                        {letter.original}
                                                    </span>
                                                );
                                            }
                                            if (letterIdx === currentLetterIndex) {
                                                return (
                                                    <span key={letterIdx} ref={cursorRef} className={`relative inline-block cursor-marker ${letterStatus === 'incorrect' ? 'shake' : ''}`}>
                                                        <span className={`w-0.5 h-8 bg-black animate-pulse ${letterStatus === 'incorrect' ? 'blink-red' : ''}`}></span>
                                                        <span className="opacity-20">_</span>
                                                        {mode === 'practice' && (
                                                            <span className="absolute left-6 whitespace-nowrap text-[9px] text-gray-400 font-bold tracking-widest animate-pulse pointer-events-none">
                                                                ← to rewind / → to peek
                                                            </span>
                                                        )}
                                                    </span>
                                                );
                                            }
                                            return <span key={letterIdx} className="opacity-20">_</span>;
                                        })}
                                    </span>
                                )}
                            </React.Fragment>
                        );
                    })()}
                </div>

                {currentWordIndex >= sessionWords.length && sessionWords.length > 0 && (
                    <div className="mt-12 p-12 border-t border-gray-100 text-center">
                        <h2 className="text-2xl font-bold mb-2 tracking-tighter uppercase">Finished</h2>
                        {typingMode === 'firstLetter' && <p className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-8">Final Accuracy: {accuracy}%</p>}
                        <button onClick={() => setView('practice-menu')} className="btn btn-primary px-12 py-3 rounded-full">Back to Practice Menu</button>
                    </div>
                )}
            </main>
            <input ref={inputRef} type="text" className="fixed opacity-0 pointer-events-none" onKeyDown={handleKeyPress} autoFocus />
        </div>
    );
}
