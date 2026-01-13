import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressSection } from './ProgressSection';
import { ProgressSection as ProgressSectionType } from '@/lib/template-types';

describe('ProgressSection', () => {
  it('should render label and percentage', () => {
    const props: ProgressSectionType = {
      type: 'progress',
      label: 'Completion',
      value: 75,
      max: 100
    };
    render(<ProgressSection {...props} />);
    expect(screen.getByText('Completion')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should calculate percentage correctly', () => {
    const props: ProgressSectionType = {
      type: 'progress',
      label: 'Progress',
      value: 50,
      max: 200
    };
    render(<ProgressSection {...props} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('should default max to 100', () => {
    const props: ProgressSectionType = {
      type: 'progress',
      label: 'Progress',
      value: 60
    };
    render(<ProgressSection {...props} />);
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('should cap percentage at 100', () => {
    const props: ProgressSectionType = {
      type: 'progress',
      label: 'Progress',
      value: 150,
      max: 100
    };
    render(<ProgressSection {...props} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should floor percentage at 0', () => {
    const props: ProgressSectionType = {
      type: 'progress',
      label: 'Progress',
      value: -10,
      max: 100
    };
    render(<ProgressSection {...props} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should support different colors', () => {
    const blueProps: ProgressSectionType = {
      type: 'progress',
      label: 'Blue',
      value: 50,
      color: 'blue'
    };
    const { container: blueContainer } = render(<ProgressSection {...blueProps} />);
    expect(blueContainer.querySelector('.bg-blue-600')).toBeInTheDocument();

    const greenProps: ProgressSectionType = {
      type: 'progress',
      label: 'Green',
      value: 50,
      color: 'green'
    };
    const { container: greenContainer } = render(<ProgressSection {...greenProps} />);
    expect(greenContainer.querySelector('.bg-green-600')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    const props: ProgressSectionType = {
      type: 'progress',
      label: 'Loading',
      value: 30,
      max: 100
    };
    const { container } = render(<ProgressSection {...props} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('aria-valuenow', '30');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-label', 'Loading');
  });
});
