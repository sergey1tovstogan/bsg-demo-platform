import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListSection } from './ListSection';
import { ListSection as ListSectionType } from '@/lib/template-types';

describe('ListSection', () => {
  it('should render bullet list', () => {
    const props: ListSectionType = {
      type: 'list',
      list_type: 'bullet',
      items: ['Item 1', 'Item 2', 'Item 3']
    };
    const { container } = render(<ListSection {...props} />);
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should render numbered list', () => {
    const props: ListSectionType = {
      type: 'list',
      list_type: 'numbered',
      items: ['First', 'Second', 'Third']
    };
    const { container } = render(<ListSection {...props} />);
    expect(container.querySelector('ol')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  it('should render checklist with check icons', () => {
    const props: ListSectionType = {
      type: 'list',
      list_type: 'checklist',
      items: ['Done', 'Complete']
    };
    const { container } = render(<ListSection {...props} />);
    expect(screen.getByText('Done')).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should default to bullet list', () => {
    const props: ListSectionType = {
      type: 'list',
      items: ['Item']
    };
    const { container } = render(<ListSection {...props} />);
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('should render all items', () => {
    const props: ListSectionType = {
      type: 'list',
      items: ['A', 'B', 'C', 'D', 'E']
    };
    render(<ListSection {...props} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
  });
});
