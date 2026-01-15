import { useCallback, useRef, useEffect } from 'react';

interface BatchedUpdate<T> {
  payload: T;
  timestamp: number;
}

interface UseBatchedUpdatesOptions<T> {
  /** Callback to execute with batched updates */
  onFlush: (payloads: T[]) => void;
  
  /** Time window in milliseconds to batch updates (default: 100ms) */
  windowMs?: number;
  
  /** Maximum batch size before forcing flush (default: 50) */
  maxBatchSize?: number;
}

/**
 * Custom hook for batching rapid updates within a time window
 * 
 * Useful for batching WebSocket events or other rapid updates to reduce
 * re-renders and improve performance.
 * 
 * @param options - Configuration for batching behavior
 * @returns Object with addUpdate function to queue updates
 * 
 * @example
 * ```tsx
 * const { addUpdate } = useBatchedUpdates({
 *   onFlush: (orders) => {
 *     setOrders(prev => {
 *       const updated = new Map(prev.map(o => [o.id, o]));
 *       orders.forEach(order => updated.set(order.id, order));
 *       return Array.from(updated.values());
 *     });
 *   },
 *   windowMs: 100,
 * });
 * 
 * // In WebSocket handler
 * socket.on('order:updated', (order) => {
 *   addUpdate(order);
 * });
 * ```
 */
export function useBatchedUpdates<T>({
  onFlush,
  windowMs = 100,
  maxBatchSize = 50,
}: UseBatchedUpdatesOptions<T>) {
  const batchRef = useRef<BatchedUpdate<T>[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onFlushRef = useRef(onFlush);

  // Keep onFlush ref up to date
  useEffect(() => {
    onFlushRef.current = onFlush;
  }, [onFlush]);

  // Flush function
  const flush = useCallback(() => {
    if (batchRef.current.length === 0) return;

    // Extract payloads and sort by timestamp to maintain order
    const payloads = batchRef.current
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((update) => update.payload);

    // Clear batch
    batchRef.current = [];

    // Clear timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Execute flush callback
    onFlushRef.current(payloads);
  }, []);

  // Add update to batch
  const addUpdate = useCallback(
    (payload: T) => {
      // Add to batch with timestamp
      batchRef.current.push({
        payload,
        timestamp: Date.now(),
      });

      // If batch reaches max size, flush immediately
      if (batchRef.current.length >= maxBatchSize) {
        flush();
        return;
      }

      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer to flush after window
      timerRef.current = setTimeout(() => {
        flush();
      }, windowMs);
    },
    [flush, windowMs, maxBatchSize]
  );

  // Cleanup on unmount - flush any pending updates
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Flush any remaining updates
      if (batchRef.current.length > 0) {
        const payloads = batchRef.current
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((update) => update.payload);
        onFlushRef.current(payloads);
      }
    };
  }, []);

  return {
    addUpdate,
    flush,
    /** Get current batch size (useful for debugging/testing) */
    getBatchSize: () => batchRef.current.length,
  };
}
