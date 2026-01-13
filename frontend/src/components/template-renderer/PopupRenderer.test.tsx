import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PopupRenderer } from './PopupRenderer';
import { vi } from 'vitest';
import * as NavigationProvider from '@/components/template-navigation/NavigationProvider';

// Mock dependencies
vi.mock('./SectionRenderer', () => ({
    SectionRenderer: ({ section }: any) => <div data-testid="section">{section.type}</div>
}));

// Mock NavigationProvider module
vi.mock('@/components/template-navigation/NavigationProvider', () => ({
    useNavigation: vi.fn()
}));

const mockClosePopup = vi.fn();
const mockGetPage = vi.fn();

const defaultContext = {
    card: { popups: [] },
    currentPage: null,
    hierarchy: {},
    breadcrumbs: [],
    popupStack: [],
    navigateToPage: vi.fn(),
    navigateBack: vi.fn(),
    backToAgenda: vi.fn(),
    showPopup: vi.fn(),
    closePopup: mockClosePopup,
    getPage: mockGetPage
};

describe('PopupRenderer', () => {
    it('should render nothing if no popup in stack', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            ...defaultContext,
            popupStack: [],
            card: {
                // @ts-expect-error
                popups: []
            }
        });

        const { container } = render(<PopupRenderer />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render active popup overlay', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            ...defaultContext,
            popupStack: ['popup-1'],
            card: {
                // @ts-expect-error
                popups: [
                    {
                        id: 'popup-1',
                        title: 'Test Popup',
                        content: []
                    }
                ]
            }
        });

        render(<PopupRenderer />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Test Popup')).toBeInTheDocument();
    });

    it('should close on close button click', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            ...defaultContext,
            popupStack: ['popup-1'],
            card: {
                // @ts-expect-error
                popups: [
                    { id: 'popup-1', title: 'Test Popup', content: [] }
                ]
            }
        });

        render(<PopupRenderer />);
        const closeBtn = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeBtn);
        expect(mockClosePopup).toHaveBeenCalled();
    });
});
