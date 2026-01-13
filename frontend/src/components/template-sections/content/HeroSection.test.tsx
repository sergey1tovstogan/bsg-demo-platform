import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';
import { HeroSection as HeroSectionType } from '@/lib/template-types';

describe('HeroSection', () => {
  it('should render heading', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test Heading'
    };
    render(<HeroSection {...props} />);
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('should render heading as H1', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test Heading'
    };
    render(<HeroSection {...props} />);
    const heading = screen.getByText('Test Heading');
    expect(heading.tagName).toBe('H1');
  });

  it('should apply correct typography classes', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test'
    };
    render(<HeroSection {...props} />);
    const heading = screen.getByText('Test');
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'tracking-tight');
  });

  it('should render optional subtitle', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test',
      subtitle: 'Test Subtitle'
    };
    render(<HeroSection {...props} />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should not render subtitle when not provided', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test'
    };
    render(<HeroSection {...props} />);
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('should apply center alignment', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test',
      align: 'center'
    };
    const { container } = render(<HeroSection {...props} />);
    expect(container.firstChild).toHaveClass('text-center');
  });

  it('should apply right alignment', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test',
      align: 'right'
    };
    const { container } = render(<HeroSection {...props} />);
    expect(container.firstChild).toHaveClass('text-right');
  });

  it('should default to left alignment', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test'
    };
    const { container } = render(<HeroSection {...props} />);
    expect(container.firstChild).toHaveClass('text-left');
  });

  it('should have semantic banner role', () => {
    const props: HeroSectionType = {
      type: 'hero',
      heading: 'Test'
    };
    const { container } = render(<HeroSection {...props} />);
    expect(container.firstChild).toHaveAttribute('role', 'banner');
  });
});
