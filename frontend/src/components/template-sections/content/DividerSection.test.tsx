import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DividerSection } from './DividerSection';
import { DividerSection as DividerSectionType } from '@/lib/template-types';

describe('DividerSection', () => {
  it('should render hr element', () => {
    const props: DividerSectionType = {
      type: 'divider'
    };
    const { container } = render(<DividerSection {...props} />);
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('should default to solid style', () => {
    const props: DividerSectionType = {
      type: 'divider'
    };
    const { container } = render(<DividerSection {...props} />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveClass('border-slate-300');
  });

  it('should apply dashed style', () => {
    const props: DividerSectionType = {
      type: 'divider',
      style: 'dashed'
    };
    const { container } = render(<DividerSection {...props} />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveClass('border-dashed');
  });

  it('should apply dotted style', () => {
    const props: DividerSectionType = {
      type: 'divider',
      style: 'dotted'
    };
    const { container } = render(<DividerSection {...props} />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveClass('border-dotted');
  });

  it('should apply thick style', () => {
    const props: DividerSectionType = {
      type: 'divider',
      style: 'thick'
    };
    const { container } = render(<DividerSection {...props} />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveClass('border-2');
  });
});
