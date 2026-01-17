import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeBlockSection } from './CodeBlockSection';
import { CodeBlockSection as CodeBlockSectionType } from '@/lib/template-types';

describe('CodeBlockSection', () => {
  it('should render code content', () => {
    const props: CodeBlockSectionType = {
      type: 'code_block',
      code: 'const x = 42;',
      language: 'javascript'
    };
    const { container } = render(<CodeBlockSection {...props} />);
    expect(screen.getByText('const x = 42;')).toBeInTheDocument();
    expect(container.querySelector('pre')).toBeInTheDocument();
    expect(container.querySelector('code')).toBeInTheDocument();
  });

  it('should use language class on code element', () => {
    const props: CodeBlockSectionType = {
      type: 'code_block',
      code: 'print("Hello")',
      language: 'python'
    };
    const { container } = render(<CodeBlockSection {...props} />);
    const code = container.querySelector('code');
    expect(code).toHaveClass('language-python');
  });

  it('should default to text language', () => {
    const props: CodeBlockSectionType = {
      type: 'code_block',
      code: 'Some plain text'
    };
    const { container } = render(<CodeBlockSection {...props} />);
    const code = container.querySelector('code');
    expect(code).toHaveClass('language-text');
  });

  it('should render optional title', () => {
    const props: CodeBlockSectionType = {
      type: 'code_block',
      code: 'const x = 1;',
      language: 'typescript',
      title: 'example.ts'
    };
    render(<CodeBlockSection {...props} />);
    expect(screen.getByText('example.ts')).toBeInTheDocument();
  });

  it('should work without title', () => {
    const props: CodeBlockSectionType = {
      type: 'code_block',
      code: 'code here'
    };
    const { container } = render(<CodeBlockSection {...props} />);
    const pre = container.querySelector('pre');
    expect(pre).toHaveClass('rounded-xl');
  });

  it('should apply different border radius when title is present', () => {
    const propsWithTitle: CodeBlockSectionType = {
      type: 'code_block',
      code: 'code',
      title: 'Title'
    };
    const { container: containerWithTitle } = render(<CodeBlockSection {...propsWithTitle} />);
    expect(containerWithTitle.querySelector('pre')).toHaveClass('rounded-b-xl');

    const propsWithoutTitle: CodeBlockSectionType = {
      type: 'code_block',
      code: 'code'
    };
    const { container: containerWithoutTitle } = render(<CodeBlockSection {...propsWithoutTitle} />);
    expect(containerWithoutTitle.querySelector('pre')).toHaveClass('rounded-xl');
  });
});
