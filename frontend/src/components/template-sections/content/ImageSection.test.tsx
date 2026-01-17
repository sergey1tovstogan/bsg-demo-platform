import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageSection } from './ImageSection';
import { ImageSection as ImageSectionType } from '@/lib/template-types';

describe('ImageSection', () => {
  it('should render image with src and alt', () => {
    const props: ImageSectionType = {
      type: 'image',
      src: '/test-image.jpg',
      alt: 'Test image description'
    };
    render(<ImageSection {...props} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test-image.jpg');
    expect(img).toHaveAttribute('alt', 'Test image description');
  });

  it('should render optional caption', () => {
    const props: ImageSectionType = {
      type: 'image',
      src: '/test.jpg',
      alt: 'Test',
      caption: 'This is a caption'
    };
    render(<ImageSection {...props} />);
    expect(screen.getByText('This is a caption')).toBeInTheDocument();
  });

  it('should work without caption', () => {
    const props: ImageSectionType = {
      type: 'image',
      src: '/test.jpg',
      alt: 'Test'
    };
    const { container } = render(<ImageSection {...props} />);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('should use semantic HTML (figure/img/figcaption)', () => {
    const props: ImageSectionType = {
      type: 'image',
      src: '/test.jpg',
      alt: 'Test',
      caption: 'Caption'
    };
    const { container } = render(<ImageSection {...props} />);
    expect(container.querySelector('figure')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('figcaption')).toBeInTheDocument();
  });

  it('should support different width options', () => {
    const fullProps: ImageSectionType = {
      type: 'image',
      src: '/test.jpg',
      alt: 'Test',
      width: 'full'
    };
    const { container: fullContainer } = render(<ImageSection {...fullProps} />);
    expect(fullContainer.querySelector('figure')).toHaveClass('w-full');

    const halfProps: ImageSectionType = {
      type: 'image',
      src: '/test.jpg',
      alt: 'Test',
      width: 'half'
    };
    const { container: halfContainer } = render(<ImageSection {...halfProps} />);
    expect(halfContainer.querySelector('figure')).toHaveClass('w-1/2');

    const thirdProps: ImageSectionType = {
      type: 'image',
      src: '/test.jpg',
      alt: 'Test',
      width: 'third'
    };
    const { container: thirdContainer } = render(<ImageSection {...thirdProps} />);
    expect(thirdContainer.querySelector('figure')).toHaveClass('w-1/3');
  });

  it('should default to full width', () => {
    const props: ImageSectionType = {
      type: 'image',
      src: '/test.jpg',
      alt: 'Test'
    };
    const { container } = render(<ImageSection {...props} />);
    expect(container.querySelector('figure')).toHaveClass('w-full');
  });
});
