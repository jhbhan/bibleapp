import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Word, Mode, TypingMode, SavedVerse } from '../types';

export const usePracticeSession = (
    bibleData: any, 
    selectedChapter: string | null, 
    editingCollection: string | null, 
    typingMode: TypingMode, 
    mode: Mode
) => {
    const { savedVerses, collections } = useSelector((state: RootState) => state.verses);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [attempts, setAttempts] = useState({ correct: 0, total: 0 });
    const [history, setHistory] = useState<Word[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const cursorRef = useRef<HTMLSpanElement>(null);
    const [letterStatus, setLetterStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

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

    const resetSession = () => {
        setCurrentIndex(0);
        setCurrentWordIndex(0);
        setAttempts({ correct: 0, total: 0 });
        setHistory([]);
    }

    return {
        sessionWords,
        currentIndex,
        currentWordIndex,
        attempts,
        history,
        inputRef,
        cursorRef,
        letterStatus,
        handleKeyPress,
        accuracy,
        resetSession,
    };
};
