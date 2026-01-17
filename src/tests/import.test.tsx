import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImportVerses from '../components/ImportVerses';
import { BibleData, SavedVerse } from '../types';

describe('ImportVerses Component', () => {
    const handleAddVerse = vi.fn();
    const setView = vi.fn();
    const savedVerses: SavedVerse[] = [];
    const bibleData: BibleData = {
        "Genesis": {
            "1": {
                "1": "In the beginning God created the heavens and the earth.",
                "2": "The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.",
                "3": "And God said, “Let there be light,” and there was light."
            }
        },
        "John": {
            "3": {
                "16": "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."
            }
        }
    };

    beforeEach(() => {
        handleAddVerse.mockClear();
        setView.mockClear();
    });

    it('renders the component with instructions', () => {
        render(<ImportVerses handleAddVerse={handleAddVerse} setView={setView} savedVerses={savedVerses} bibleData={bibleData} />);
        expect(screen.getByText('Import Verses')).toBeInTheDocument();
        expect(screen.getByText('CSV Format Instructions')).toBeInTheDocument();
    });

    it('handles correct CSV upload', async () => {
        const csvContent = `StartVerse,EndVerse
Genesis 1:1,Genesis 1:3
John 3:16,`;
        const file = new File([csvContent], 'verses.csv', { type: 'text/csv' });

        handleAddVerse.mockReturnValue('added');
        
        render(<ImportVerses handleAddVerse={handleAddVerse} setView={setView} savedVerses={savedVerses} bibleData={bibleData} />);
        
        const input = screen.getByTestId('csv-upload');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(handleAddVerse).toHaveBeenCalledTimes(2);
            expect(handleAddVerse).toHaveBeenCalledWith("Genesis", "1", "1", "1", "3", true);
            expect(handleAddVerse).toHaveBeenCalledWith("John", "3", "16", null, null, true);
        });
    });

    it('shows an error for invalid CSV headers', async () => {
        const csvContent = `WrongHeader1,WrongHeader2
Genesis 1:1,`;
        const file = new File([csvContent], 'verses.csv', { type: 'text/csv' });

        render(<ImportVerses handleAddVerse={handleAddVerse} setView={setView} savedVerses={savedVerses} bibleData={bibleData} />);
        
        const input = screen.getByTestId('csv-upload');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Invalid CSV format. Please make sure the headers are "StartVerse" and "EndVerse".')).toBeInTheDocument();
        });
    });

    it('shows skipped rows for invalid data', async () => {
        const csvContent = `StartVerse,EndVerse
InvalidVerse
Genesis 1:1,InvalidVerse
,Genesis 1:2`;
        const file = new File([csvContent], 'verses.csv', { type: 'text/csv' });

        render(<ImportVerses handleAddVerse={handleAddVerse} setView={setView} savedVerses={[]} bibleData={bibleData} />);
        
        const input = screen.getByTestId('csv-upload');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('The following verses were skipped:')).toBeInTheDocument();
            expect(screen.getByText('InvalidVerse: Invalid verse format. Please use "BOOK CHAPTER:VERSE".')).toBeInTheDocument();
            expect(screen.getByText('Genesis 1:1-InvalidVerse: Invalid verse format. Please use "BOOK CHAPTER:VERSE".')).toBeInTheDocument();
            expect(screen.getByText('N/A: StartVerse is empty.')).toBeInTheDocument();
        });
    });

    it('shows skipped row for duplicate verse', async () => {
        const csvContent = `StartVerse,EndVerse
Genesis 1:1,`;
        const file = new File([csvContent], 'verses.csv', { type: 'text/csv' });
        
        handleAddVerse.mockReturnValue('duplicate');

        render(<ImportVerses handleAddVerse={handleAddVerse} setView={setView} savedVerses={[{book: 'Genesis', startChapter: '1', startVerse: '1', endChapter: '1', endVerse: '1', range: 'Genesis 1:1', text: ''}]} bibleData={bibleData} />);
        
        const input = screen.getByTestId('csv-upload');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('The following verses were skipped:')).toBeInTheDocument();
            expect(screen.getByText('Genesis 1:1: Duplicate verse.')).toBeInTheDocument();
        });
    });

    it('shows skipped row for different books in range', async () => {
        const csvContent = `StartVerse,EndVerse
Genesis 1:1,John 1:1`;
        const file = new File([csvContent], 'verses.csv', { type: 'text/csv' });

        render(<ImportVerses handleAddVerse={handleAddVerse} setView={setView} savedVerses={[]} bibleData={bibleData} />);
        
        const input = screen.getByTestId('csv-upload');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('The following verses were skipped:')).toBeInTheDocument();
            expect(screen.getByText('Genesis 1:1-John 1:1: Verses must be from the same book.')).toBeInTheDocument();
        });
    });
});
