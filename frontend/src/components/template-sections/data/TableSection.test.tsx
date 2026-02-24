import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableSection } from './TableSection';
import { TableSection as TableSectionType } from '@/lib/template-types';

describe('TableSection', () => {
  it('should render table headers', () => {
    const props: TableSectionType = {
      type: 'table',
      headers: ['Name', 'Age', 'City'],
      rows: []
    };
    render(<TableSection {...props} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('should render table rows', () => {
    const props: TableSectionType = {
      type: 'table',
      headers: ['Name', 'Age'],
      rows: [
        ['Alice', '30'],
        ['Bob', '25']
      ]
    };
    render(<TableSection {...props} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should use semantic table elements', () => {
    const props: TableSectionType = {
      type: 'table',
      headers: ['H1'],
      rows: [['R1']]
    };
    const { container } = render(<TableSection {...props} />);
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
    expect(container.querySelector('th')).toBeInTheDocument();
    expect(container.querySelector('td')).toBeInTheDocument();
  });

  it('should handle empty rows', () => {
    const props: TableSectionType = {
      type: 'table',
      headers: ['Column 1', 'Column 2'],
      rows: []
    };
    const { container } = render(<TableSection {...props} />);
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(0);
  });

  it('should handle multiple rows and columns', () => {
    const props: TableSectionType = {
      type: 'table',
      headers: ['A', 'B', 'C', 'D'],
      rows: [
        ['1', '2', '3', '4'],
        ['5', '6', '7', '8'],
        ['9', '10', '11', '12']
      ]
    };
    const { container } = render(<TableSection {...props} />);
    const headerCells = container.querySelectorAll('th');
    const dataCells = container.querySelectorAll('td');
    expect(headerCells.length).toBe(4);
    expect(dataCells.length).toBe(12);
  });
});
