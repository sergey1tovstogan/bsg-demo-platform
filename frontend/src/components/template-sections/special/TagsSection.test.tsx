import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagsSection } from './TagsSection';
import { TagsSection as TagsSectionType } from '@/lib/template-types';

describe('TagsSection', () => {
  it('should render all tags', () => {
    const props: TagsSectionType = {
      type: 'tags',
      tags: ['JavaScript', 'TypeScript', 'React', 'Node.js']
    };
    render(<TagsSection {...props} />);
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('should support different styles', () => {
    const defaultProps: TagsSectionType = {
      type: 'tags',
      tags: ['Tag'],
      style: 'default'
    };
    const { container: defaultContainer } = render(<TagsSection {...defaultProps} />);
    expect(defaultContainer.querySelector('.bg-slate-100')).not.toBeNull();

    const primaryProps: TagsSectionType = {
      type: 'tags',
      tags: ['Tag'],
      style: 'primary'
    };
    const { container: primaryContainer } = render(<TagsSection {...primaryProps} />);
    expect(primaryContainer.querySelector('.bg-blue-100')).not.toBeNull();

    const successProps: TagsSectionType = {
      type: 'tags',
      tags: ['Tag'],
      style: 'success'
    };
    const { container: successContainer } = render(<TagsSection {...successProps} />);
    expect(successContainer.querySelector('.bg-green-100')).not.toBeNull();

    const outlineProps: TagsSectionType = {
      type: 'tags',
      tags: ['Tag'],
      style: 'outline'
    };
    const { container: outlineContainer } = render(<TagsSection {...outlineProps} />);
    expect(outlineContainer.querySelector('.bg-transparent')).not.toBeNull();
  });

  it('should default to default style', () => {
    const props: TagsSectionType = {
      type: 'tags',
      tags: ['Tag']
    };
    const { container } = render(<TagsSection {...props} />);
    expect(container.querySelector('.bg-slate-100')).not.toBeNull();
  });

  it('should use proper ARIA roles', () => {
    const props: TagsSectionType = {
      type: 'tags',
      tags: ['Tag1', 'Tag2']
    };
    const { container } = render(<TagsSection {...props} />);
    const list = container.querySelector('[role="list"]');
    const listItems = container.querySelectorAll('[role="listitem"]');
    expect(list).not.toBeNull();
    expect(listItems).toHaveLength(2);
  });

  it('should handle empty tags array', () => {
    const props: TagsSectionType = {
      type: 'tags',
      tags: []
    };
    const { container } = render(<TagsSection {...props} />);
    const listItems = container.querySelectorAll('[role="listitem"]');
    expect(listItems).toHaveLength(0);
  });
});
