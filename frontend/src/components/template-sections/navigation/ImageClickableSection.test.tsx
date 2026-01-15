import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageClickableSection } from './ImageClickableSection';
import { ImageClickableSection as ImageClickableSectionType } from '@/lib/template-types';

const mockNavigate = vi.fn();
const mockShowPopup = vi.fn();

vi.mock('@/components/template-navigation/NavigationProvider', () => ({
  useNavigation: vi.fn(() => ({
    navigateToPage: mockNavigate,
    showPopup: mockShowPopup,
  })),
}));

describe('ImageClickableSection', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockShowPopup.mockClear();
  });

  it('should render clickable image', () => {
    const props: ImageClickableSectionType = {
      type: 'image_clickable',
      src: '/test.jpg',
      alt: 'Test image',
      action: { type: 'navigate_to_subpage', target: 'details' }
    };
    render(<ImageClickableSection {...props} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test image');
  });

  it('should trigger action on click', () => {
    const props: ImageClickableSectionType = {
      type: 'image_clickable',
      src: '/test.jpg',
      alt: 'Test',
      action: { type: 'navigate_to_subpage', target: 'page1' }
    };
    const { container } = render(<ImageClickableSection {...props} />);
    const button = container.querySelector('button');
    fireEvent.click(button!);
    expect(mockNavigate).toHaveBeenCalledWith('page1');
  });

  it('should render optional caption', () => {
    const props: ImageClickableSectionType = {
      type: 'image_clickable',
      src: '/test.jpg',
      alt: 'Test',
      action: { type: 'navigate_to_subpage', target: 'page1' },
      caption: 'Click to learn more'
    };
    render(<ImageClickableSection {...props} />);
    expect(screen.getByText('Click to learn more')).toBeInTheDocument();
  });

  it('should work without caption', () => {
    const props: ImageClickableSectionType = {
      type: 'image_clickable',
      src: '/test.jpg',
      alt: 'Test',
      action: { type: 'navigate_to_subpage', target: 'page1' }
    };
    const { container } = render(<ImageClickableSection {...props} />);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('should use semantic figure element', () => {
    const props: ImageClickableSectionType = {
      type: 'image_clickable',
      src: '/test.jpg',
      alt: 'Test',
      action: { type: 'navigate_to_subpage', target: 'page1' }
    };
    const { container } = render(<ImageClickableSection {...props} />);
    expect(container.querySelector('figure')).toBeInTheDocument();
  });

  it('should support popup actions', () => {
    const props: ImageClickableSectionType = {
      type: 'image_clickable',
      src: '/test.jpg',
      alt: 'Test',
      action: { type: 'show_popup', popup_id: 'modal1' }
    };
    const { container } = render(<ImageClickableSection {...props} />);
    const button = container.querySelector('button');
    fireEvent.click(button!);
    expect(mockShowPopup).toHaveBeenCalledWith('modal1');
  });
});
