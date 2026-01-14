import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MainMenu from './components/MainMenu';
import AddVerse from './components/AddVerse';
import EditCollections from './components/EditCollections';
import PracticeMenu from './components/PracticeMenu';
import PracticeView from './components/PracticeView';
import DeleteVerses from './components/DeleteVerses';
import ImportVerses from './components/ImportVerses';
import { BibleData, SavedVerse } from './types';
import {
    addSavedVerse,
    createCollection,
    deleteCollection,
    addVerseToCollection,
    removeVerseFromCollection,
    deleteSavedVerse,
} from './store/versesSlice';
import {
    setView,
    setMode,
    setTypingMode,
    setSelectedChapter,
    setEditingCollection,
    setSelectedPracticeCollection,
} from './store/viewSlice';
import { RootState, AppDispatch } from './store';
import { usePracticeSession } from './hooks/usePracticeSession';
import { createVerseRange } from './utils/verse';

declare global {
    interface Window {
        BIBLE_DATA?: BibleData;
        electron?: {
            receive: (channel: string, func: (path: string) => void) => void;
        };
    }
}

export default function App() {
    const dispatch: AppDispatch = useDispatch();
    const { savedVerses, collections } = useSelector((state: RootState) => state.verses);
    const { view, mode, typingMode, selectedChapter, editingCollection, selectedPracticeCollection } = useSelector((state: RootState) => state.view);
    const [bibleData, setBibleData] = useState<BibleData | null>(null);

    const {
        sessionWords,
        currentIndex,
        currentWordIndex,
        history,
        inputRef,
        cursorRef,
        letterStatus,
        handleKeyPress,
        accuracy,
        resetSession,
    } = usePracticeSession(bibleData, selectedChapter, editingCollection, typingMode, mode);

    const [animationClass, setAnimationClass] = useState('fadeIn');
    const handleSetView = (newView: any) => {
        setAnimationClass('fadeOut animated-fast');
        setTimeout(() => {
            dispatch(setView(newView));
            setAnimationClass('fadeIn animated-fast');
        }, 150);
    };

    useEffect(() => {
        if (window.BIBLE_DATA) {
            setBibleData(window.BIBLE_DATA);
        } else if (window.electron) {
            window.electron.receive('esv-path', (path: string) => {
                fetch(path)
                    .then(response => response.json())
                    .then(data => setBibleData(data));
            });
        } else {
            fetch('/esv.json')
                .then(response => response.json())
                .then(data => setBibleData(data));
        }
    }, []);
    
    useEffect(() => {
        if (view === 'testing') {
            const focus = () => inputRef.current?.focus();
            focus();
            window.addEventListener('click', focus);
            return () => window.removeEventListener('click', focus);
        }
    }, [view, inputRef]);
    const handleAddVerse = (selectedBook: string, startChapter: string, startVerse: string, endChapter: string, endVerse: string, silent = false) => {
        const verseRange = createVerseRange(selectedBook, startChapter, startVerse, endChapter, endVerse);
        if (!verseRange) return 'invalid';

        if (savedVerses.some(v => v.range === verseRange)) {
            if (!silent) alert('This verse range is already saved.');
            return 'duplicate';
        }

        let text = '';
        if(!bibleData) return 'invalid';
        const chapters = Object.keys(bibleData[selectedBook]);
        const startChapIndex = chapters.indexOf(startChapter);
        const endChapIndex = chapters.indexOf(endChapter || startChapter);

        for (let i = startChapIndex; i <= endChapIndex; i++) {
            const chap = chapters[i];
            const verses = Object.keys(bibleData[selectedBook][chap]);
            const start = (chap === startChapter) ? verses.indexOf(startVerse) : 0;
            const end = (chap === (endChapter || startChapter)) ? verses.indexOf(endVerse || startVerse) : verses.length - 1;
            
            for (let j = start; j <= end; j++) {
                text += bibleData[selectedBook][chap][verses[j]] + ' ';
            }
        }

        const newVerse: SavedVerse = {
            book: selectedBook,
            startChapter: startChapter,
            startVerse: startVerse,
            endChapter: endChapter || startChapter,
            endVerse: endVerse || startVerse,
            range: verseRange,
            text: text.trim()
        };

        dispatch(addSavedVerse(newVerse));
        if (!silent) alert('Verse range added!');
        return 'added';
    };

    const handleCreateCollection = (newCollectionName: string) => {
        if (newCollectionName && !collections[newCollectionName]) {
            dispatch(createCollection(newCollectionName));
        } else if (collections[newCollectionName]) {
            alert('A collection with this name already exists.');
        }
    };

    const handleDeleteCollection = (name: string) => {
        if (name !== "All Verses") {
            dispatch(deleteCollection(name));
        } else {
            alert('Cannot delete the "All Verses" collection.');
        }
    };

    const handleAddVerseToCollection = (collectionName: string, verseId: string) => {
        dispatch(addVerseToCollection({ collectionName, verseId }));
    };

    const handleRemoveVerseFromCollection = (collectionName: string, verseId: string) => {
        dispatch(removeVerseFromCollection({ collectionName, verseId }));
    };

    const handleDeleteVerse = (verseRange: string) => {
        dispatch(deleteSavedVerse(verseRange));
    };

    const startSession = (chapter: string) => {
        setAnimationClass('fadeOut animated-fast');
        setTimeout(() => {
            dispatch(setSelectedChapter(chapter));
            resetSession();
            dispatch(setView('testing'));
            setAnimationClass('fadeIn animated-fast');
        }, 150);
    };

    const startCollectionSession = (collectionName: string) => {
        dispatch(setEditingCollection(collectionName));
        startSession(collectionName);
    };

    const toggleMode = () => {
        if(!selectedChapter) return;
        const newMode = mode === 'test' ? 'practice' : 'test';
        dispatch(setMode(newMode));
    };

    const toggleTypingMode = () => {
        if(!selectedChapter) return;
        const newTypingMode = typingMode === 'firstLetter' ? 'allLetters' : 'firstLetter';
        dispatch(setTypingMode(newTypingMode));
    }
    
    const renderView = () => {
        if (!bibleData) {
            return <div>Loading...</div>;
        }

        if (view === 'menu') {
            return <MainMenu setView={handleSetView} />;
        }
    
        if (view === 'add-verse') {
            return <AddVerse bibleData={bibleData} handleAddVerse={handleAddVerse} setView={handleSetView} />;
        }
    
        if (view === 'edit-collections') {
            return <EditCollections 
                collections={collections} 
                savedVerses={savedVerses}
                handleCreateCollection={handleCreateCollection}
                handleDeleteCollection={handleDeleteCollection}
                handleAddVerseToCollection={handleAddVerseToCollection}
                handleRemoveVerseFromCollection={handleRemoveVerseFromCollection}
                setView={handleSetView} 
            />;
        }
    
        if (view === 'delete-verses') {
            return <DeleteVerses
                savedVerses={savedVerses}
                handleDeleteVerse={handleDeleteVerse}
                setView={handleSetView}
            />;
        }

        if (view === 'import-verses') {
            return <ImportVerses
                handleAddVerse={handleAddVerse}
                setView={handleSetView}
                savedVerses={savedVerses}
                bibleData={bibleData}
            />;
        }
    
        if (view === 'practice-menu') {
            return <PracticeMenu 
                collections={collections} 
                startSession={startSession} 
                startCollectionSession={startCollectionSession} 
                setView={handleSetView}
                selectedPracticeCollection={selectedPracticeCollection}
                setSelectedPracticeCollection={(collection) => dispatch(setSelectedPracticeCollection(collection))}
            />;
        }
    
        if (view === 'testing') {
            return <PracticeView
                accuracy={accuracy}
                currentIndex={currentIndex}
                sessionWords={sessionWords}
                toggleMode={toggleMode}
                mode={mode}
                typingMode={typingMode}
                toggleTypingMode={toggleTypingMode}
                startSession={startSession}
                selectedChapter={selectedChapter}
                setView={handleSetView}
                history={history}
                cursorRef={cursorRef}
                inputRef={inputRef}
                handleKeyPress={handleKeyPress}
                currentWordIndex={currentWordIndex}
                currentLetterIndex={currentIndex}
                letterStatus={letterStatus}
            />;
        }
    
        return null;
    }

    return (
        <div className={`animated ${animationClass}`}>
            {renderView()}
        </div>
    );
}
