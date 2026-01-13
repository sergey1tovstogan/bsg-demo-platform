import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClickableCardsSection } from './ClickableCardsSection';
import { ClickableCardsSection as ClickableCardsSectionType } from '@/lib/template-types';

const mockNavigate = vi.fn();
const mockShowPopup = vi.fn();

vi.mock('@/components/template-navigation/NavigationProvider', () => ({
  useNavigation: vi.fn(() => ({
    navigateToPage: mockNavigate,
    showPopup: mockShowPopup,
  })),
}));

describe('ClickableCardsSection', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockShowPopup.mockClear();
  });

  it('should render all cards', () => {
    const props: ClickableCardsSectionType = {
      type: 'clickable_cards',
      cards: [
        {
          title: 'Card 1',
          description: 'First card',
          action: { type: 'navigate_to_subpage', target: 'page1' }
        },
        {
          title: 'Card 2',
          description: 'Second card',
          action: { type: 'navigate_to_subpage', target: 'page2' }
        }
      ]
    };
    render(<ClickableCardsSection {...props} />);
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('First card')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
  });

  it('should trigger action on card click', () => {
    const props: ClickableCardsSectionType = {
      type: 'clickable_cards',
      cards: [
        {
          title: 'Click Me',
          description: 'Description',
          action: { type: 'navigate_to_subpage', target: 'details' }
        }
      ]
    };
    render(<ClickableCardsSection {...props} />);
    const card = screen.getByText('Click Me').closest('button');
    fireEvent.click(card!);
    expect(mockNavigate).toHaveBeenCalledWith('details');
  });

  it('should support different column layouts', () => {
    const twoColProps: ClickableCardsSectionType = {
      type: 'clickable_cards',
      cards: [
        { title: 'Test', description: 'Test', action: { type: 'navigate_to_subpage', target: 'p' } }
      ],
      columns: 2
    };
    const { container: twoColContainer } = render(<ClickableCardsSection {...twoColProps} />);
    expect(twoColContainer.querySelector('.grid-cols-1.md\\:grid-cols-2')).toBeInTheDocument();

    const threeColProps: ClickableCardsSectionType = {
      type: 'clickable_cards',
      cards: [
        { title: 'Test', description: 'Test', action: { type: 'navigate_to_subpage', target: 'p' } }
      ],
      columns: 3
    };
    const { container: threeColContainer } = render(<ClickableCardsSection {...threeColProps} />);
    expect(threeColContainer.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
  });

  it('should default to 3 columns', () => {
    const props: ClickableCardsSectionType = {
      type: 'clickable_cards',
      cards: [
        { title: 'Test', description: 'Test', action: { type: 'navigate_to_subpage', target: 'p' } }
      ]
    };
    const { container } = render(<ClickableCardsSection {...props} />);
    expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
  });

  it('should support multiple cards with different actions', () => {
    const props: ClickableCardsSectionType = {
      type: 'clickable_cards',
      cards: [
        {
          title: 'Navigate',
          description: 'Navigate to page',
          action: { type: 'navigate_to_subpage', target: 'page1' }
        },
        {
          title: 'Popup',
          description: 'Open popup',
          action: { type: 'show_popup', popup_id: 'modal1' }
        }
      ]
    };
    render(<ClickableCardsSection {...props} />);

    const navCard = screen.getByText('Navigate').closest('button');
    fireEvent.click(navCard!);
    expect(mockNavigate).toHaveBeenCalledWith('page1');

    const popupCard = screen.getByText('Popup').closest('button');
    fireEvent.click(popupCard!);
    expect(mockShowPopup).toHaveBeenCalledWith('modal1');
  });
});
