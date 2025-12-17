import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabbedContentSection } from './TabbedContentSection';
import { TabbedContentSection as TabbedContentSectionType } from '@/lib/template-types';

describe('TabbedContentSection', () => {
  it('should render all tab labels', () => {
    const props: TabbedContentSectionType = {
      type: 'tabbed_content',
      tabs: [
        { label: 'Tab 1', content: 'Content 1' },
        { label: 'Tab 2', content: 'Content 2' },
        { label: 'Tab 3', content: 'Content 3' }
      ]
    };
    render(<TabbedContentSection {...props} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('should show first tab content by default', () => {
    const props: TabbedContentSectionType = {
      type: 'tabbed_content',
      tabs: [
        { label: 'Tab 1', content: 'First tab content' },
        { label: 'Tab 2', content: 'Second tab content' }
      ]
    };
    render(<TabbedContentSection {...props} />);
    expect(screen.getByText('First tab content')).toBeInTheDocument();
    expect(screen.queryByText('Second tab content')).not.toBeInTheDocument();
  });

  it('should switch content when tab is clicked', () => {
    const props: TabbedContentSectionType = {
      type: 'tabbed_content',
      tabs: [
        { label: 'Tab 1', content: 'First content' },
        { label: 'Tab 2', content: 'Second content' }
      ]
    };
    render(<TabbedContentSection {...props} />);

    expect(screen.getByText('First content')).toBeInTheDocument();

    const tab2 = screen.getByText('Tab 2');
    fireEvent.click(tab2);

    expect(screen.queryByText('First content')).not.toBeInTheDocument();
    expect(screen.getByText('Second content')).toBeInTheDocument();
  });

  it('should apply active styling to selected tab', () => {
    const props: TabbedContentSectionType = {
      type: 'tabbed_content',
      tabs: [
        { label: 'Active', content: 'Content' },
        { label: 'Inactive', content: 'Content' }
      ]
    };
    render(<TabbedContentSection {...props} />);

    const activeTab = screen.getByText('Active');
    const inactiveTab = screen.getByText('Inactive');

    expect(activeTab).toHaveClass('text-blue-600');
    expect(inactiveTab).toHaveClass('text-slate-600');
  });

  it('should handle single tab', () => {
    const props: TabbedContentSectionType = {
      type: 'tabbed_content',
      tabs: [
        { label: 'Only Tab', content: 'Only content' }
      ]
    };
    render(<TabbedContentSection {...props} />);
    expect(screen.getByText('Only Tab')).toBeInTheDocument();
    expect(screen.getByText('Only content')).toBeInTheDocument();
  });
});
