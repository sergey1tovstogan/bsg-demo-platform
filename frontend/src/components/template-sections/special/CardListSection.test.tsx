import { render, screen } from '@testing-library/react';
import { CardListSection } from './CardListSection';
import { CardListSection as CardListSectionType } from '@/lib/template-types';
import { describe, it, expect } from 'vitest';

describe('CardListSection', () => {
  it('renders correctly with legacy cards prop', () => {
    const legacyData: CardListSectionType = {
      type: 'card_list',
      cards: [
        { title: 'Card 1', content: 'Content 1' }
      ]
    };

    render(<CardListSection {...legacyData} />);
    expect(screen.getByText('Card 1')).toBeDefined();
    expect(screen.getByText('Content 1')).toBeDefined();
  });

  it('renders correctly with new items prop (from YAML)', () => {
    const yamlData: any = {
      type: 'card_list',
      items: [
        { title: 'Item 1', description: 'Description 1' }
      ]
    };

    // This is expected to crash currently
    render(<CardListSection {...yamlData} />);
    expect(screen.getByText('Item 1')).toBeDefined();
    // Note: The component currently expects 'content', but the YAML uses 'description'.
    // We should probably support both or normalize it.
    expect(screen.getByText('Description 1')).toBeDefined();
  });
});
