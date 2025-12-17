import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClickAction } from './useClickAction';
import { ClickAction } from '@/lib/template-types';
import * as NavigationProvider from '@/components/template-navigation/NavigationProvider';

// Create mock functions
const mockNavigate = vi.fn();
const mockShowPopup = vi.fn();

// Mock useNavigation
vi.mock('@/components/template-navigation/NavigationProvider', () => ({
  useNavigation: vi.fn(() => ({
    navigateToPage: mockNavigate,
    showPopup: mockShowPopup,
  })),
}));

describe('useClickAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a function', () => {
    const action: ClickAction = {
      type: 'navigate_to_subpage',
      target: 'page-1'
    };
    const { result } = renderHook(() => useClickAction(action));
    expect(typeof result.current).toBe('function');
  });

  it('should handle navigate_to_subpage action', () => {
    const action: ClickAction = {
      type: 'navigate_to_subpage',
      target: 'page-1'
    };

    const { result } = renderHook(() => useClickAction(action));
    result.current();

    expect(mockNavigate).toHaveBeenCalledWith('page-1');
  });

  it('should handle show_popup action', () => {
    const action: ClickAction = {
      type: 'show_popup',
      popup_id: 'popup-1'
    };

    const { result } = renderHook(() => useClickAction(action));
    result.current();

    expect(mockShowPopup).toHaveBeenCalledWith('popup-1');
  });

  it('should handle external_link action in new tab', () => {
    const mockOpen = vi.fn();
    window.open = mockOpen;

    const action: ClickAction = {
      type: 'external_link',
      target: 'https://example.com',
      open_in_new_tab: true
    };

    const { result } = renderHook(() => useClickAction(action));
    result.current();

    expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });

  it('should do nothing when action is undefined', () => {
    const { result } = renderHook(() => useClickAction(undefined));
    expect(() => result.current()).not.toThrow();
  });
});
