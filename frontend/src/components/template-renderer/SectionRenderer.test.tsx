import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionRenderer } from './SectionRenderer';
import { Section } from '@/lib/template-types';

describe('SectionRenderer', () => {
  it('should render HeroSection for hero type', () => {
    const section: Section = {
      type: 'hero',
      heading: 'Test Hero Heading'
    };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Test Hero Heading')).toBeInTheDocument();
  });

  it('should render TextSection for text type', () => {
    const section: Section = {
      type: 'text',
      content: '**Bold** text'
    };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Bold')).toBeInTheDocument();
  });

  it('should render AlertSection for alert type', () => {
    const section: Section = {
      type: 'alert',
      alert_type: 'info',
      content: 'Info message'
    };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('should render error message for unknown section type', () => {
    const section: any = {
      type: 'unknown_type'
    };
    const { container } = render(<SectionRenderer section={section} />);
    expect(container.textContent).toContain('Unknown section type');
  });

  it('should pass props correctly to HeroSection', () => {
    const section: Section = {
      type: 'hero',
      heading: 'Main Heading',
      subtitle: 'Subheading text',
      align: 'center'
    };
    const { container } = render(<SectionRenderer section={section} />);
    expect(screen.getByText('Main Heading')).toBeInTheDocument();
    expect(screen.getByText('Subheading text')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('text-center');
  });

  it('should pass props correctly to AlertSection', () => {
    const section: Section = {
      type: 'alert',
      alert_type: 'success',
      title: 'Success!',
      content: 'Operation completed'
    };
    render(<SectionRenderer section={section} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });
});
