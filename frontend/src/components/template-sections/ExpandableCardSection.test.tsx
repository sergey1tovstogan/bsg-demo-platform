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

