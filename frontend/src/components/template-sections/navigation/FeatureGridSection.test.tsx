import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureGridSection } from './FeatureGridSection';
import { FeatureGridSection as FeatureGridSectionType } from '@/lib/template-types';

describe('FeatureGridSection', () => {
  it('should render all features', () => {
    const props: FeatureGridSectionType = {
      type: 'feature_grid',
      features: [
        { title: 'Fast', description: 'Lightning fast performance' },
        { title: 'Secure', description: 'Bank-level security' },
        { title: 'Scalable', description: 'Grows with your needs' }
      ]
    };
    render(<FeatureGridSection {...props} />);
    expect(screen.getByText('Fast')).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('Scalable')).toBeInTheDocument();
    expect(screen.getByText('Lightning fast performance')).toBeInTheDocument();
  });

  it('should render optional icons', () => {
    const props: FeatureGridSectionType = {
      type: 'feature_grid',
      features: [
        { icon: '⚡', title: 'Fast', description: 'Quick' },
        { icon: '🔒', title: 'Secure', description: 'Safe' }
      ]
    };
    render(<FeatureGridSection {...props} />);
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('should work without icons', () => {
    const props: FeatureGridSectionType = {
      type: 'feature_grid',
      features: [
        { title: 'Feature', description: 'Description' }
      ]
    };
    render(<FeatureGridSection {...props} />);
    expect(screen.getByText('Feature')).toBeInTheDocument();
  });

  it('should support different column layouts', () => {
    const twoColProps: FeatureGridSectionType = {
      type: 'feature_grid',
      features: [{ title: 'Test', description: 'Test' }],
      columns: 2
    };
    const { container: twoColContainer } = render(<FeatureGridSection {...twoColProps} />);
    expect(twoColContainer.querySelector('.grid-cols-1.md\\:grid-cols-2')).toBeInTheDocument();

    const threeColProps: FeatureGridSectionType = {
      type: 'feature_grid',
      features: [{ title: 'Test', description: 'Test' }],
      columns: 3
    };
    const { container: threeColContainer } = render(<FeatureGridSection {...threeColProps} />);
    expect(threeColContainer.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();

    const fourColProps: FeatureGridSectionType = {
      type: 'feature_grid',
      features: [{ title: 'Test', description: 'Test' }],
      columns: 4
    };
    const { container: fourColContainer } = render(<FeatureGridSection {...fourColProps} />);
    expect(fourColContainer.querySelector('.lg\\:grid-cols-4')).toBeInTheDocument();
  });

  it('should default to 3 columns', () => {
    const props: FeatureGridSectionType = {
      type: 'feature_grid',
      features: [{ title: 'Test', description: 'Test' }]
    };
    const { container } = render(<FeatureGridSection {...props} />);
    expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
  });
});
