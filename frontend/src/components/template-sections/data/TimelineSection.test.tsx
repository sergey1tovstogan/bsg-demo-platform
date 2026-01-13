import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimelineSection } from './TimelineSection';
import { TimelineSection as TimelineSectionType } from '@/lib/template-types';

describe('TimelineSection', () => {
  it('should render all timeline events', () => {
    const props: TimelineSectionType = {
      type: 'timeline',
      events: [
        { title: 'Event 1', description: 'Description 1' },
        { title: 'Event 2', description: 'Description 2' },
        { title: 'Event 3', description: 'Description 3' }
      ]
    };
    render(<TimelineSection {...props} />);
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.getByText('Event 3')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
  });

  it('should render optional dates', () => {
    const props: TimelineSectionType = {
      type: 'timeline',
      events: [
        { title: 'Event', description: 'Description', date: '2024-01-01' }
      ]
    };
    render(<TimelineSection {...props} />);
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  it('should work without dates', () => {
    const props: TimelineSectionType = {
      type: 'timeline',
      events: [
        { title: 'Event', description: 'Description' }
      ]
    };
    const { container } = render(<TimelineSection {...props} />);
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(container.querySelector('time')).toBeNull();
  });

  it('should render timeline dots', () => {
    const props: TimelineSectionType = {
      type: 'timeline',
      events: [
        { title: 'Event 1', description: 'Desc 1' },
        { title: 'Event 2', description: 'Desc 2' }
      ]
    };
    const { container } = render(<TimelineSection {...props} />);
    const dots = container.querySelectorAll('.rounded-full.bg-blue-600');
    expect(dots.length).toBe(2);
  });

  it('should render timeline line', () => {
    const props: TimelineSectionType = {
      type: 'timeline',
      events: [
        { title: 'Event', description: 'Description' }
      ]
    };
    const { container } = render(<TimelineSection {...props} />);
    const line = container.querySelector('.absolute.left-4');
    expect(line).toBeInTheDocument();
    expect(line).toHaveClass('bg-slate-200');
  });

  it('should handle single event', () => {
    const props: TimelineSectionType = {
      type: 'timeline',
      events: [
        { title: 'Only Event', description: 'Only Description', date: '2024' }
      ]
    };
    render(<TimelineSection {...props} />);
    expect(screen.getByText('Only Event')).toBeInTheDocument();
    expect(screen.getByText('Only Description')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });
});
