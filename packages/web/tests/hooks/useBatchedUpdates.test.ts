import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBatchedUpdates } from '../../src/hooks/useBatchedUpdates';

describe('useBatchedUpdates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('batches multiple updates within time window', () => {
    const onFlush = vi.fn();
    const { result } = renderHook(() =>
      useBatchedUpdates({
        onFlush,
        windowMs: 100,
      })
    );

    // Add multiple updates rapidly
    act(() => {
      result.current.addUpdate({ id: 1, value: 'a' });
      result.current.addUpdate({ id: 2, value: 'b' });
      result.current.addUpdate({ id: 3, value: 'c' });
    });

    // Should not have flushed yet
    expect(onFlush).not.toHaveBeenCalled();
    expect(result.current.getBatchSize()).toBe(3);

    // Fast-forward past window
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should have flushed all updates
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 3, value: 'c' },
    ]);
    expect(result.current.getBatchSize()).toBe(0);
  });

  it('resets timer on each new update', () => {
    const onFlush = vi.fn();
    const { result } = renderHook(() =>
      useBatchedUpdates({
        onFlush,
        windowMs: 100,
      })
    );

    // Add first update
    act(() => {
      result.current.addUpdate({ id: 1 });
    });

    // Advance 50ms
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Add second update (resets timer)
    act(() => {
      result.current.addUpdate({ id: 2 });
    });

    // Advance another 50ms (total 100ms from first update, but only 50ms from second)
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Should not have flushed yet (timer was reset)
    expect(onFlush).not.toHaveBeenCalled();

    // Advance final 50ms
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Now should have flushed
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  it('flushes immediately when max batch size reached', () => {
    const onFlush = vi.fn();
    const { result } = renderHook(() =>
      useBatchedUpdates({
        onFlush,
        windowMs: 100,
        maxBatchSize: 3,
      })
    );

    // Add updates up to max batch size
    act(() => {
      result.current.addUpdate({ id: 1 });
      result.current.addUpdate({ id: 2 });
      result.current.addUpdate({ id: 3 }); // This triggers immediate flush
    });

    // Should have flushed immediately without waiting for timer
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(result.current.getBatchSize()).toBe(0);
  });

  it('maintains update order based on timestamp', () => {
    const onFlush = vi.fn();
    const { result } = renderHook(() =>
      useBatchedUpdates({
        onFlush,
        windowMs: 100,
      })
    );

    // Add updates in specific order
    act(() => {
      result.current.addUpdate({ id: 3, timestamp: 300 });
      result.current.addUpdate({ id: 1, timestamp: 100 });
      result.current.addUpdate({ id: 2, timestamp: 200 });
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should be sorted by timestamp
    expect(onFlush).toHaveBeenCalledWith([
      { id: 3, timestamp: 300 },
      { id: 1, timestamp: 100 },
      { id: 2, timestamp: 200 },
    ]);
  });

  it('allows manual flush', () => {
    const onFlush = vi.fn();
    const { result } = renderHook(() =>
      useBatchedUpdates({
        onFlush,
        windowMs: 100,
      })
    );

    // Add updates
    act(() => {
      result.current.addUpdate({ id: 1 });
      result.current.addUpdate({ id: 2 });
    });

    // Manually flush before timer expires
    act(() => {
      result.current.flush();
    });

    // Should have flushed immediately
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    expect(result.current.getBatchSize()).toBe(0);

    // Timer should be cleared - advancing time should not trigger another flush
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onFlush).toHaveBeenCalledTimes(1); // Still only called once
  });

  it('flushes pending updates on unmount', () => {
    const onFlush = vi.fn();
    const { result, unmount } = renderHook(() =>
      useBatchedUpdates({
        onFlush,
        windowMs: 100,
      })
    );

    // Add updates
    act(() => {
      result.current.addUpdate({ id: 1 });
      result.current.addUpdate({ id: 2 });
    });

    // Unmount before timer expires
    unmount();

    // Should have flushed on unmount
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  it('handles empty flush gracefully', () => {
    const onFlush = vi.fn();
    const { result } = renderHook(() =>
      useBatchedUpdates({
        onFlush,
        windowMs: 100,
      })
    );

    // Try to flush with no updates
    act(() => {
      result.current.flush();
    });

    // Should not call onFlush with empty array
    expect(onFlush).not.toHaveBeenCalled();
  });

  it('handles rapid successive batches', () => {
    const onFlush = vi.fn();
    const { result } = renderHook(() =>
      useBatchedUpdates({
        onFlush,
        windowMs: 100,
      })
    );

    // First batch
    act(() => {
      result.current.addUpdate({ id: 1 });
      result.current.addUpdate({ id: 2 });
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenLastCalledWith([{ id: 1 }, { id: 2 }]);

    // Second batch
    act(() => {
      result.current.addUpdate({ id: 3 });
      result.current.addUpdate({ id: 4 });
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onFlush).toHaveBeenCalledTimes(2);
    expect(onFlush).toHaveBeenLastCalledWith([{ id: 3 }, { id: 4 }]);
  });

  it('respects custom window time', () => {
    const onFlush = vi.fn();
    const { result } = renderHook(() =>
      useBatchedUpdates({
        onFlush,
        windowMs: 250, // Custom 250ms window
      })
    );

    act(() => {
      result.current.addUpdate({ id: 1 });
    });

    // Advance 100ms - should not flush
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onFlush).not.toHaveBeenCalled();

    // Advance another 100ms (200ms total) - should not flush
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onFlush).not.toHaveBeenCalled();

    // Advance final 50ms (250ms total) - should flush
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(onFlush).toHaveBeenCalledTimes(1);
  });

  it('batches different data types', () => {
    const onFlush = vi.fn();
    
    interface OrderUpdate {
      orderId: number;
      status: string;
      timestamp: string;
    }
    
    const { result } = renderHook(() =>
      useBatchedUpdates<OrderUpdate>({
        onFlush,
        windowMs: 100,
      })
    );

    act(() => {
      result.current.addUpdate({ orderId: 1, status: 'pending', timestamp: '2026-01-15T10:00:00Z' });
      result.current.addUpdate({ orderId: 2, status: 'completed', timestamp: '2026-01-15T10:00:01Z' });
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onFlush).toHaveBeenCalledWith([
      { orderId: 1, status: 'pending', timestamp: '2026-01-15T10:00:00Z' },
      { orderId: 2, status: 'completed', timestamp: '2026-01-15T10:00:01Z' },
    ]);
  });
});
