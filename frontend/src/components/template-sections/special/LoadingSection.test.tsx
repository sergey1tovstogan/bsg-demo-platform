import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSection } from './LoadingSection';
import { LoadingSection as LoadingSectionType } from '@/lib/template-types';

describe('LoadingSection', () => {
  it('should render spinner style by default', () => {
    const props: LoadingSectionType = {
      type: 'loading'
    };
    const { container } = render(<LoadingSection {...props} />);
    // Check for spinner element
    const spinner = container.querySelector('[data-testid="loading-spinner"]');
    expect(spinner).not.toBeNull();
  });

  it('should render skeleton style', () => {
    const props: LoadingSectionType = {
      type: 'loading',
      style: 'skeleton'
    };
    const { container } = render(<LoadingSection {...props} />);
    const skeleton = container.querySelector('[data-testid="loading-skeleton"]');
    expect(skeleton).not.toBeNull();
  });

  it('should render pulse style', () => {
    const props: LoadingSectionType = {
      type: 'loading',
      style: 'pulse'
    };
    const { container } = render(<LoadingSection {...props} />);
    const pulse = container.querySelector('[data-testid="loading-pulse"]');
    expect(pulse).not.toBeNull();
  });

  it('should display custom message', () => {
    const props: LoadingSectionType = {
      type: 'loading',
      message: 'Loading content...'
    };
    render(<LoadingSection {...props} />);
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  it('should support different sizes', () => {
    const smallProps: LoadingSectionType = {
      type: 'loading',
      size: 'sm'
    };
    const { container: smallContainer } = render(<LoadingSection {...smallProps} />);
    const smallSpinner = smallContainer.querySelector('[data-size="sm"]');
    expect(smallSpinner).not.toBeNull();

    const largeProps: LoadingSectionType = {
      type: 'loading',
      size: 'lg'
    };
    const { container: largeContainer } = render(<LoadingSection {...largeProps} />);
    const largeSpinner = largeContainer.querySelector('[data-size="lg"]');
    expect(largeSpinner).not.toBeNull();
  });

  it('should have proper ARIA attributes', () => {
    const props: LoadingSectionType = {
      type: 'loading',
      message: 'Please wait...'
    };
    const { container } = render(<LoadingSection {...props} />);
    const loading = container.querySelector('[role="status"]');
    expect(loading).not.toBeNull();
    expect(loading).toHaveAttribute('aria-live', 'polite');
  });

  it('should default to medium size', () => {
    const props: LoadingSectionType = {
      type: 'loading'
    };
    const { container } = render(<LoadingSection {...props} />);
    const mediumSpinner = container.querySelector('[data-size="md"]');
    expect(mediumSpinner).not.toBeNull();
  });
});
