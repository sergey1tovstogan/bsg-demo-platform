import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveDiagramSection } from './InteractiveDiagramSection';
import { vi } from 'vitest';

// Mock click action hook
const mockHandleClick = vi.fn();
vi.mock('@/hooks/useClickAction', () => ({
    useClickAction: () => ({
        handleClick: mockHandleClick
    })
}));

const mockSection = {
    type: 'interactive_diagram',
    image: 'test-diagram.jpg',
    hotspots: [
        {
            x: 50,
            y: 50,
            radius: 20,
            hover_text: 'Hotspot 1',
            click_action: { type: 'navigate', target: 'page-1' }
        }
    ]
};

describe('InteractiveDiagramSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the diagram image', () => {
        render(<InteractiveDiagramSection section={mockSection as any} />);
        const img = screen.getByAltText('Interactive Diagram');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'test-diagram.jpg');
    });

    it('should render hotspots at correct positions', () => {
        render(<InteractiveDiagramSection section={mockSection as any} />);
        const hotspot = screen.getByRole('button');
        expect(hotspot).toBeInTheDocument();
        expect(hotspot).toHaveStyle({
            left: '50%',
            top: '50%',
            width: '40px',
            height: '40px'
        });
    });

    it('should call handleClick when hotspot is clicked', () => {
        render(<InteractiveDiagramSection section={mockSection as any} />);
        const hotspot = screen.getByRole('button');
        fireEvent.click(hotspot);
        expect(mockHandleClick).toHaveBeenCalledWith(mockSection.hotspots[0].click_action);
    });

    it('should show tooltip text on focus/hover', () => {
        render(<InteractiveDiagramSection section={mockSection as any} />);
        const hotspot = screen.getByRole('button');
        expect(hotspot).toHaveAttribute('title', 'Hotspot 1');
    });
});
