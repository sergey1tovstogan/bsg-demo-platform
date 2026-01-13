import { renderHook, act } from '@testing-library/react';
import { usePopup } from './usePopup';
import { vi } from 'vitest';
import * as NavigationProvider from '@/components/template-navigation/NavigationProvider';

// Mock NavigationProvider
vi.mock('@/components/template-navigation/NavigationProvider', () => ({
    useNavigation: vi.fn()
}));

describe('usePopup', () => {
    const mockShowPopup = vi.fn();
    const mockClosePopup = vi.fn();

    beforeEach(() => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            showPopup: mockShowPopup,
            closePopup: mockClosePopup,
            popupStack: []
        } as any);
    });

    it('should call showPopup from navigation', () => {
        const { result } = renderHook(() => usePopup());
        result.current.open('test-id');
        expect(mockShowPopup).toHaveBeenCalledWith('test-id');
    });

    it('should call closePopup from navigation', () => {
        const { result } = renderHook(() => usePopup());
        result.current.close();
        expect(mockClosePopup).toHaveBeenCalled();
    });

    it('should return isOpen true if id is in stack', () => {
        vi.mocked(NavigationProvider.useNavigation).mockReturnValue({
            popupStack: ['test-id'],
            showPopup: mockShowPopup,
            closePopup: mockClosePopup
        } as any);

        const { result } = renderHook(() => usePopup());
        expect(result.current.isOpen('test-id')).toBe(true);
        expect(result.current.isOpen('other-id')).toBe(false);
    });
});
