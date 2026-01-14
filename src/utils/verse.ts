export const createVerseRange = (
    selectedBook: string, 
    startChapter: string, 
    startVerse: string, 
    endChapter: string | null, 
    endVerse: string | null
) => {
    if (selectedBook && startChapter && startVerse) {
        const endChap = endChapter || startChapter;
        const endV = endVerse || startVerse;
        const verseRange = startChapter === endChap 
            ? `${selectedBook} ${startChapter}:${startVerse}${startVerse === endV ? '' : '-' + endV}`
            : `${selectedBook} ${startChapter}:${startVerse}-${endChap}:${endV}`;
        return verseRange;
    }
    return '';
}
