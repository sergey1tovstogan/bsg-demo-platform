import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageTree } from './PageTree';
import { vi } from 'vitest';
import * as NavigationProvider from '@/components/template-navigation/NavigationProvider';

// Mock NavigationProvider
vi.mock('@/components/template-navigation/NavigationProvider', () => ({
    useNavigation: vi.fn()
}));

const mockHierarchy = {
    items: [
        {
            id: 'p1',
            title: 'Page 1',
            children: [
                { id: 'p1-1', title: 'Subpage 1-1', children: [] }
            ]
        },
        {
            id: 'p2',
            title: 'Page 2',
            children: []
        }
    ]
};

describe('PageTree', () => {
    it('should render hierarchy items', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            // @ts-ignore
            hierarchy: mockHierarchy,
            currentPage: 'p1',
            navigateToPage: vi.fn(),
            card: { navigation: { show_page_tree: true } }
        });

        render(<PageTree />);
        expect(screen.getByText('Page 1')).toBeInTheDocument();
        expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    it('should render children items', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            // @ts-ignore
            hierarchy: mockHierarchy,
            currentPage: 'p1',
            navigateToPage: vi.fn(),
            card: { navigation: { show_page_tree: true } }
        });

        render(<PageTree />);
        expect(screen.getByText('Subpage 1-1')).toBeInTheDocument();
    });

    it('should call navigateToPage on click', () => {
        const mockNavigate = vi.fn();
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            // @ts-ignore
            hierarchy: mockHierarchy,
            currentPage: 'p1',
            navigateToPage: mockNavigate,
            card: { navigation: { show_page_tree: true } }
        });

        render(<PageTree />);
        fireEvent.click(screen.getByText('Page 2'));
        expect(mockNavigate).toHaveBeenCalledWith('p2');
    });

    it('should highlight current page', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            // @ts-ignore
            hierarchy: mockHierarchy,
            currentPage: 'p1',
            navigateToPage: vi.fn(),
            card: { navigation: { show_page_tree: true } }
        });

        render(<PageTree />);
        // Assuming active class or aria-current
        // Implementation detail: we'll check class logic or aria-current
        const link = screen.getByText('Page 1').closest('button');
        expect(link).toHaveAttribute('aria-current', 'page');
    });
});
