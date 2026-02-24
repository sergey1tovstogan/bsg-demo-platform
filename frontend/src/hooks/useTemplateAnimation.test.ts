import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTemplateAnimation } from './useTemplateAnimation';

describe('useTemplateAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'fade-in' })
    );

    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
    expect(result.current.isAnimating).toBe(false);
    expect(result.current.trigger).toBeInstanceOf(Function);
  });

  it('should apply fade-in animation on trigger', () => {
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'fade-in', duration: 300 })
    );

    // Create a mock element
    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.trigger();
    });

    expect(result.current.isAnimating).toBe(true);
    expect(mockElement.style.opacity).toBe('0');
    expect(mockElement.style.transition).toContain('300ms');
    expect(mockElement.style.transition).toContain('ease-out');

    // Fast-forward time to complete animation
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(mockElement.style.opacity).toBe('1');

    // Wait for animation to complete
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isAnimating).toBe(false);
  });

  it('should apply slide-in-left animation correctly', async () => {
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'slide-in-left', duration: 300 })
    );

    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.trigger();
    });

    expect(mockElement.style.transform).toContain('translateX(-100px)');
    expect(mockElement.style.opacity).toBe('0');

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(mockElement.style.transform).toContain('translateX(0)');
    expect(mockElement.style.opacity).toBe('1');
  });

  it('should apply slide-in-right animation correctly', async () => {
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'slide-in-right', duration: 300 })
    );

    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.trigger();
    });

    expect(mockElement.style.transform).toContain('translateX(100px)');
    expect(mockElement.style.opacity).toBe('0');

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(mockElement.style.transform).toContain('translateX(0)');
    expect(mockElement.style.opacity).toBe('1');
  });

  it('should apply scale-in animation correctly', async () => {
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'scale-in', duration: 300 })
    );

    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.trigger();
    });

    expect(mockElement.style.transform).toContain('scale(0.8)');
    expect(mockElement.style.opacity).toBe('0');

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(mockElement.style.transform).toContain('scale(1)');
    expect(mockElement.style.opacity).toBe('1');
  });

  it('should handle stagger-fade-in with sequential items', async () => {
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'stagger-fade-in', duration: 300 })
    );

    const mockElement = document.createElement('div');
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    const child3 = document.createElement('div');
    mockElement.appendChild(child1);
    mockElement.appendChild(child2);
    mockElement.appendChild(child3);

    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.trigger();
    });

    // All children should start invisible
    expect(child1.style.opacity).toBe('0');
    expect(child2.style.opacity).toBe('0');
    expect(child3.style.opacity).toBe('0');

    // After a delay, children should be visible with stagger
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(child1.style.opacity).toBe('1');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(child2.style.opacity).toBe('1');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(child3.style.opacity).toBe('1');
  });

  it('should respect custom duration', () => {
    const customDuration = 500;
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'fade-in', duration: customDuration })
    );

    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.trigger();
    });

    expect(mockElement.style.transition).toContain(`${customDuration}ms`);

    act(() => {
      vi.advanceTimersByTime(customDuration);
    });

    expect(result.current.isAnimating).toBe(false);
  });

  it('should respect custom delay', () => {
    const customDelay = 200;
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'fade-in', delay: customDelay })
    );

    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.trigger();
    });

    // Animation should be marked as in progress even though not started yet
    expect(result.current.isAnimating).toBe(true);

    // Advance past the delay
    act(() => {
      vi.advanceTimersByTime(customDelay + 50);
    });

    // Now animation should have been applied
    expect(mockElement.style.opacity).toBe('1');
  });

  it('should respect custom easing', () => {
    const customEasing = 'ease-in-out';
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'fade-in', easing: customEasing })
    );

    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.trigger();
    });

    expect(mockElement.style.transition).toContain(customEasing);
  });

  it('should cleanup on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useTemplateAnimation({ type: 'fade-in' })
    );

    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.trigger();
    });

    expect(result.current.isAnimating).toBe(true);

    unmount();

    // Cleanup should have occurred (no memory leaks)
    expect(mockElement.style.transition).toBe('');
  });

  it('should handle trigger being called multiple times', () => {
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'fade-in', duration: 300 })
    );

    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.ref, 'current', {
      writable: true,
      value: mockElement,
    });

    // First trigger
    act(() => {
      result.current.trigger();
    });

    expect(result.current.isAnimating).toBe(true);

    // Second trigger while animating
    act(() => {
      result.current.trigger();
    });

    // Should restart animation
    expect(result.current.isAnimating).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isAnimating).toBe(false);
  });

  it('should handle element not being attached to ref', () => {
    const { result } = renderHook(() =>
      useTemplateAnimation({ type: 'fade-in' })
    );

    // Trigger without element attached
    act(() => {
      result.current.trigger();
    });

    // Should not throw error
    expect(result.current.isAnimating).toBe(false);
  });
});
