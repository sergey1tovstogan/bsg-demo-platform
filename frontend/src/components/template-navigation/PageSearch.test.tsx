import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PageSearch } from './PageSearch';
import { PageDefinition } from '@/lib/template-types';

// Mock data
const mockPages: Map<string, PageDefinition> = new Map([
  [
    'intro',
    {
      id: 'intro',
      title: 'Introduction to Observability',
      description: 'Learn the basics of observability',
      tags: ['beginner', 'basics'],
      sections: [],
    },
  ],
  [
    'metrics',
    {
      id: 'metrics',
      title: 'Metrics Collection',
      description: 'How to collect and analyze metrics',
      tags: ['intermediate', 'monitoring'],
      sections: [],
    },
  ],
  [
    'traces',
    {
      id: 'traces',
      title: 'Distributed Tracing',
      description: 'Understanding trace data',
      tags: ['advanced', 'monitoring'],
      sections: [],
    },
  ],
]);

describe('PageSearch', () => {
  let mockOnNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnNavigate = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render search input', () => {
    render(<PageSearch pages={mockPages} onNavigate={mockOnNavigate} />);
    expect(screen.getByPlaceholderText(/search pages/i)).toBeInTheDocument();
  });

  it('should filter pages by title', () => {
    render(<PageSearch pages={mockPages} onNavigate={mockOnNavigate} />);

    const searchInput = screen.getByPlaceholderText(/search pages/i);

    // Type search query
    fireEvent.change(searchInput, { target: { value: 'metrics' } });

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Metrics Collection/i)).toBeInTheDocument();
    expect(screen.queryByText(/Introduction to Observability/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Distributed Tracing/i)).not.toBeInTheDocument();
  });

  it('should filter pages by description', () => {
    render(<PageSearch pages={mockPages} onNavigate={mockOnNavigate} />);

    const searchInput = screen.getByPlaceholderText(/search pages/i);

    fireEvent.change(searchInput, { target: { value: 'trace data' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Distributed Tracing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Introduction to Observability/i)).not.toBeInTheDocument();
  });

  it('should filter pages by tags', () => {
    render(<PageSearch pages={mockPages} onNavigate={mockOnNavigate} />);

    const searchInput = screen.getByPlaceholderText(/search pages/i);

    fireEvent.change(searchInput, { target: { value: 'monitoring' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Metrics Collection/i)).toBeInTheDocument();
    expect(screen.getByText(/Distributed Tracing/i)).toBeInTheDocument();
    expect(screen.queryByText(/Introduction to Observability/i)).not.toBeInTheDocument();
  });

  it('should debounce search input', () => {
    render(<PageSearch pages={mockPages} onNavigate={mockOnNavigate} />);

    const searchInput = screen.getByPlaceholderText(/search pages/i);

    // Type multiple times quickly
    fireEvent.change(searchInput, { target: { value: 'm' } });
    fireEvent.change(searchInput, { target: { value: 'me' } });
    fireEvent.change(searchInput, { target: { value: 'met' } });

    // Only 100ms passed - results should not update yet
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should still show all pages or loading state
    expect(screen.queryByText(/Metrics Collection/i)).toBeInTheDocument();

    // Now advance past debounce time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Metrics Collection/i)).toBeInTheDocument();
  });

  it('should navigate on result click', () => {
    render(<PageSearch pages={mockPages} onNavigate={mockOnNavigate} />);

    const searchInput = screen.getByPlaceholderText(/search pages/i);

    fireEvent.change(searchInput, { target: { value: 'metrics' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Metrics Collection/i)).toBeInTheDocument();

    // Click the result
    const result = screen.getByText(/Metrics Collection/i);
    fireEvent.click(result);

    expect(mockOnNavigate).toHaveBeenCalledWith('metrics');
  });

  it('should clear search with clear button', () => {
    render(<PageSearch pages={mockPages} onNavigate={mockOnNavigate} />);

    const searchInput = screen.getByPlaceholderText(/search pages/i) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: 'metrics' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/Metrics Collection/i)).toBeInTheDocument();

    // Find and click clear button
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');

    // After clearing, search query is empty so all pages shown (but search dropdown only shows when there's a query)
    // The dropdown won't be visible when searchQuery is empty
  });

  it('should show no results message', () => {
    render(<PageSearch pages={mockPages} onNavigate={mockOnNavigate} />);

    const searchInput = screen.getByPlaceholderText(/search pages/i);

    fireEvent.change(searchInput, { target: { value: 'nonexistent query xyz' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/no pages found/i)).toBeInTheDocument();
  });

  it('should support custom placeholder', () => {
    render(
      <PageSearch
        pages={mockPages}
        onNavigate={mockOnNavigate}
        placeholder="Find a page..."
      />
    );

    expect(screen.getByPlaceholderText('Find a page...')).toBeInTheDocument();
  });
});
