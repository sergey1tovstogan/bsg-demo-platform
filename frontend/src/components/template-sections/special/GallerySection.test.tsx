import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GallerySection } from './GallerySection';
import { GallerySection as GallerySectionType } from '@/lib/template-types';

describe('GallerySection', () => {
  it('should render all images', () => {
    const props: GallerySectionType = {
      type: 'gallery',
      images: [
        { src: '/img1.jpg', alt: 'Image 1' },
        { src: '/img2.jpg', alt: 'Image 2' },
        { src: '/img3.jpg', alt: 'Image 3' }
      ]
    };
    render(<GallerySection {...props} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(screen.getByAltText('Image 1')).toHaveAttribute('src', '/img1.jpg');
    expect(screen.getByAltText('Image 2')).toHaveAttribute('src', '/img2.jpg');
  });

  it('should render optional captions', () => {
    const props: GallerySectionType = {
      type: 'gallery',
      images: [
        { src: '/img.jpg', alt: 'Test', caption: 'Test caption' }
      ]
    };
    render(<GallerySection {...props} />);
    expect(screen.getByText('Test caption')).toBeInTheDocument();
  });

  it('should work without captions', () => {
    const props: GallerySectionType = {
      type: 'gallery',
      images: [
        { src: '/img.jpg', alt: 'Test' }
      ]
    };
    const { container } = render(<GallerySection {...props} />);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('should support different column layouts', () => {
    const twoColProps: GallerySectionType = {
      type: 'gallery',
      images: [{ src: '/test.jpg', alt: 'Test' }],
      columns: 2
    };
    const { container: twoColContainer } = render(<GallerySection {...twoColProps} />);
    expect(twoColContainer.querySelector('.sm\\:grid-cols-2')).not.toBeNull();

    const threeColProps: GallerySectionType = {
      type: 'gallery',
      images: [{ src: '/test.jpg', alt: 'Test' }],
      columns: 3
    };
    const { container: threeColContainer } = render(<GallerySection {...threeColProps} />);
    expect(threeColContainer.querySelector('.lg\\:grid-cols-3')).not.toBeNull();

    const fourColProps: GallerySectionType = {
      type: 'gallery',
      images: [{ src: '/test.jpg', alt: 'Test' }],
      columns: 4
    };
    const { container: fourColContainer } = render(<GallerySection {...fourColProps} />);
    expect(fourColContainer.querySelector('.lg\\:grid-cols-4')).not.toBeNull();
  });

  it('should default to 3 columns', () => {
    const props: GallerySectionType = {
      type: 'gallery',
      images: [{ src: '/test.jpg', alt: 'Test' }]
    };
    const { container } = render(<GallerySection {...props} />);
    expect(container.querySelector('.lg\\:grid-cols-3')).not.toBeNull();
  });

  it('should use semantic figure elements', () => {
    const props: GallerySectionType = {
      type: 'gallery',
      images: [{ src: '/test.jpg', alt: 'Test' }]
    };
    const { container } = render(<GallerySection {...props} />);
    expect(container.querySelector('figure')).toBeInTheDocument();
  });
});
