import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EmbedSection } from './EmbedSection';
import { EmbedSection as EmbedSectionType } from '@/lib/template-types';

describe('EmbedSection', () => {
  it('should render iframe with URL', () => {
    const props: EmbedSectionType = {
      type: 'embed',
      url: 'https://example.com/embed'
    };
    const { container } = render(<EmbedSection {...props} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com/embed');
  });

  it('should use custom height', () => {
    const props: EmbedSectionType = {
      type: 'embed',
      url: 'https://example.com/embed',
      height: '600px'
    };
    const { container } = render(<EmbedSection {...props} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveStyle({ height: '600px' });
  });

  it('should default to 400px height', () => {
    const props: EmbedSectionType = {
      type: 'embed',
      url: 'https://example.com/embed'
    };
    const { container } = render(<EmbedSection {...props} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveStyle({ height: '400px' });
  });

  it('should render optional title', () => {
    const props: EmbedSectionType = {
      type: 'embed',
      url: 'https://example.com/embed',
      title: 'External Content'
    };
    const { container } = render(<EmbedSection {...props} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('title', 'External Content');
  });

  it('should have default title when not provided', () => {
    const props: EmbedSectionType = {
      type: 'embed',
      url: 'https://example.com/embed'
    };
    const { container } = render(<EmbedSection {...props} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('title', 'Embedded content');
  });

  it('should enable fullscreen', () => {
    const props: EmbedSectionType = {
      type: 'embed',
      url: 'https://example.com/embed'
    };
    const { container } = render(<EmbedSection {...props} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('allowFullScreen');
  });
});
