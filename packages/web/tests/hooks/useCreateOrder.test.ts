import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCreateOrder } from '../../src/hooks/useCreateOrder';
import * as api from '../../src/lib/api';

vi.mock('../../src/lib/api');

describe('useCreateOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useCreateOrder());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.createOrder).toBe('function');
  });

  it('should successfully create order and return order data', async () => {
    const mockOrder = {
      id: 'order-123',
      tableNumber: 5,
      serverName: 'John',
      status: 'PENDING' as const,
      createdAt: '2026-01-14T10:00:00Z',
      updatedAt: '2026-01-14T10:00:00Z',
      items: [],
    };

    vi.mocked(api.api.post).mockResolvedValue({ data: mockOrder });

    const { result } = renderHook(() => useCreateOrder());

    let returnedOrder;
    await act(async () => {
      returnedOrder = await result.current.createOrder({
        tableNumber: 5,
        serverName: 'John',
        items: [{ menuItemId: 'item-1', quantity: 2 }],
      });
    });

    expect(returnedOrder).toEqual(mockOrder);
    expect(result.current.error).toBe(null);
  });

  it('should set isSubmitting to true during submission', async () => {
    const mockOrder = {
      id: 'order-123',
      tableNumber: 5,
      serverName: 'John',
      status: 'PENDING' as const,
      createdAt: '2026-01-14T10:00:00Z',
      updatedAt: '2026-01-14T10:00:00Z',
      items: [],
    };

    let resolvePromise: (value: { data: typeof mockOrder }) => void;
    const promise = new Promise<{ data: typeof mockOrder }>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(api.api.post).mockReturnValue(promise);

    const { result } = renderHook(() => useCreateOrder());

    act(() => {
      result.current.createOrder({
        tableNumber: 5,
        serverName: 'John',
        items: [],
      });
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolvePromise!({ data: mockOrder });
      await promise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle API errors and set error state', async () => {
    const errorMessage = 'Failed to create order';
    vi.mocked(api.api.post).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCreateOrder());

    await act(async () => {
      try {
        await result.current.createOrder({
          tableNumber: 5,
          serverName: 'John',
          items: [],
        });
      } catch (err) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  it('should call API with proper payload format', async () => {
    const mockOrder = {
      id: 'order-123',
      tableNumber: 5,
      serverName: 'John',
      status: 'PENDING' as const,
      createdAt: '2026-01-14T10:00:00Z',
      updatedAt: '2026-01-14T10:00:00Z',
      items: [],
    };

    vi.mocked(api.api.post).mockResolvedValue({ data: mockOrder });

    const { result } = renderHook(() => useCreateOrder());

    const input = {
      tableNumber: 5,
      serverName: 'John',
      items: [
        { menuItemId: 'item-1', quantity: 2, specialInstructions: 'No onions' },
        { menuItemId: 'item-2', quantity: 1 },
      ],
    };

    await act(async () => {
      await result.current.createOrder(input);
    });

    expect(api.api.post).toHaveBeenCalledWith('/orders', input);
  });

  it('should clear error state on new submission', async () => {
    // First call fails
    vi.mocked(api.api.post).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCreateOrder());

    await act(async () => {
      try {
        await result.current.createOrder({
          tableNumber: 5,
          serverName: 'John',
          items: [],
        });
      } catch (err) {
        // Expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Second call succeeds
    const mockOrder = {
      id: 'order-123',
      tableNumber: 5,
      serverName: 'John',
      status: 'PENDING' as const,
      createdAt: '2026-01-14T10:00:00Z',
      updatedAt: '2026-01-14T10:00:00Z',
      items: [],
    };

    vi.mocked(api.api.post).mockResolvedValue({ data: mockOrder });

    await act(async () => {
      await result.current.createOrder({
        tableNumber: 5,
        serverName: 'John',
        items: [],
      });
    });

    expect(result.current.error).toBe(null);
  });
});
