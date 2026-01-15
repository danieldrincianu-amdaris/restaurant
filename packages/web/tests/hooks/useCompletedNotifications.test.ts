import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCompletedNotifications } from '../../src/hooks/useCompletedNotifications';

describe('useCompletedNotifications', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should default to enabled when no value in localStorage', () => {
    const { result } = renderHook(() => useCompletedNotifications());
    
    expect(result.current[0]).toBe(true);
  });

  it('should read initial value from localStorage', () => {
    localStorage.setItem('staff-completed-notifications', 'false');
    
    const { result } = renderHook(() => useCompletedNotifications());
    
    expect(result.current[0]).toBe(false);
  });

  it('should toggle enabled state', () => {
    const { result } = renderHook(() => useCompletedNotifications());
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      result.current[1](); // Call toggle function
    });
    
    expect(result.current[0]).toBe(false);
  });

  it('should persist enabled state to localStorage', () => {
    const { result } = renderHook(() => useCompletedNotifications());
    
    act(() => {
      result.current[1](); // Toggle to false
    });
    
    expect(localStorage.getItem('staff-completed-notifications')).toBe('false');
  });

  it('should toggle multiple times', () => {
    const { result } = renderHook(() => useCompletedNotifications());
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      result.current[1](); // Toggle to false
    });
    
    expect(result.current[0]).toBe(false);
    
    act(() => {
      result.current[1](); // Toggle back to true
    });
    
    expect(result.current[0]).toBe(true);
  });

  it('should persist across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useCompletedNotifications());
    
    act(() => {
      result1.current[1](); // Toggle to false
    });
    
    // Create new hook instance
    const { result: result2 } = renderHook(() => useCompletedNotifications());
    
    expect(result2.current[0]).toBe(false);
  });
});
