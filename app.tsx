import React, { useState, useEffect, useMemo, useRef } from 'react';
import MainMenu from './components/MainMenu';
import AddVerse from './components/AddVerse';
import EditCollections from './components/EditCollections';
import PracticeMenu from './components/PracticeMenu';
import PracticeView from './components/PracticeView';
import DeleteVerses from './components/DeleteVerses';
import ImportVerses from './components/ImportVerses';
import {
    SavedVerse,
    Collections,
    BibleData,
    View,
    Mode,
    TypingMode,
    AnimationClass,
    LetterStatus,
    Word,
} from '../types';

declare global {
    interface Window {
        BIBLE_DATA?: BibleData;
        electron?: {
            receive: (channel: string, func: (path: string) => void) => void;
        };
    }
}

export default function App() {
    const [view, setView] = useState<View>('menu');
    const [mode, setMode] = useState<Mode>('practice');
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
    const [savedVerses, setSavedVerses] = useState<SavedVerse[]>(() => {
        const saved = localStorage.getItem('savedVerses');
        return saved ? JSON.parse(saved) : [];
    });
    const [collections, setCollections] = useState<Collections>(() => {
        const saved = localStorage.getItem('collections');
        return saved ? JSON.parse(saved) : { "All Verses": [] };
    });
    const [editingCollection, setEditingCollection] = useState<string | null>(null);
    const [selectedPracticeCollection, setSelectedPracticeCollection] = useState<string | null>(null);
    const [typingMode, setTypingMode] = useState<TypingMode>('firstLetter'); // 'firstLetter' or 'allLetters'

    const [animationClass, setAnimationClass] = useState<AnimationClass>('fadeIn'); // Initial animation class
    const handleSetView = (newView: View) => {
        setAnimationClass('fadeOut animated-fast'); // Start fade out
        setTimeout(() => {
            setView(newView);
            setAnimationClass('fadeIn animated-fast'); // Start fade in for new view
        }, 150); // Corresponds to animated-fast
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [attempts, setAttempts] = useState({ correct: 0, total: 0 });
    const [history, setHistory] = useState<Word[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);
    const [bibleData, setBibleData] = useState<BibleData | null>(null);

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
            fetch('esv.json')
                .then(response => response.json())
                .then(data => setBibleData(data));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('savedVerses', JSON.stringify(savedVerses));
        setCollections(prev => ({ ...prev, "All Verses": savedVerses.map(v => v.range) }));
    }, [savedVerses]);

    useEffect(() => {
        localStorage.setItem('collections', JSON.stringify(collections));
    }, [collections]);

    const sessionWords: Word[] = useMemo(() => {
        if (!bibleData || (!selectedChapter && !editingCollection)) return [];
    
        let versesToPractice: (SavedVerse | undefined)[] = [];

        if (editingCollection) {
            versesToPractice = collections[editingCollection].map(verseId => {
                return savedVerses.find(v => v.range === verseId);
            }).filter(Boolean);
        } else if (selectedChapter === 'all-saved') {
            versesToPractice = savedVerses;
        } else if (savedVerses.some(v => v.range === selectedChapter)) {
            const verse = savedVerses.find(v => v.range === selectedChapter);
            if(verse) versesToPractice.push(verse);
        } else if (selectedChapter && collections[selectedChapter]) {
            versesToPractice = collections[selectedChapter].map(verseId => {
                return savedVerses.find(v => v.range === verseId);
            }).filter(Boolean);
        }
    
        const processedWords: Word[] = [];
    
        versesToPractice.forEach(verse => {
            if (!verse) return;
            
            const { book, startChapter, startVerse, endChapter, endVerse } = verse;
            const chapters = Object.keys(bibleData[book]);
            const startChapIndex = chapters.indexOf(startChapter);
            const endChapIndex = chapters.indexOf(endChapter);

            for (let i = startChapIndex; i <= endChapIndex; i++) {
                const chap = chapters[i];
                const verses = Object.keys(bibleData[book][chap]);
                const start = (chap === startChapter) ? verses.indexOf(startVerse) : 0;
                const end = (chap === endChapter) ? verses.indexOf(endVerse) : verses.length - 1;

                for (let j = start; j <= end; j++) {
                    const verseNum = verses[j];
                    const verseText = bibleData[book][chap][verseNum];
                    
                    if (typingMode === 'firstLetter') {
                        const words = verseText.trim().split(/\s+/).filter(w => w.length > 0);
                        words.forEach((word, wordIdx) => {
                            processedWords.push({
                                original: word,
                                key: word.replace(/[^\w]/g, '').toLowerCase()[0],
                                verseNum: verseNum,
                                isVerseStart: wordIdx === 0,
                                book: book,
                                letters: []
                            });
                        });
                    } else {
                            const words = verseText.trim().split(' ');
                        words.forEach((word, wordIdx) => {
                            const letters = (word + (wordIdx < words.length - 1 ? ' ' : '')).split('').map(letter => ({
                                original: letter,
                                status: 'pending' as 'pending' | 'correct' | 'wrong'
                            }));
                            processedWords.push({
                                original: word,
                                key: word.replace(/[^\w]/g, '').toLowerCase()[0],
                                verseNum: verseNum,
                                isVerseStart: wordIdx === 0,
                                book: book,
                                letters: letters
                            });
                        });
                    }
                }
            }
        });
    
        return processedWords;
    }, [bibleData, selectedChapter, editingCollection, collections, savedVerses, typingMode]);

    useEffect(() => {
        if (cursorRef.current) {
            cursorRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentIndex, history.length]);

    const startSession = (chapter: string, currentMode: Mode = mode, currentTypingMode: TypingMode = typingMode) => {
        setAnimationClass('fadeOut animated-fast');
        setTimeout(() => {
            setSelectedChapter(chapter);
            // setEditingCollection(null); // Keep the editing collection
            setCurrentIndex(0);
            setCurrentWordIndex(0);
            setAttempts({ correct: 0, total: 0 });
            setHistory([]);
            setView('testing');
            setMode(currentMode);
            setTypingMode(currentTypingMode);
            setAnimationClass('fadeIn animated-fast');
        }, 150);
    };
    
    const startCollectionSession = (collectionName: string) => {
        setEditingCollection(collectionName);
        startSession(collectionName);
    };

    const toggleMode = () => {
        if(!selectedChapter) return;
        const newMode = mode === 'test' ? 'practice' : 'test';
        startSession(selectedChapter, newMode, typingMode);
    };

    const [letterStatus, setLetterStatus] = useState<LetterStatus>('idle');

    const toggleTypingMode = () => {
        if(!selectedChapter) return;
        const newTypingMode = typingMode === 'firstLetter' ? 'allLetters' : 'firstLetter';
        startSession(selectedChapter, mode, newTypingMode);
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { key } = e;

        if (typingMode === 'firstLetter') {
            if (key === 'ArrowLeft' && mode === 'practice') {
                if (currentWordIndex === 0) return;
                let targetIndex = currentWordIndex;
                if (sessionWords[targetIndex]?.isVerseStart || targetIndex === sessionWords.length) {
                    targetIndex = currentWordIndex - 1;
                }
                while (targetIndex > 0 && !sessionWords[targetIndex].isVerseStart) {
                    targetIndex--;
                }
                const newHistory = history.slice(0, targetIndex);
                const correctCount = newHistory.filter(h => h.status === 'correct').length;
                setHistory(newHistory);
                setCurrentWordIndex(targetIndex);
                setAttempts({ correct: correctCount, total: newHistory.length });
                return;
            }

            if (currentWordIndex >= sessionWords.length) return;
            if (key.length > 1) return;

            const currentWord = sessionWords[currentWordIndex];
            const targetKey = currentWord.key;
            if (!targetKey) {
                setCurrentWordIndex(prev => prev + 1);
                return;
            }
            const isCorrect = key.toLowerCase() === targetKey;
            setHistory(prev => [...prev, { ...currentWord, status: isCorrect ? 'correct' : 'wrong' }]);
            setAttempts(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
            setCurrentWordIndex(prev => prev + 1);

        } else { // allLetters mode
            if (key === 'ArrowLeft' && mode === 'practice') {
                if (currentWordIndex === 0 && currentIndex === 0) return;
                
                let targetWordIndex = currentWordIndex;
                
                if(currentIndex > 0) {
                    // stay on the same word, but go to the beginning of it
                } else if (targetWordIndex > 0) {
                    targetWordIndex--;
                }

                while (targetWordIndex > 0 && !sessionWords[targetWordIndex].isVerseStart) {
                    targetWordIndex--;
                }

                setCurrentWordIndex(targetWordIndex);
                setCurrentIndex(0);
                const newHistory = history.slice(0, targetWordIndex);
                setHistory(newHistory);
                return;
            }

            if (mode === 'practice' && key === 'ArrowRight') {
                const currentWord = sessionWords[currentWordIndex];
                const currentLetter = currentWord.letters[currentIndex];
                currentLetter.status = 'wrong';
                if (currentIndex === currentWord.letters.length - 1) {
                    setHistory(prev => [...prev, currentWord]);
                    setCurrentWordIndex(prev => prev + 1);
                    setCurrentIndex(0);
                } else {
                    setCurrentIndex(prev => prev + 1);
                }
                return;
            }
            
            if (currentWordIndex >= sessionWords.length) return;
            const currentWord = sessionWords[currentWordIndex];
            if(!currentWord) return;
            const currentLetter = currentWord.letters[currentIndex];
            if(!currentLetter) return;

            if (currentLetter.original === '—' || currentLetter.original === '–') {
                currentLetter.status = 'correct';
                if (currentIndex === currentWord.letters.length - 1) {
                    setHistory(prev => [...prev, currentWord]);
                    setCurrentWordIndex(prev => prev + 1);
                    setCurrentIndex(0);
                } else {
                    setCurrentIndex(prev => prev + 1);
                }
                return;
            }
            if (key.length > 1) return;

            const isCorrect = key.toLowerCase() === currentLetter.original.toLowerCase();

            if (isCorrect) {
                currentLetter.status = 'correct';
                if (currentIndex === currentWord.letters.length - 1) {
                    setHistory(prev => [...prev, currentWord]);
                    setCurrentWordIndex(prev => prev + 1);
                    setCurrentIndex(0);
                } else {
                    setCurrentIndex(prev => prev + 1);
                }
            } else {
                setLetterStatus('incorrect');
                setTimeout(() => setLetterStatus('idle'), 300);
            }
        }
    };
    
    const accuracy = attempts.total === 0 ? 100 : Math.round((attempts.correct / attempts.total) * 100);
    
    useEffect(() => {
        if (view === 'testing') {
            const focus = () => inputRef.current?.focus();
            focus();
            window.addEventListener('click', focus);
            return () => window.removeEventListener('click', focus);
        }
    }, [view]);

    const handleAddVerse = (selectedBook: string, startChapter: string, startVerse: string, endChapter: string, endVerse: string, silent = false) => {
        if (selectedBook && startChapter && startVerse) {
            const endChap = endChapter || startChapter;
            const endV = endVerse || startVerse;
            const verseRange = startChapter === endChap 
                ? `${selectedBook} ${startChapter}:${startVerse}${startVerse === endV ? '' : '-' + endV}`
                : `${selectedBook} ${startChapter}:${startVerse}-${endChap}:${endV}`;

            if (savedVerses.some(v => v.range === verseRange)) {
                if (!silent) alert('This verse range is already saved.');
                return 'duplicate';
            }

            let text = '';
            if(!bibleData) return;
            const chapters = Object.keys(bibleData[selectedBook]);
            const startChapIndex = chapters.indexOf(startChapter);
            const endChapIndex = chapters.indexOf(endChap);

            for (let i = startChapIndex; i <= endChapIndex; i++) {
                const chap = chapters[i];
                const verses = Object.keys(bibleData[selectedBook][chap]);
                const start = (chap === startChapter) ? verses.indexOf(startVerse) : 0;
                const end = (chap === endChap) ? verses.indexOf(endV) : verses.length - 1;
                
                for (let j = start; j <= end; j++) {
                    text += bibleData[selectedBook][chap][verses[j]] + ' ';
                }
            }

            const newVerse: SavedVerse = {
                book: selectedBook,
                startChapter: startChapter,
                startVerse: startVerse,
                endChapter: endChap,
                endVerse: endV,
                range: verseRange,
                text: text.trim()
            };

            setSavedVerses(prev => [...prev, newVerse]);
            if (!silent) alert('Verse range added!');
            return 'added';
        }
        return 'invalid';
    };

    const handleCreateCollection = (newCollectionName: string) => {
        if (newCollectionName && !collections[newCollectionName]) {
            setCollections(prev => ({ ...prev, [newCollectionName]: [] }));
        } else if (collections[newCollectionName]) {
            alert('A collection with this name already exists.');
        }
    };

    const handleDeleteCollection = (name: string) => {
        if (name !== "All Verses") {
            const newCollections = { ...collections };
            delete newCollections[name];
            setCollections(newCollections);
        } else {
            alert('Cannot delete the "All Verses" collection.');
        }
    };

    const handleAddVerseToCollection = (collectionName: string, verseId: string) => {
        if (collectionName && !collections[collectionName].includes(verseId)) {
            const newCollections = { ...collections };
            newCollections[collectionName].push(verseId);
            setCollections(newCollections);
        }
    };

    const handleRemoveVerseFromCollection = (collectionName: string, verseId: string) => {
        if (collectionName) {
            const newCollections = { ...collections };
            newCollections[collectionName] = newCollections[collectionName].filter(id => id !== verseId);
            setCollections(newCollections);
        }
    };

    const handleDeleteVerse = (verseRange: string) => {
        setSavedVerses(prev => prev.filter(v => v.range !== verseRange));
    };

    // ... (handleAddVerse and other handlers remain the same)
    
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
                setSelectedPracticeCollection={setSelectedPracticeCollection}
            />;
        }
    
        if (view === 'testing') {
            return <PracticeView
                accuracy={accuracy}
                currentIndex={typingMode === 'allLetters' ? currentWordIndex : currentIndex}
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
