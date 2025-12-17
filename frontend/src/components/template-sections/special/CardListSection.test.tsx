import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardListSection } from './CardListSection';
import { CardListSection as CardListSectionType } from '@/lib/template-types';

describe('CardListSection', () => {
  it('should render all cards', () => {
    const props: CardListSectionType = {
      type: 'card_list',
      cards: [
        { content: 'Card 1 content' },
        { content: 'Card 2 content' },
        { content: 'Card 3 content' }
      ]
    };
    render(<CardListSection {...props} />);
    expect(screen.getByText('Card 1 content')).toBeInTheDocument();
    expect(screen.getByText('Card 2 content')).toBeInTheDocument();
    expect(screen.getByText('Card 3 content')).toBeInTheDocument();
  });

  it('should render optional card titles', () => {
    const props: CardListSectionType = {
      type: 'card_list',
      cards: [
        { title: 'Card Title', content: 'Card content' }
      ]
    };
    render(<CardListSection {...props} />);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should work without titles', () => {
    const props: CardListSectionType = {
      type: 'card_list',
      cards: [
        { content: 'Just content, no title' }
      ]
    };
    const { container } = render(<CardListSection {...props} />);
    expect(screen.getByText('Just content, no title')).toBeInTheDocument();
    expect(container.querySelector('h3')).toBeNull();
  });

  it('should handle single card', () => {
    const props: CardListSectionType = {
      type: 'card_list',
      cards: [
        { title: 'Only Card', content: 'Only content' }
      ]
    };
    const { container } = render(<CardListSection {...props} />);
    const cards = container.querySelectorAll('.rounded-xl');
    expect(cards.length).toBe(1);
  });

  it('should handle many cards', () => {
    const props: CardListSectionType = {
      type: 'card_list',
      cards: [
        { content: 'Card 1' },
        { content: 'Card 2' },
        { content: 'Card 3' },
        { content: 'Card 4' },
        { content: 'Card 5' }
      ]
    };
    const { container } = render(<CardListSection {...props} />);
    const cards = container.querySelectorAll('.rounded-xl');
    expect(cards.length).toBe(5);
  });
});
