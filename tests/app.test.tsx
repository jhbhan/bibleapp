import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../app';
import MainMenu from '../components/MainMenu';
import { BibleData } from '../types';

const bibleData: BibleData = {
    "Genesis": {
        "1": { "1": "In the beginning..." }
    }
};

describe('App Component', () => {
    beforeEach(() => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            json: () => Promise.resolve(bibleData),
        } as Response);
    });

    it('renders MainMenu by default', async () => {
        render(<App />);
        await waitFor(() => {
            expect(screen.getByText('ActsType')).toBeInTheDocument();
            expect(screen.getByText('Practice Verses')).toBeInTheDocument();
        });
    });

    it('navigates to different views', async () => {
        render(<App />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Add/Edit Verses'));
            expect(screen.getByText('Add/Edit Verses')).toBeInTheDocument();
        });
    });
});

describe('MainMenu Component', () => {
    it('renders all buttons and calls setView on click', () => {
        const setView = vi.fn();
        render(<MainMenu setView={setView} />);
        
        const practiceButton = screen.getByText('Practice Verses');
        fireEvent.click(practiceButton);
        expect(setView).toHaveBeenCalledWith('practice-menu');

        const addButton = screen.getByText('Add/Edit Verses');
        fireEvent.click(addButton);
        expect(setView).toHaveBeenCalledWith('add-verse');

        const collectionsButton = screen.getByText('Create/Edit Collections');
        fireEvent.click(collectionsButton);
        expect(setView).toHaveBeenCalledWith('edit-collections');
    });
});