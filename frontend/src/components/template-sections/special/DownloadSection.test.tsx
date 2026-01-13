import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DownloadSection } from './DownloadSection';
import { DownloadSection as DownloadSectionType } from '@/lib/template-types';

describe('DownloadSection', () => {
  it('should render all download files', () => {
    const props: DownloadSectionType = {
      type: 'download',
      files: [
        { name: 'Document.pdf', url: '/docs/doc.pdf' },
        { name: 'Spreadsheet.xlsx', url: '/docs/sheet.xlsx' }
      ]
    };
    render(<DownloadSection {...props} />);
    expect(screen.getByText('Document.pdf')).toBeInTheDocument();
    expect(screen.getByText('Spreadsheet.xlsx')).toBeInTheDocument();
  });

  it('should render download links with correct URLs', () => {
    const props: DownloadSectionType = {
      type: 'download',
      files: [
        { name: 'File.pdf', url: '/downloads/file.pdf' }
      ]
    };
    render(<DownloadSection {...props} />);
    const link = screen.getByText('File.pdf').closest('a');
    expect(link).toHaveAttribute('href', '/downloads/file.pdf');
    expect(link).toHaveAttribute('download');
  });

  it('should render optional descriptions', () => {
    const props: DownloadSectionType = {
      type: 'download',
      files: [
        { name: 'Manual.pdf', url: '/manual.pdf', description: 'User manual' }
      ]
    };
    render(<DownloadSection {...props} />);
    expect(screen.getByText('User manual')).toBeInTheDocument();
  });

  it('should render optional file sizes', () => {
    const props: DownloadSectionType = {
      type: 'download',
      files: [
        { name: 'File.pdf', url: '/file.pdf', size: '2.5 MB' }
      ]
    };
    render(<DownloadSection {...props} />);
    expect(screen.getByText('2.5 MB')).toBeInTheDocument();
  });

  it('should work without description and size', () => {
    const props: DownloadSectionType = {
      type: 'download',
      files: [
        { name: 'Simple.pdf', url: '/simple.pdf' }
      ]
    };
    render(<DownloadSection {...props} />);
    expect(screen.getByText('Simple.pdf')).toBeInTheDocument();
  });

  it('should render download icons', () => {
    const props: DownloadSectionType = {
      type: 'download',
      files: [
        { name: 'File.pdf', url: '/file.pdf' }
      ]
    };
    const { container } = render(<DownloadSection {...props} />);
    const downloadIcon = container.querySelector('svg');
    expect(downloadIcon).toBeInTheDocument();
  });
});
