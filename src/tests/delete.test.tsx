import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DeleteVerses from '../components/DeleteVerses';
import { SavedVerse } from '../types';

describe('DeleteVerses Component', () => {
    const savedVerses: SavedVerse[] = [
        {
            book: "Genesis",
            startChapter: "1",
            startVerse: "1",
            endChapter: "1",
            endVerse: "1",
            range: "Genesis 1:1",
            text: "In the beginning God created the heavens and the earth."
        },
        {
            book: "John",
            startChapter: "3",
            startVerse: "16",
            endChapter: "3",
            endVerse: "16",
            range: "John 3:16",
            text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."
        }
    ];
    const handleDeleteVerse = vi.fn();
    const setView = vi.fn();

    it('renders the list of verses and delete buttons', () => {
        render(<DeleteVerses savedVerses={savedVerses} handleDeleteVerse={handleDeleteVerse} setView={setView} />);
        
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
        expect(screen.getByText('John 3:16')).toBeInTheDocument();
        
        const deleteButtons = screen.getAllByText('Delete');
        expect(deleteButtons).toHaveLength(2);
    });

    it('calls handleDeleteVerse when a delete button is clicked', () => {
        render(<DeleteVerses savedVerses={savedVerses} handleDeleteVerse={handleDeleteVerse} setView={setView} />);
        
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
        
        expect(handleDeleteVerse).toHaveBeenCalledWith('Genesis 1:1');
    });

    it('calls setView when the back button is clicked', () => {
        render(<DeleteVerses savedVerses={savedVerses} handleDeleteVerse={handleDeleteVerse} setView={setView} />);
        
        fireEvent.click(screen.getByText('Back'));
        
        expect(setView).toHaveBeenCalledWith('add-verse');
    });
});

