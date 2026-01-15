import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuoteSection } from './QuoteSection';
import { QuoteSection as QuoteSectionType } from '@/lib/template-types';

describe('QuoteSection', () => {
  it('should render quote text', () => {
    const props: QuoteSectionType = {
      type: 'quote',
      text: 'This is a quote'
    };
    render(<QuoteSection {...props} />);
    expect(screen.getByText('This is a quote')).toBeInTheDocument();
  });

  it('should render blockquote element', () => {
    const props: QuoteSectionType = {
      type: 'quote',
      text: 'Quote text'
    };
    const { container } = render(<QuoteSection {...props} />);
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
  });

  it('should render optional citation', () => {
    const props: QuoteSectionType = {
      type: 'quote',
      text: 'Quote',
      citation: 'Author Name'
    };
    render(<QuoteSection {...props} />);
    expect(screen.getByText(/Author Name/)).toBeInTheDocument();
  });

  it('should not render citation when not provided', () => {
    const props: QuoteSectionType = {
      type: 'quote',
      text: 'Quote'
    };
    const { container } = render(<QuoteSection {...props} />);
    const cite = container.querySelector('cite');
    expect(cite).toBeNull();
  });

  it('should apply border styling', () => {
    const props: QuoteSectionType = {
      type: 'quote',
      text: 'Quote'
    };
    const { container } = render(<QuoteSection {...props} />);
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toHaveClass('border-l-4');
  });

  it('should have proper text styling', () => {
    const props: QuoteSectionType = {
      type: 'quote',
      text: 'Quote'
    };
    const { container } = render(<QuoteSection {...props} />);
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toHaveClass('italic');
  });
});
