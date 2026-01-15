import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrioritySortPreference } from '../../src/hooks/usePrioritySortPreference';

const STORAGE_KEY = 'restaurant-priority-sort-enabled';

describe('usePrioritySortPreference', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should default to false when no stored preference', () => {
    const { result } = renderHook(() => usePrioritySortPreference());
    const [isPrioritySortEnabled] = result.current;

    expect(isPrioritySortEnabled).toBe(false);
  });

  it('should initialize from stored preference', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    const { result } = renderHook(() => usePrioritySortPreference());
    const [isPrioritySortEnabled] = result.current;

    expect(isPrioritySortEnabled).toBe(true);
  });

  it('should toggle preference from false to true', () => {
    const { result } = renderHook(() => usePrioritySortPreference());

    act(() => {
      const [, togglePrioritySort] = result.current;
      togglePrioritySort();
    });

    const [isPrioritySortEnabled] = result.current;
    expect(isPrioritySortEnabled).toBe(true);
  });

  it('should toggle preference from true to false', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    const { result } = renderHook(() => usePrioritySortPreference());

    act(() => {
      const [, togglePrioritySort] = result.current;
      togglePrioritySort();
    });

    const [isPrioritySortEnabled] = result.current;
    expect(isPrioritySortEnabled).toBe(false);
  });

  it('should persist preference to localStorage on toggle', () => {
    const { result } = renderHook(() => usePrioritySortPreference());

    act(() => {
      const [, togglePrioritySort] = result.current;
      togglePrioritySort();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');

    act(() => {
      const [, togglePrioritySort] = result.current;
      togglePrioritySort();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
  });

  it('should maintain preference across hook instances', () => {
    const { result: result1 } = renderHook(() => usePrioritySortPreference());

    act(() => {
      const [, togglePrioritySort] = result1.current;
      togglePrioritySort();
    });

    // Create new instance of hook
    const { result: result2 } = renderHook(() => usePrioritySortPreference());
    const [isPrioritySortEnabled] = result2.current;

    expect(isPrioritySortEnabled).toBe(true);
  });

  it('should handle multiple toggles', () => {
    const { result } = renderHook(() => usePrioritySortPreference());

    // Toggle multiple times
    act(() => {
      const [, togglePrioritySort] = result.current;
      togglePrioritySort(); // false -> true
      togglePrioritySort(); // true -> false
      togglePrioritySort(); // false -> true
    });

    const [isPrioritySortEnabled] = result.current;
    expect(isPrioritySortEnabled).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('should handle invalid stored values gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-value');

    const { result } = renderHook(() => usePrioritySortPreference());
    const [isPrioritySortEnabled] = result.current;

    // Should default to false for invalid values
    expect(isPrioritySortEnabled).toBe(false);
  });
});
