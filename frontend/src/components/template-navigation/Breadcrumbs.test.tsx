import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Breadcrumbs } from './Breadcrumbs';
import { vi } from 'vitest';

// Mock NavigationProvider
const mockNavigateToPage = vi.fn();
const mockBackToAgenda = vi.fn();

vi.mock('@/components/template-navigation/NavigationProvider', () => ({
    useNavigation: () => ({
        breadcrumbs: [
            { id: 'agenda', label: 'Agenda', type: 'agenda' },
            { id: 'parent', label: 'Parent Page', type: 'page' },
            { id: 'current', label: 'Current Page', type: 'page' }
        ],
        navigateToPage: mockNavigateToPage,
        backToAgenda: mockBackToAgenda
    })
}));

describe('Breadcrumbs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render all breadcrumb items', () => {
        render(<Breadcrumbs />);
        expect(screen.getByText('Agenda')).toBeInTheDocument();
        expect(screen.getByText('Parent Page')).toBeInTheDocument();
        expect(screen.getByText('Current Page')).toBeInTheDocument();
    });

    it('should navigate to page when clicked', () => {
        render(<Breadcrumbs />);
        fireEvent.click(screen.getByText('Parent Page'));
        expect(mockNavigateToPage).toHaveBeenCalledWith('parent');
    });

    it('should navigate to agenda when agenda clicked', () => {
        render(<Breadcrumbs />);
        fireEvent.click(screen.getByText('Agenda'));
        expect(mockBackToAgenda).toHaveBeenCalled();
    });

    it('should not be clickable for current page (last item)', () => {
        render(<Breadcrumbs />);
        const current = screen.getByText('Current Page');
        fireEvent.click(current);
        expect(mockNavigateToPage).not.toHaveBeenCalled();
        expect(mockBackToAgenda).not.toHaveBeenCalled();
    });
});
