import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComponentPage } from './ComponentPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as apiServiceModule from '../services/api';

// Mock dependencies
vi.mock('../services/api', () => ({
    apiService: {
        getComponentData: vi.fn(),
    },
}));

vi.mock('../components/gallery/CardGallery', () => ({
    CardGallery: ({ onSelectCard }: any) => (
        <div data-testid="card-gallery">
            <button onClick={() => onSelectCard('some/path')}>Select Card</button>
        </div>
    ),
}));

vi.mock('../components/editor/VisualEditor', () => ({
    VisualEditor: () => <div data-testid="visual-editor">Editor Content</div>,
}));

vi.mock('../components/template-renderer/TemplateCardWrapper', () => ({
    TemplateCardWrapper: ({ cardPath }: any) => (
        <div data-testid="template-wrapper">Wrapper for {cardPath}</div>
    ),
}));

describe('ComponentPage Gallery and Editor', () => {

    it('renders CardGallery when componentId is gallery', () => {
        render(<ComponentPage componentId="gallery" />);
        expect(screen.getByTestId('card-gallery')).toBeInTheDocument();
        expect(screen.queryByTestId('visual-editor')).not.toBeInTheDocument();
    });

    it('renders VisualEditor when componentId is editor', () => {
        render(<ComponentPage componentId="editor" />);
        expect(screen.getByTestId('visual-editor')).toBeInTheDocument();
        expect(screen.queryByTestId('card-gallery')).not.toBeInTheDocument();
    });

    it('switches to TemplateCardWrapper when card is selected in Gallery', async () => {
        render(<ComponentPage componentId="gallery" />);

        const selectButton = screen.getByText('Select Card');
        fireEvent.click(selectButton);

        await waitFor(() => {
            expect(screen.getByTestId('template-wrapper')).toBeInTheDocument();
            expect(screen.getByText('Wrapper for some/path')).toBeInTheDocument();
        });

        expect(screen.getByText('Back to Gallery')).toBeInTheDocument();
    });

    it('returns to Gallery when Back button is clicked', async () => {
        render(<ComponentPage componentId="gallery" />);

        // Select card
        fireEvent.click(screen.getByText('Select Card'));
        await waitFor(() => screen.getByTestId('template-wrapper'));

        // Click back
        fireEvent.click(screen.getByText('Back to Gallery'));

        await waitFor(() => {
            expect(screen.getByTestId('card-gallery')).toBeInTheDocument();
            expect(screen.queryByTestId('template-wrapper')).not.toBeInTheDocument();
        });
    });
});
