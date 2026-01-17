import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextWithLinksSection } from './TextWithLinksSection';
import { TextWithLinksSection as TextWithLinksSectionType } from '@/lib/template-types';

const mockNavigate = vi.fn();
const mockShowPopup = vi.fn();

vi.mock('@/components/template-navigation/NavigationProvider', () => ({
  useNavigation: vi.fn(() => ({
    navigateToPage: mockNavigate,
    showPopup: mockShowPopup,
  })),
}));

describe('TextWithLinksSection', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockShowPopup.mockClear();
  });

  it('should render text content', () => {
    const props: TextWithLinksSectionType = {
      type: 'text_with_links',
      content: 'This is some text content with links below.'
    };
    render(<TextWithLinksSection {...props} />);
    expect(screen.getByText('This is some text content with links below.')).toBeInTheDocument();
  });

  it('should render links when provided', () => {
    const props: TextWithLinksSectionType = {
      type: 'text_with_links',
      content: 'Content',
      links: [
        { label: 'Learn More', action: { type: 'navigate_to_subpage', target: 'details' } },
        { label: 'View Demo', action: { type: 'navigate_to_subpage', target: 'demo' } }
      ]
    };
    render(<TextWithLinksSection {...props} />);
    expect(screen.getByText('Learn More')).toBeInTheDocument();
    expect(screen.getByText('View Demo')).toBeInTheDocument();
  });

  it('should work without links', () => {
    const props: TextWithLinksSectionType = {
      type: 'text_with_links',
      content: 'Just text, no links'
    };
    const { container } = render(<TextWithLinksSection {...props} />);
    expect(screen.getByText('Just text, no links')).toBeInTheDocument();
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('should trigger navigation action on link click', () => {
    const props: TextWithLinksSectionType = {
      type: 'text_with_links',
      content: 'Content',
      links: [
        { label: 'Go to Page', action: { type: 'navigate_to_subpage', target: 'page1' } }
      ]
    };
    render(<TextWithLinksSection {...props} />);
    const link = screen.getByText('Go to Page');
    fireEvent.click(link);
    expect(mockNavigate).toHaveBeenCalledWith('page1');
  });

  it('should render multiple links', () => {
    const props: TextWithLinksSectionType = {
      type: 'text_with_links',
      content: 'Content',
      links: [
        { label: 'Link 1', action: { type: 'navigate_to_subpage', target: 'p1' } },
        { label: 'Link 2', action: { type: 'navigate_to_subpage', target: 'p2' } },
        { label: 'Link 3', action: { type: 'navigate_to_subpage', target: 'p3' } }
      ]
    };
    const { container } = render(<TextWithLinksSection {...props} />);
    expect(container.querySelectorAll('button')).toHaveLength(3);
  });
});
