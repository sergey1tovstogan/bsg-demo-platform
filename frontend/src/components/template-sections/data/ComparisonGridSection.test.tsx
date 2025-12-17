import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparisonGridSection } from './ComparisonGridSection';
import { ComparisonGridSection as ComparisonGridSectionType } from '@/lib/template-types';

describe('ComparisonGridSection', () => {
  it('should render all comparison items', () => {
    const props: ComparisonGridSectionType = {
      type: 'comparison_grid',
      items: [
        {
          title: 'Basic Plan',
          features: [
            { label: 'Feature 1', included: true },
            { label: 'Feature 2', included: false }
          ]
        },
        {
          title: 'Pro Plan',
          features: [
            { label: 'Feature 1', included: true },
            { label: 'Feature 2', included: true }
          ]
        }
      ]
    };
    render(<ComparisonGridSection {...props} />);
    expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    expect(screen.getByText('Pro Plan')).toBeInTheDocument();
  });

  it('should render all features for each item', () => {
    const props: ComparisonGridSectionType = {
      type: 'comparison_grid',
      items: [
        {
          title: 'Plan',
          features: [
            { label: 'Feature A', included: true },
            { label: 'Feature B', included: true },
            { label: 'Feature C', included: false }
          ]
        }
      ]
    };
    render(<ComparisonGridSection {...props} />);
    expect(screen.getByText('Feature A')).toBeInTheDocument();
    expect(screen.getByText('Feature B')).toBeInTheDocument();
    expect(screen.getByText('Feature C')).toBeInTheDocument();
  });

  it('should show check icons for included features', () => {
    const props: ComparisonGridSectionType = {
      type: 'comparison_grid',
      items: [
        {
          title: 'Plan',
          features: [
            { label: 'Included', included: true }
          ]
        }
      ]
    };
    const { container } = render(<ComparisonGridSection {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Check icon has class text-green-600
    expect(svg).toHaveClass('text-green-600');
  });

  it('should show X icons for excluded features', () => {
    const props: ComparisonGridSectionType = {
      type: 'comparison_grid',
      items: [
        {
          title: 'Plan',
          features: [
            { label: 'Excluded', included: false }
          ]
        }
      ]
    };
    const { container } = render(<ComparisonGridSection {...props} />);
    const icons = container.querySelectorAll('svg');
    // X icon has class text-red-600
    const xIcon = Array.from(icons).find(icon =>
      icon.classList.contains('text-red-600')
    );
    expect(xIcon).toBeTruthy();
  });

  it('should handle multiple items', () => {
    const props: ComparisonGridSectionType = {
      type: 'comparison_grid',
      items: [
        { title: 'Item 1', features: [{ label: 'F1', included: true }] },
        { title: 'Item 2', features: [{ label: 'F2', included: true }] },
        { title: 'Item 3', features: [{ label: 'F3', included: true }] }
      ]
    };
    const { container } = render(<ComparisonGridSection {...props} />);
    const items = container.querySelectorAll('.rounded-xl');
    expect(items.length).toBe(3);
  });
});
