import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepsSection } from './StepsSection';
import { StepsSection as StepsSectionType } from '@/lib/template-types';

describe('StepsSection', () => {
  it('should render all steps', () => {
    const props: StepsSectionType = {
      type: 'steps',
      steps: [
        { description: 'First step' },
        { description: 'Second step' },
        { description: 'Third step' }
      ]
    };
    render(<StepsSection {...props} />);
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();
    expect(screen.getByText('Third step')).toBeInTheDocument();
  });

  it('should render step numbers', () => {
    const props: StepsSectionType = {
      type: 'steps',
      steps: [
        { description: 'Step' },
        { description: 'Step' }
      ]
    };
    const { container } = render(<StepsSection {...props} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render optional step titles', () => {
    const props: StepsSectionType = {
      type: 'steps',
      steps: [
        { title: 'Setup', description: 'Install dependencies' },
        { title: 'Configure', description: 'Set up config' }
      ]
    };
    render(<StepsSection {...props} />);
    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeInTheDocument();
  });

  it('should work without titles', () => {
    const props: StepsSectionType = {
      type: 'steps',
      steps: [
        { description: 'Just description' }
      ]
    };
    const { container } = render(<StepsSection {...props} />);
    expect(screen.getByText('Just description')).toBeInTheDocument();
    const h3 = container.querySelector('h3');
    expect(h3).toBeNull();
  });

  it('should apply proper styling to step numbers', () => {
    const props: StepsSectionType = {
      type: 'steps',
      steps: [{ description: 'Test' }]
    };
    const { container } = render(<StepsSection {...props} />);
    const stepNumber = screen.getByText('1');
    expect(stepNumber).toHaveClass('bg-blue-600', 'rounded-full');
  });
});
