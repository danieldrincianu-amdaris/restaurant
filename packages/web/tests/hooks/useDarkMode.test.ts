import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../../src/hooks/useDarkMode';

const STORAGE_KEY = 'kitchen-dark-mode';

describe('useDarkMode', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>;
  let setItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Clear localStorage and DOM class
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    
    // Spy on localStorage methods
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with light mode by default', () => {
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('initializes with dark mode when localStorage has "true"', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles to dark mode and persists to localStorage', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, 'true');
  });

  it('toggles back to light mode', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDarkMode).toBe(true);
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, 'false');
  });

  it('applies dark class to document.documentElement', () => {
    const { result } = renderHook(() => useDarkMode());
    
    // Initially light
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Toggle to dark
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when toggling to light mode', () => {
    const { result } = renderHook(() => useDarkMode());
    
    // Toggle to dark
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Toggle back to light
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists state across multiple toggles', () => {
    const { result } = renderHook(() => useDarkMode());
    
    // Toggle dark
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    
    // Toggle light
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
    
    // Toggle dark again
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('loads persisted dark mode preference on mount', () => {
    // Set preference in localStorage
    localStorage.setItem(STORAGE_KEY, 'true');
    
    // Mount hook
    const { result } = renderHook(() => useDarkMode());
    
    // Should initialize with dark mode enabled
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY);
  });
});
