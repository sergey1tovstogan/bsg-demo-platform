import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertSection } from './AlertSection';
import { AlertSection as AlertSectionType } from '@/lib/template-types';

describe('AlertSection', () => {
  it('should render alert content', () => {
    const props: AlertSectionType = {
      type: 'alert',
      alert_type: 'info',
      content: 'This is an information alert'
    };
    render(<AlertSection {...props} />);
    expect(screen.getByText('This is an information alert')).toBeInTheDocument();
  });

  it('should render info alert with correct styling', () => {
    const props: AlertSectionType = {
      type: 'alert',
      alert_type: 'info',
      content: 'Info message'
    };
    const { container } = render(<AlertSection {...props} />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass('bg-blue-50', 'dark:bg-blue-950');
  });

  it('should render success alert with correct styling', () => {
    const props: AlertSectionType = {
      type: 'alert',
      alert_type: 'success',
      content: 'Success message'
    };
    const { container } = render(<AlertSection {...props} />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass('bg-green-50', 'dark:bg-green-950');
  });

  it('should render warning alert with correct styling', () => {
    const props: AlertSectionType = {
      type: 'alert',
      alert_type: 'warning',
      content: 'Warning message'
    };
    const { container } = render(<AlertSection {...props} />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass('bg-yellow-50', 'dark:bg-yellow-950');
  });

  it('should render error alert with correct styling', () => {
    const props: AlertSectionType = {
      type: 'alert',
      alert_type: 'error',
      content: 'Error message'
    };
    const { container } = render(<AlertSection {...props} />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass('bg-red-50', 'dark:bg-red-950');
  });

  it('should have proper ARIA role', () => {
    const props: AlertSectionType = {
      type: 'alert',
      alert_type: 'info',
      content: 'Info message'
    };
    const { container } = render(<AlertSection {...props} />);
    expect(container.firstChild).toHaveAttribute('role', 'alert');
  });

  it('should render optional title', () => {
    const props: AlertSectionType = {
      type: 'alert',
      alert_type: 'info',
      title: 'Important Information',
      content: 'Details here'
    };
    render(<AlertSection {...props} />);
    expect(screen.getByText('Important Information')).toBeInTheDocument();
  });

  it('should not render title when not provided', () => {
    const props: AlertSectionType = {
      type: 'alert',
      alert_type: 'info',
      content: 'Info message'
    };
    const { container } = render(<AlertSection {...props} />);
    const heading = container.querySelector('h3');
    expect(heading).toBeNull();
  });

  it('should apply rounded corners and padding', () => {
    const props: AlertSectionType = {
      type: 'alert',
      alert_type: 'info',
      content: 'Test'
    };
    const { container } = render(<AlertSection {...props} />);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass('rounded-xl', 'p-4');
  });
});
