import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoSection } from './VideoSection';
import { VideoSection as VideoSectionType } from '@/lib/template-types';

describe('VideoSection', () => {
  it('should render iframe with src', () => {
    const props: VideoSectionType = {
      type: 'video',
      src: 'https://youtube.com/embed/test'
    };
    const { container } = render(<VideoSection {...props} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://youtube.com/embed/test');
  });

  it('should render optional caption', () => {
    const props: VideoSectionType = {
      type: 'video',
      src: 'https://youtube.com/embed/test',
      caption: 'Tutorial video'
    };
    render(<VideoSection {...props} />);
    expect(screen.getByText('Tutorial video')).toBeInTheDocument();
  });

  it('should work without caption', () => {
    const props: VideoSectionType = {
      type: 'video',
      src: 'https://youtube.com/embed/test'
    };
    const { container } = render(<VideoSection {...props} />);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('should support different aspect ratios', () => {
    const sixteenNineProps: VideoSectionType = {
      type: 'video',
      src: 'https://youtube.com/embed/test',
      aspect_ratio: '16:9'
    };
    const { container: container16x9 } = render(<VideoSection {...sixteenNineProps} />);
    expect(container16x9.querySelector('.aspect-video')).toBeInTheDocument();

    const fourThreeProps: VideoSectionType = {
      type: 'video',
      src: 'https://youtube.com/embed/test',
      aspect_ratio: '4:3'
    };
    const { container: container4x3 } = render(<VideoSection {...fourThreeProps} />);
    expect(container4x3.querySelector('.aspect-\\[4\\/3\\]')).toBeInTheDocument();

    const oneOneProps: VideoSectionType = {
      type: 'video',
      src: 'https://youtube.com/embed/test',
      aspect_ratio: '1:1'
    };
    const { container: container1x1 } = render(<VideoSection {...oneOneProps} />);
    expect(container1x1.querySelector('.aspect-square')).toBeInTheDocument();
  });

  it('should default to 16:9 aspect ratio', () => {
    const props: VideoSectionType = {
      type: 'video',
      src: 'https://youtube.com/embed/test'
    };
    const { container } = render(<VideoSection {...props} />);
    expect(container.querySelector('.aspect-video')).toBeInTheDocument();
  });

  it('should enable fullscreen', () => {
    const props: VideoSectionType = {
      type: 'video',
      src: 'https://youtube.com/embed/test'
    };
    const { container } = render(<VideoSection {...props} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toHaveAttribute('allowFullScreen');
  });
});
