export interface SavedVerse {
  book: string;
  startChapter: string;
  startVerse: string;
  endChapter: string;
  endVerse: string;
  range: string;
  text: string;
}

export interface Collections {
  [key: string]: string[];
}

export interface BibleData {
  [book: string]: {
    [chapter: string]: {
      [verse: string]: string;
    };
  };
}

export type View = 'menu' | 'add-verse' | 'edit-collections' | 'delete-verses' | 'import-verses' | 'practice-menu' | 'testing';
export type Mode = 'practice' | 'test';
export type TypingMode = 'firstLetter' | 'allLetters';
export type AnimationClass = 'fadeIn' | 'fadeOut' | 'fadeIn animated-fast' | 'fadeOut animated-fast';
export type LetterStatus = 'idle' | 'correct' | 'incorrect';

export interface Word {
    original: string;
    key: string;
    verseNum: string;
    isVerseStart: boolean;
    book: string;
    letters: { original: string; status: 'pending' | 'correct' | 'wrong' }[];
}
