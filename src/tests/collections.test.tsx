import EditCollections from '@/components/EditCollections.js';
import { Collections, SavedVerse } from '@/types.js';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('EditCollections Component', () => {
    const collections: Collections = { "All Verses": [], "Favorites": ["Genesis 1:1"], "Test Collection": [] };
    const savedVerses: SavedVerse[] = [{
        book: "Genesis",
        startChapter: "1",
        startVerse: "1",
        endChapter: "1",
        endVerse: "1",
        range: "Genesis 1:1",
        text: "In the beginning..."
    }];
    const handleCreateCollection = vi.fn();
    const handleDeleteCollection = vi.fn();
    const handleAddVerseToCollection = vi.fn();
    const handleRemoveVerseFromCollection = vi.fn();
    const setView = vi.fn();

    it('renders collections and allows creation of new collections', () => {
        render(<EditCollections 
            collections={collections} 
            savedVerses={savedVerses} 
            handleCreateCollection={handleCreateCollection}
            handleDeleteCollection={handleDeleteCollection}
            handleAddVerseToCollection={handleAddVerseToCollection}
            handleRemoveVerseFromCollection={handleRemoveVerseFromCollection}
            setView={setView} 
        />);

        expect(screen.getByText('Create/Edit Collections')).toBeInTheDocument();
        expect(screen.getByText('Favorites')).toBeInTheDocument();
        
        const input = screen.getByPlaceholderText('New collection name');
        fireEvent.change(input, { target: { value: 'New Test Collection' } });
        fireEvent.click(screen.getByText('Create'));
        expect(handleCreateCollection).toHaveBeenCalledWith('New Test Collection');
    });

    it('allows editing a collection', () => {
        render(<EditCollections 
            collections={collections} 
            savedVerses={savedVerses} 
            handleCreateCollection={handleCreateCollection}
            handleDeleteCollection={handleDeleteCollection}
            handleAddVerseToCollection={handleAddVerseToCollection}
            handleRemoveVerseFromCollection={handleRemoveVerseFromCollection}
            setView={setView} 
        />);

        fireEvent.click(screen.getAllByText('Edit')[0]);
        expect(screen.getByText('Editing: Favorites')).toBeInTheDocument();
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
    });
});
