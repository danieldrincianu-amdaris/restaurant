import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { formatElapsedTime, useElapsedTime } from '../../src/lib/timeUtils';

describe('timeUtils', () => {
  describe('formatElapsedTime', () => {
    it('returns "< 1 min" for times less than 1 minute ago', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000).toISOString();
      
      expect(formatElapsedTime(thirtySecondsAgo)).toBe('< 1 min');
    });

    it('returns "X min" for times between 1-59 minutes ago', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
      const fiftyNineMinutesAgo = new Date(now.getTime() - 59 * 60 * 1000).toISOString();
      
      expect(formatElapsedTime(fiveMinutesAgo)).toBe('5 min');
      expect(formatElapsedTime(thirtyMinutesAgo)).toBe('30 min');
      expect(formatElapsedTime(fiftyNineMinutesAgo)).toBe('59 min');
    });

    it('returns "Xh" for exactly X hours with no remaining minutes', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
      
      expect(formatElapsedTime(oneHourAgo)).toBe('1h');
      expect(formatElapsedTime(twoHoursAgo)).toBe('2h');
    });

    it('returns "Xh Ym" for times over 1 hour with remaining minutes', () => {
      const now = new Date();
      const oneHourTwentyThreeMinutesAgo = new Date(now.getTime() - (60 + 23) * 60 * 1000).toISOString();
      const twoHoursFifteenMinutesAgo = new Date(now.getTime() - (120 + 15) * 60 * 1000).toISOString();
      
      expect(formatElapsedTime(oneHourTwentyThreeMinutesAgo)).toBe('1h 23m');
      expect(formatElapsedTime(twoHoursFifteenMinutesAgo)).toBe('2h 15m');
    });

    it('handles edge case of just now (0 elapsed time)', () => {
      const now = new Date().toISOString();
      
      expect(formatElapsedTime(now)).toBe('< 1 min');
    });
  });

  describe('useElapsedTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns initial elapsed time immediately', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { result } = renderHook(() => useElapsedTime(fiveMinutesAgo));
      
      expect(result.current).toBe('5 min');
    });

    it('updates elapsed time after 1 minute', () => {
      const now = Date.now();
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString();
      
      const { result } = renderHook(() => useElapsedTime(fiveMinutesAgo));
      
      expect(result.current).toBe('5 min');
      
      // Advance time by 1 minute
      act(() => {
        vi.advanceTimersByTime(60000);
      });
      
      expect(result.current).toBe('6 min');
    });

    it('updates elapsed time multiple times', () => {
      const now = Date.now();
      const tenMinutesAgo = new Date(now - 10 * 60 * 1000).toISOString();
      
      const { result } = renderHook(() => useElapsedTime(tenMinutesAgo));
      
      expect(result.current).toBe('10 min');
      
      // Advance time by 3 minutes
      act(() => {
        vi.advanceTimersByTime(3 * 60000);
      });
      
      expect(result.current).toBe('13 min');
      
      // Advance another 47 minutes (total 60 minutes = 1 hour)
      act(() => {
        vi.advanceTimersByTime(47 * 60000);
      });
      
      expect(result.current).toBe('1h');
    });

    it('cleans up interval on unmount', () => {
      vi.useFakeTimers();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { unmount } = renderHook(() => useElapsedTime(fiveMinutesAgo));
      
      // Just verify unmount doesn't throw errors
      expect(() => unmount()).not.toThrow();
      vi.useRealTimers();
    });

    it('updates when createdAt prop changes', () => {
      const now = Date.now();
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString();
      const tenMinutesAgo = new Date(now - 10 * 60 * 1000).toISOString();
      
      const { result, rerender } = renderHook(
        ({ createdAt }) => useElapsedTime(createdAt),
        { initialProps: { createdAt: fiveMinutesAgo } }
      );
      
      expect(result.current).toBe('5 min');
      
      // Change the createdAt prop
      rerender({ createdAt: tenMinutesAgo });
      
      expect(result.current).toBe('10 min');
    });
  });
});
