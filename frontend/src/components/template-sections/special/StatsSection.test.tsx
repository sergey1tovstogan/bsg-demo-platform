import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsSection } from './StatsSection';
import { StatsSection as StatsSectionType } from '@/lib/template-types';

describe('StatsSection', () => {
  it('should render all stats', () => {
    const props: StatsSectionType = {
      type: 'stats',
      stats: [
        { value: '100+', label: 'Customers' },
        { value: '5M', label: 'Downloads' },
        { value: '99.9%', label: 'Uptime' }
      ]
    };
    render(<StatsSection {...props} />);
    expect(screen.getByText('100+')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('5M')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
  });

  it('should render optional descriptions', () => {
    const props: StatsSectionType = {
      type: 'stats',
      stats: [
        { value: '50', label: 'Projects', description: 'Completed successfully' }
      ]
    };
    render(<StatsSection {...props} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Completed successfully')).toBeInTheDocument();
  });

  it('should work without descriptions', () => {
    const props: StatsSectionType = {
      type: 'stats',
      stats: [
        { value: '42', label: 'Answer' }
      ]
    };
    render(<StatsSection {...props} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Answer')).toBeInTheDocument();
  });

  it('should support different column layouts', () => {
    const twoColProps: StatsSectionType = {
      type: 'stats',
      stats: [{ value: '1', label: 'Stat' }],
      columns: 2
    };
    const { container: twoColContainer } = render(<StatsSection {...twoColProps} />);
    expect(twoColContainer.querySelector('.grid-cols-1.md\\:grid-cols-2')).toBeInTheDocument();

    const threeColProps: StatsSectionType = {
      type: 'stats',
      stats: [{ value: '1', label: 'Stat' }],
      columns: 3
    };
    const { container: threeColContainer } = render(<StatsSection {...threeColProps} />);
    expect(threeColContainer.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();

    const fourColProps: StatsSectionType = {
      type: 'stats',
      stats: [{ value: '1', label: 'Stat' }],
      columns: 4
    };
    const { container: fourColContainer } = render(<StatsSection {...fourColProps} />);
    expect(fourColContainer.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument();
  });

  it('should default to 3 columns', () => {
    const props: StatsSectionType = {
      type: 'stats',
      stats: [{ value: '1', label: 'Stat' }]
    };
    const { container } = render(<StatsSection {...props} />);
    expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
  });

  it('should style stat values prominently', () => {
    const props: StatsSectionType = {
      type: 'stats',
      stats: [{ value: '100', label: 'Test' }]
    };
    const { container } = render(<StatsSection {...props} />);
    const valueElement = screen.getByText('100');
    expect(valueElement).toHaveClass('text-4xl', 'font-bold', 'text-blue-600');
  });
});
