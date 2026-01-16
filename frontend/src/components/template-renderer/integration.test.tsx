import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionRenderer } from './SectionRenderer';
import { Section } from '@/lib/template-types';

describe('Section Rendering Integration', () => {
  it('should render HeroSection for hero type', () => {
    const section: Section = {
      type: 'hero',
      heading: 'Test Hero'
    };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
    const heading = screen.getByText('Test Hero');
    expect(heading.tagName).toBe('H1');
  });

  it('should render TextSection for text type with markdown', () => {
    const section: Section = {
      type: 'text',
      content: '**Bold** text content'
    };
    render(<SectionRenderer section={section} />);
    const boldText = screen.getByText('Bold');
    expect(boldText).toBeInTheDocument();
    expect(boldText.tagName).toBe('STRONG');
  });

  it('should render AlertSection for alert type', () => {
    const section: Section = {
      type: 'alert',
      alert_type: 'info',
      content: 'Info message'
    };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Info message')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('should handle multiple sections in sequence', () => {
    const sections: Section[] = [
      { type: 'hero', heading: 'Welcome' },
      { type: 'text', content: 'Some content' },
      { type: 'alert', alert_type: 'success', content: 'Success!' }
    ];

    render(
      <>
        {sections.map((section, index) => (
          <SectionRenderer key={index} section={section} />
        ))}
      </>
    );

    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Some content')).toBeInTheDocument();
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('should preserve section props through renderer', () => {
    const section: Section = {
      type: 'hero',
      heading: 'Centered Hero',
      subtitle: 'With subtitle',
      align: 'center'
    };
    const { container } = render(<SectionRenderer section={section} />);

    expect(screen.getByText('Centered Hero')).toBeInTheDocument();
    expect(screen.getByText('With subtitle')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('text-center');
  });

  it('should render all alert types correctly', () => {
    const alerts: Section[] = [
      { type: 'alert', alert_type: 'info', content: 'Info' },
      { type: 'alert', alert_type: 'success', content: 'Success' },
      { type: 'alert', alert_type: 'warning', content: 'Warning' },
      { type: 'alert', alert_type: 'error', content: 'Error' }
    ];

    render(
      <>
        {alerts.map((alert, index) => (
          <SectionRenderer key={index} section={alert} />
        ))}
      </>
    );

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
