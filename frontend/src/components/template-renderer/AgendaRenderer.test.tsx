import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { AgendaRenderer } from './AgendaRenderer';
import { AgendaDefinition } from '@/lib/template-types';

// Mock SectionRenderer since we only need to test that it's called
vi.mock('../SectionRenderer', () => ({
    SectionRenderer: ({ section }: any) => <div data-testid="section">{section.type}</div>
}));

// Mock NavigationProvider
const mockNavigateToPage = vi.fn();
vi.mock('@/components/template-navigation/NavigationProvider', () => ({
    useNavigation: () => ({
        navigateToPage: mockNavigateToPage
    })
}));

const mockAgenda: AgendaDefinition = {
    title: 'Test Agenda',
    subtitle: 'Test Subtitle',
    items: [
        {
            id: 'item-1',
            title: 'Item 1',
            description: 'Description 1',
            page_id: 'page-1',
            icon: 'Star',
            status: 'active'
        },
        {
            id: 'item-2',
            title: 'Item 2',
            description: 'Description 2',
            page_id: 'page-2',
            status: 'locked'
        }
    ]
};

describe('AgendaRenderer', () => {
    beforeEach(() => {
        mockNavigateToPage.mockClear();
    });

    it('should render title and subtitle', () => {
        render(<AgendaRenderer agenda={mockAgenda} />);
        expect(screen.getByText('Test Agenda')).toBeInTheDocument();
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should render all agenda items', () => {
        render(<AgendaRenderer agenda={mockAgenda} />);
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should navigate when active item is clicked', () => {
        render(<AgendaRenderer agenda={mockAgenda} />);
        fireEvent.click(screen.getByText('Item 1'));
        expect(mockNavigateToPage).toHaveBeenCalledWith('page-1');
    });

    it('should NOT navigate when locked item is clicked', () => {
        render(<AgendaRenderer agenda={mockAgenda} />);
        fireEvent.click(screen.getByText('Item 2'));
        expect(mockNavigateToPage).not.toHaveBeenCalled();
    });

    it('should render description if present', () => {
        render(<AgendaRenderer agenda={mockAgenda} />);
        expect(screen.getByText('Description 1')).toBeInTheDocument();
    });
});
