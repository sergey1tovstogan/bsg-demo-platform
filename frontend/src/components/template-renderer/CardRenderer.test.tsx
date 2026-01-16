import React from 'react';
import { render, screen } from '@testing-library/react';
import { CardRenderer } from './CardRenderer';
import { CardDefinition } from '@/lib/template-types';
import { vi } from 'vitest';
import * as NavigationProvider from '@/components/template-navigation/NavigationProvider';

// Mock dependencies
vi.mock('@/components/template-navigation/NavigationProvider', () => ({
    NavigationProvider: ({ children }: any) => <div data-testid="nav-provider">{children}</div>,
    useNavigation: vi.fn()
}));

vi.mock('./AgendaRenderer', () => ({
    AgendaRenderer: () => <div data-testid="agenda">Agenda</div>
}));

vi.mock('./PageRenderer', () => ({
    PageRenderer: ({ page }: any) => <div data-testid="page">{page.title}</div>
}));

vi.mock('./PopupRenderer', () => ({
    PopupRenderer: () => <div data-testid="popup">Popup</div>
}));

const mockCard: CardDefinition = {
    id: 'card-1',
    name: 'Test Card',
    agenda: { file: 'agenda.md' },
    pages: [],
    navigation: { type: 'hierarchical' },
    color_theme: 'blue',
    icon: 'Box',
    settings: {
        default_animation: 'fade-in',
        transition_speed: 300,
        max_depth: 3
    }
};

describe('CardRenderer', () => {
    it('should render NavigationProvider', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            currentPage: null,
            card: mockCard,
            agendaData: { title: 'Agenda', items: [] },
            getPage: vi.fn(),
            // add minimal other props to avoid type errors if strict
            hierarchy: {},
            breadcrumbs: [],
            popupStack: [],
            navigateToPage: vi.fn(),
            navigateBack: vi.fn(),
            backToAgenda: vi.fn(),
            showPopup: vi.fn(),
            closePopup: vi.fn()
        });

        render(<CardRenderer cardData={mockCard} />);
        expect(screen.getByTestId('nav-provider')).toBeInTheDocument();
    });

    it('should render Agenda by default', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            currentPage: null,
            card: mockCard,
            agendaData: { title: 'Agenda', items: [] },
            getPage: vi.fn(),
            hierarchy: {}, breadcrumbs: [], popupStack: [], navigateToPage: vi.fn(), navigateBack: vi.fn(), backToAgenda: vi.fn(), showPopup: vi.fn(), closePopup: vi.fn()
        });

        render(<CardRenderer cardData={mockCard} />);
        expect(screen.getByTestId('agenda')).toBeInTheDocument();
        expect(screen.queryByTestId('page')).not.toBeInTheDocument();
    });

    it('should render Page when currentPage is set', () => {
        const mockGetPage = vi.fn().mockReturnValue({ id: 'p1', title: 'Page 1', sections: [] });
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            currentPage: 'p1',
            card: mockCard,
            agendaData: { title: 'Agenda', items: [] },
            getPage: mockGetPage,
            hierarchy: {}, breadcrumbs: [], popupStack: [], navigateToPage: vi.fn(), navigateBack: vi.fn(), backToAgenda: vi.fn(), showPopup: vi.fn(), closePopup: vi.fn()
        });

        render(<CardRenderer cardData={mockCard} />);
        expect(screen.getByTestId('page')).toBeInTheDocument();
        expect(screen.getByText('Page 1')).toBeInTheDocument();
        expect(screen.queryByTestId('agenda')).not.toBeInTheDocument();
    });

    it('should render PopupRenderer', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            currentPage: null,
            card: mockCard,
            agendaData: { title: 'Agenda', items: [] },
            getPage: vi.fn(),
            hierarchy: {}, breadcrumbs: [], popupStack: [], navigateToPage: vi.fn(), navigateBack: vi.fn(), backToAgenda: vi.fn(), showPopup: vi.fn(), closePopup: vi.fn()
        });

        render(<CardRenderer cardData={mockCard} />);
        expect(screen.getByTestId('popup')).toBeInTheDocument();
    });
});
