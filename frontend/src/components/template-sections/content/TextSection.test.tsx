import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextSection } from './TextSection';
import { TextSection as TextSectionType } from '@/lib/template-types';

describe('TextSection', () => {
  it('should render plain text content', () => {
    const props: TextSectionType = {
      type: 'text',
      content: 'Plain text content'
    };
    render(<TextSection {...props} />);
    expect(screen.getByText('Plain text content')).toBeInTheDocument();
  });

  it('should render markdown bold text', () => {
    const props: TextSectionType = {
      type: 'text',
      content: '**Bold text**'
    };
    render(<TextSection {...props} />);
    const boldElement = screen.getByText('Bold text');
    expect(boldElement.tagName).toBe('STRONG');
  });

  it('should render markdown italic text', () => {
    const props: TextSectionType = {
      type: 'text',
      content: '*Italic text*'
    };
    render(<TextSection {...props} />);
    const italicElement = screen.getByText('Italic text');
    expect(italicElement.tagName).toBe('EM');
  });

  it('should render markdown headings', () => {
    const props: TextSectionType = {
      type: 'text',
      content: '## Heading 2'
    };
    render(<TextSection {...props} />);
    const heading = screen.getByText('Heading 2');
    expect(heading.tagName).toBe('H2');
  });

  it('should render markdown links', () => {
    const props: TextSectionType = {
      type: 'text',
      content: '[Link text](https://example.com)'
    };
    render(<TextSection {...props} />);
    const link = screen.getByText('Link text');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('should apply correct typography classes', () => {
    const props: TextSectionType = {
      type: 'text',
      content: 'Test content'
    };
    const { container } = render(<TextSection {...props} />);
    const textDiv = container.firstChild;
    expect(textDiv).toHaveClass('prose', 'dark:prose-invert');
  });

  it('should sanitize HTML for security', () => {
    const props: TextSectionType = {
      type: 'text',
      content: 'Safe content <script>alert("xss")</script>'
    };
    const { container } = render(<TextSection {...props} />);
    // Script tags should be removed (not executed)
    expect(container.innerHTML).not.toContain('<script>');
    expect(container.innerHTML).not.toContain('</script>');
    // Safe content should still be present
    expect(screen.getByText(/Safe content/)).toBeInTheDocument();
  });
});
