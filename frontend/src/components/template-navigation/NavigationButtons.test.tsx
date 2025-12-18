import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationButtons } from './NavigationButtons';
import { vi } from 'vitest';

// Mock NavigationProvider
const mockNavigateBack = vi.fn();
const mockBackToAgenda = vi.fn();
const mockNavigateToPage = vi.fn();

vi.mock('@/components/template-navigation/NavigationProvider', () => ({
    useNavigation: () => ({
        navigateBack: mockNavigateBack,
        backToAgenda: mockBackToAgenda,
        navigateToPage: mockNavigateToPage,
        // Add hierarchy to simulate prev/next logic if component logic relies on it
        hierarchy: {
            items: [
                { id: 'page-1', next: 'page-2' },
                { id: 'page-2', prev: 'page-1', next: 'page-3' },
                { id: 'page-3', prev: 'page-2' }
            ]
        },
        currentPage: 'page-2'
    })
}));

describe('NavigationButtons', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render navigation buttons', () => {
        render(<NavigationButtons />);
        expect(screen.getByText('Back to Agenda')).toBeInTheDocument();
    });

    it('should call backToAgenda when clicked', () => {
        render(<NavigationButtons />);
        fireEvent.click(screen.getByText('Back to Agenda'));
        expect(mockBackToAgenda).toHaveBeenCalled();
    });
});
