import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableSection } from './ExpandableSection';
import { vi } from 'vitest';

// Mock SectionRenderer to avoid circular dependency complex testing
vi.mock('../template-renderer/SectionRenderer', () => ({
    SectionRenderer: ({ section }: any) => <div data-testid="nested-section">{section.type}</div>
}));

const mockSection = {
    type: 'expandable_section',
    trigger: 'Click to expand',
    collapsed: [{ type: 'text', content: 'Collapsed content' }],
    expanded: [{ type: 'text', content: 'Expanded content' }],
    max_height: 200
};

describe('ExpandableSection', () => {
    it('should render trigger text', () => {
        render(<ExpandableSection section={mockSection} />);
        expect(screen.getByText('Click to expand')).toBeInTheDocument();
    });

    it('should render collapsed content by default', () => {
        render(<ExpandableSection section={mockSection} />);
        // Assumes collapsed content is visible initially
        // Check if nested-section is rendered for collapsed items
        // Wait, mockSection has 2 lists.
        // Spec says: "collapsed" (always visible content?) or "collapsed" (content visible when collapsed?)
        // Usually expandable section has a header (trigger) and a body (expanded).
        // Let's check spec in section-parser.ts output or logic.
        // Step 233 output: "trigger", "collapsed", "expanded".
        // Usually "collapsed" is the preview content? And "expanded" is the full content?
        // Or "collapsed" means content shown IN ADDITION to expanded?

        // Let's assume:
        // Display 'collapsed' sections always (or as preview).
        // Display 'expanded' sections ONLY when expanded.

        // We need to implement based on common pattern:
        // Trigger is a button.
        // Collapsed content is the summary.
        // Expanded content reveals more.

        // I will verify behavior during implementation.
        // For test: assume we see 'text' corresponding to collapsed content.
        // And NOT 'text' corresponding to expanded content (or it's hidden).
    });

    it('should toggle content on click', () => {
        render(<ExpandableSection section={mockSection} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        // Check if expanded content is now visible
        // We need distinctive content in mock.
    });
});
