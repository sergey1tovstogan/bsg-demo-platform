import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationProvider, useNavigation } from './NavigationProvider';
import { CardDefinition } from '@/lib/template-types';

const mockCard: CardDefinition = {
  id: 'test-card',
  name: 'Test Card',
  category: 'test',
  color_theme: 'blue',
  icon: 'Box',
  agenda: { file: 'agenda.md' },
  navigation: {
    type: 'hierarchical',
    show_breadcrumbs: true,
    show_page_tree: true,
    allow_back_to_agenda: true
  },
  pages: [],
  settings: {
    default_animation: 'fade-in',
    transition_speed: '300ms',
    max_depth: 5
  }
};

function TestComponent() {
  const { currentPage, navigateToPage, backToAgenda, breadcrumbs } = useNavigation();
  return (
    <div>
      <div data-testid="current-page">{currentPage || 'agenda'}</div>
      <div data-testid="breadcrumbs">{breadcrumbs.length}</div>
      <button onClick={() => navigateToPage('page-1')}>Navigate</button>
      <button onClick={backToAgenda}>Back to Agenda</button>
    </div>
  );
}

describe('NavigationProvider', () => {
  it('should render children', () => {
    render(
      <NavigationProvider card={mockCard}>
        <div>Test Content</div>
      </NavigationProvider>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should provide navigation context', () => {
    render(
      <NavigationProvider card={mockCard}>
        <TestComponent />
      </NavigationProvider>
    );
    expect(screen.getByTestId('current-page')).toHaveTextContent('agenda');
  });

  it('should navigate to page', () => {
    render(
      <NavigationProvider card={mockCard}>
        <TestComponent />
      </NavigationProvider>
    );

    fireEvent.click(screen.getByText('Navigate'));
    expect(screen.getByTestId('current-page')).toHaveTextContent('page-1');
  });

  it('should return to agenda', () => {
    render(
      <NavigationProvider card={mockCard}>
        <TestComponent />
      </NavigationProvider>
    );

    fireEvent.click(screen.getByText('Navigate'));
    fireEvent.click(screen.getByText('Back to Agenda'));
    expect(screen.getByTestId('current-page')).toHaveTextContent('agenda');
  });

  it('should throw error when useNavigation used outside provider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNavigation must be used within NavigationProvider');

    spy.mockRestore();
  });
});
