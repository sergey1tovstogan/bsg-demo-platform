import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccordionSection } from './AccordionSection';
import { AccordionSection as AccordionSectionType } from '@/lib/template-types';

describe('AccordionSection', () => {
  it('should render all accordion item titles', () => {
    const props: AccordionSectionType = {
      type: 'accordion',
      items: [
        { title: 'Item 1', content: 'Content 1' },
        { title: 'Item 2', content: 'Content 2' },
        { title: 'Item 3', content: 'Content 3' }
      ]
    };
    render(<AccordionSection {...props} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should hide all content by default', () => {
    const props: AccordionSectionType = {
      type: 'accordion',
      items: [
        { title: 'Item 1', content: 'Hidden content 1' },
        { title: 'Item 2', content: 'Hidden content 2' }
      ]
    };
    render(<AccordionSection {...props} />);
    expect(screen.queryByText('Hidden content 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden content 2')).not.toBeInTheDocument();
  });

  it('should show content when item is clicked', () => {
    const props: AccordionSectionType = {
      type: 'accordion',
      items: [
        { title: 'Click me', content: 'Revealed content' }
      ]
    };
    render(<AccordionSection {...props} />);

    expect(screen.queryByText('Revealed content')).not.toBeInTheDocument();

    const button = screen.getByText('Click me');
    fireEvent.click(button);

    expect(screen.getByText('Revealed content')).toBeInTheDocument();
  });

  it('should hide content when clicked again (single mode)', () => {
    const props: AccordionSectionType = {
      type: 'accordion',
      items: [
        { title: 'Toggle', content: 'Toggle content' }
      ]
    };
    render(<AccordionSection {...props} />);

    const button = screen.getByText('Toggle');

    fireEvent.click(button);
    expect(screen.getByText('Toggle content')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText('Toggle content')).not.toBeInTheDocument();
  });

  it('should close other items in single mode', () => {
    const props: AccordionSectionType = {
      type: 'accordion',
      items: [
        { title: 'Item 1', content: 'Content 1' },
        { title: 'Item 2', content: 'Content 2' }
      ],
      allow_multiple: false
    };
    render(<AccordionSection {...props} />);

    const button1 = screen.getByText('Item 1');
    const button2 = screen.getByText('Item 2');

    fireEvent.click(button1);
    expect(screen.getByText('Content 1')).toBeInTheDocument();

    fireEvent.click(button2);
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should allow multiple items open when allow_multiple is true', () => {
    const props: AccordionSectionType = {
      type: 'accordion',
      items: [
        { title: 'Item 1', content: 'Content 1' },
        { title: 'Item 2', content: 'Content 2' }
      ],
      allow_multiple: true
    };
    render(<AccordionSection {...props} />);

    const button1 = screen.getByText('Item 1');
    const button2 = screen.getByText('Item 2');

    fireEvent.click(button1);
    fireEvent.click(button2);

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });
});
