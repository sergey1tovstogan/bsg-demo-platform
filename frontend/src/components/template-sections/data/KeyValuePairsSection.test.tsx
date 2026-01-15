import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyValuePairsSection } from './KeyValuePairsSection';
import { KeyValuePairsSection as KeyValuePairsSectionType } from '@/lib/template-types';

describe('KeyValuePairsSection', () => {
  it('should render all key-value pairs', () => {
    const props: KeyValuePairsSectionType = {
      type: 'key_value_pairs',
      pairs: [
        { key: 'Name', value: 'John Doe' },
        { key: 'Email', value: 'john@example.com' },
        { key: 'Role', value: 'Developer' }
      ]
    };
    render(<KeyValuePairsSection {...props} />);
    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Email/)).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should use semantic HTML (dl/dt/dd)', () => {
    const props: KeyValuePairsSectionType = {
      type: 'key_value_pairs',
      pairs: [{ key: 'Test', value: 'Value' }]
    };
    const { container } = render(<KeyValuePairsSection {...props} />);
    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelector('dt')).toBeInTheDocument();
    expect(container.querySelector('dd')).toBeInTheDocument();
  });

  it('should format keys with colon', () => {
    const props: KeyValuePairsSectionType = {
      type: 'key_value_pairs',
      pairs: [{ key: 'Status', value: 'Active' }]
    };
    render(<KeyValuePairsSection {...props} />);
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
  });

  it('should apply proper styling to keys and values', () => {
    const props: KeyValuePairsSectionType = {
      type: 'key_value_pairs',
      pairs: [{ key: 'Key', value: 'Value' }]
    };
    const { container } = render(<KeyValuePairsSection {...props} />);
    const dt = container.querySelector('dt');
    const dd = container.querySelector('dd');
    expect(dt).toHaveClass('font-semibold');
    expect(dd).toHaveClass('text-slate-700', 'dark:text-slate-300');
  });

  it('should handle empty pairs array', () => {
    const props: KeyValuePairsSectionType = {
      type: 'key_value_pairs',
      pairs: []
    };
    const { container } = render(<KeyValuePairsSection {...props} />);
    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelectorAll('dt')).toHaveLength(0);
  });
});
