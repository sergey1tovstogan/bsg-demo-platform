import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardRenderer } from '../CardRenderer';
import { vi } from 'vitest';

// We need to mock fetch to return our card and page data
const mockCardData = {
    id: 'card-1',
    name: 'E2E Test Card',
    agenda: { file: '/templates/agenda.md' },
    pages: [
        { file: '/templates/pages/01.md' },
        { file: '/templates/pages/02.md' }
    ],
    navigation: { type: 'hierarchical', show_breadcrumbs: true },
    color_theme: 'blue',
    icon: 'Box',
    settings: { default_animation: 'fade-in' }
};

const mockAgendaContent = `---
title: Welcome to E2E
items:
  - id: p1
    page_id: p1
    title: First Page
    file: /templates/pages/01.md
---
`;

const mockPageContent = `---
id: p1
titles:
  page_header: First Page header
  menu_title: First Page menu
  agenda_title: First Page agenda
  breadcrumb: First Page
description: Page description
sections:
  - type: hero
    heading: Hero Title
    subtitle: Hero Subtitle
---
# Welcome
This is the first page.
`;

// Global fetch mock
global.fetch = vi.fn((url) => {
    if (url === '/templates/agenda.md') {
        return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockAgendaContent)
        } as any);
    }
    if (url === '/templates/pages/01.md' || url === '/templates/pages/02.md') {
        return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockPageContent)
        } as any);
    }
    return Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not found')
    } as any);
});

// Mock scrollTo
window.scrollTo = vi.fn();

describe('EndToEndCard Integration', () => {
    it('should load agenda and navigate to page', async () => {
        render(<CardRenderer cardData={mockCardData as any} />);

        // 1. Verify Agenda is rendered
        await waitFor(() => {
            expect(screen.getByText('Welcome to E2E')).toBeInTheDocument();
        }, { timeout: 3000 });
        const firstPageBtn = screen.getByRole('button', { name: /First Page/i });
        expect(firstPageBtn).toBeInTheDocument();

        // 2. Click on First Page
        fireEvent.click(firstPageBtn);

        // 3. Verify Page is rendered
        await waitFor(() => {
            expect(screen.getByText('Page description')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Check for section content (rendered by PageRenderer -> SectionRenderer mock in real app context but here it's real)
        // Wait, in E2E test, SectionRenderer is REAL. 
        // hero section should render Hero Title.
        expect(screen.getByText('Hero Title')).toBeInTheDocument();

        // 4. Verify Breadcrumbs
        expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();

        // 5. Navigate back to Agenda
        const backBtn = screen.getByText('Back to Agenda');
        fireEvent.click(backBtn);

        // 6. Verify back to Agenda
        await waitFor(() => {
            expect(screen.getByText('Welcome to E2E')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
