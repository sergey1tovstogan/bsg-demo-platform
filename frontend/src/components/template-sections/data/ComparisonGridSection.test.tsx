import { render, screen } from '@testing-library/react';
import { ComparisonGridSection } from './ComparisonGridSection';
import { ComparisonGridSection as ComparisonGridSectionType } from '@/lib/template-types';
import { describe, it, expect } from 'vitest';

describe('ComparisonGridSection', () => {
  it('renders correctly with legacy linear structure', () => {
    const legacyData: ComparisonGridSectionType = {
      type: 'comparison_grid',
      items: [
        {
          title: 'Option A',
          features: [
            { label: 'Feature 1', included: true },
            { label: 'Feature 2', included: false }
          ]
        }
      ]
    };

    render(<ComparisonGridSection {...legacyData} />);
    expect(screen.getByText('Option A')).toBeDefined();
    expect(screen.getByText('Feature 1')).toBeDefined();
  });

  it('renders correctly with new table structure', () => {
    const tableData: any = {
      type: 'comparison_grid',
      columns: [
        { title: 'Monitoring', color: 'red' },
        { title: 'Observability', color: 'blue' }
      ],
      items: [
        {
          label: 'Core Question',
          values: ['Is it healthy?', 'Why is it broken?']
        }
      ]
    };

    // This is expected to crash currently
    render(<ComparisonGridSection {...tableData} />);
    expect(screen.getByText('Monitoring')).toBeDefined();
    expect(screen.getByText('Observability')).toBeDefined();
    expect(screen.getByText('Is it healthy?')).toBeDefined();
  });
});
