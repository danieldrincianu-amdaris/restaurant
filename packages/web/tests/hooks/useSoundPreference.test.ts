import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundPreference } from '../../src/hooks/useSoundPreference';

describe('useSoundPreference', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with unmuted state by default', () => {
    const { result } = renderHook(() => useSoundPreference());

    expect(result.current.isMuted).toBe(false);
  });

  it('should initialize with stored muted state', () => {
    localStorage.setItem('kitchen.soundMuted', 'true');

    const { result } = renderHook(() => useSoundPreference());

    expect(result.current.isMuted).toBe(true);
  });

  it('should initialize with stored unmuted state', () => {
    localStorage.setItem('kitchen.soundMuted', 'false');

    const { result } = renderHook(() => useSoundPreference());

    expect(result.current.isMuted).toBe(false);
  });

  it('should toggle mute state', () => {
    const { result } = renderHook(() => useSoundPreference());

    expect(result.current.isMuted).toBe(false);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
  });

  it('should persist mute state to localStorage', () => {
    const { result } = renderHook(() => useSoundPreference());

    act(() => {
      result.current.toggleMute();
    });

    expect(localStorage.getItem('kitchen.soundMuted')).toBe('true');

    act(() => {
      result.current.toggleMute();
    });

    expect(localStorage.getItem('kitchen.soundMuted')).toBe('false');
  });

  it('should maintain state across hook re-renders', () => {
    const { result, rerender } = renderHook(() => useSoundPreference());

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);

    rerender();

    expect(result.current.isMuted).toBe(true);
  });

  it('should share state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useSoundPreference());
    
    act(() => {
      result1.current.toggleMute();
    });

    // Create new hook instance - should read from localStorage
    const { result: result2 } = renderHook(() => useSoundPreference());

    expect(result2.current.isMuted).toBe(true);
  });
});
