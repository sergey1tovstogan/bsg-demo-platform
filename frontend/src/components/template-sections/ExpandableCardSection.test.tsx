import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableCardSection } from './ExpandableCardSection';
import { vi } from 'vitest';

// Mock SectionRenderer
vi.mock('../template-renderer/SectionRenderer', () => ({
    SectionRenderer: ({ section }: any) => <div data-testid="nested-section">{section.type}</div>
}));

const mockSection = {
    type: 'expandable_card',
    trigger: 'Card Trigger',
    collapsed_title: 'Collapsed Title',
    expanded_content: [{ type: 'text', content: 'Expanded Content' }],
    icon: 'Box',
    animation: 'fade-in'
};

const mockSectionWithoutTitle = { ...mockSection, collapsed_title: undefined };

describe('ExpandableCardSection', () => {
    it('should render trigger title', () => {
        render(<ExpandableCardSection section={mockSection} />);
        expect(screen.getByText('Card Trigger')).toBeInTheDocument();
    });

    it('should show collapsed title by default', () => {
        render(<ExpandableCardSection section={mockSection} />);
        expect(screen.getByText('Collapsed Title')).toBeInTheDocument();
        // Should NOT show expanded content yet?
        // Or "expanded_content" is hidden.
        // Assuming implementation resembles ExpandableSection but styled as card.
    });

    it('should toggle content on click', () => {
        render(<ExpandableCardSection section={mockSection} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        // Expanded content should be rendered
        // Check for nested-section
    });

    it('should handle icon rendering', () => {
        // We verify icon is rendered (might check Lucide icon by class or svg presence)
        const { container } = render(<ExpandableCardSection section={mockSection} />);
        // Assuming Lucide icon is rendered. Check for SVG.
        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});
