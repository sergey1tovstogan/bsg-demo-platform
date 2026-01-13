import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageRenderer } from './PageRenderer';
import { PageDefinition } from '@/lib/template-types';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('./SectionRenderer', () => ({
    SectionRenderer: ({ section }: any) => <div data-testid="section">{section.type}</div>
}));

vi.mock('@/components/template-navigation/Breadcrumbs', () => ({
    Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>
}));

vi.mock('@/components/template-navigation/NavigationButtons', () => ({
    NavigationButtons: () => <div data-testid="nav-buttons">Nav Buttons</div>
}));

vi.mock('@/components/template-navigation/NavigationProvider', () => ({
    useNavigation: () => ({
        card: {
            settings: {
                default_animation: 'fade-in',
                transition_speed: 300,
            },
        },
    }),
}));

vi.mock('@/hooks/useTemplateAnimation', () => ({
    useTemplateAnimation: () => ({
        ref: { current: null },
        isAnimating: false,
        trigger: vi.fn(),
    }),
}));

const mockPage: PageDefinition = {
    id: 'page-1',
    title: 'Test Page',
    sections: [
        { type: 'hero', heading: 'Hero Section' },
        { type: 'text', content: 'Text Section' }
    ]
};

describe('PageRenderer', () => {
    it('should render page title', () => {
        render(<PageRenderer page={mockPage} />);
        expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('should render breadcrumbs', () => {
        render(<PageRenderer page={mockPage} />);
        expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
        render(<PageRenderer page={mockPage} />);
        expect(screen.getByTestId('nav-buttons')).toBeInTheDocument();
    });

    it('should render all sections', () => {
        render(<PageRenderer page={mockPage} />);
        const sections = screen.getAllByTestId('section');
        expect(sections).toHaveLength(2);
        expect(screen.getByText('hero')).toBeInTheDocument();
        expect(screen.getByText('text')).toBeInTheDocument();
    });
});
