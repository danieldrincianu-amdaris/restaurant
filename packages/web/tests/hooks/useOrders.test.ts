import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrders } from '../../src/hooks/useOrders';
import * as api from '../../src/lib/api';
import { OrderStatus } from '@restaurant/shared';

vi.mock('../../src/lib/api');

describe('useOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    vi.mocked(api.api.get).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useOrders());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.orders).toEqual([]);
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should successfully fetch orders and return order list', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        tableNumber: 5,
        serverName: 'John',
        status: OrderStatus.PENDING,
        createdAt: '2026-01-14T10:00:00Z',
        updatedAt: '2026-01-14T10:00:00Z',
        items: [],
      },
      {
        id: 'order-2',
        tableNumber: 3,
        serverName: 'Maria',
        status: OrderStatus.IN_PROGRESS,
        createdAt: '2026-01-14T09:30:00Z',
        updatedAt: '2026-01-14T09:45:00Z',
        items: [],
      },
    ];

    vi.mocked(api.api.get).mockResolvedValue({ data: mockOrders, total: 2 });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.orders).toEqual(mockOrders);
    expect(result.current.error).toBe(null);
  });

  it('should set loading state to true during fetch', async () => {
    let resolvePromise: (value: { data: []; total: number }) => void;
    const promise = new Promise<{ data: []; total: number }>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(api.api.get).mockReturnValue(promise);

    const { result } = renderHook(() => useOrders());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({ data: [], total: 0 });
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle API errors and set error state', async () => {
    const errorMessage = 'Failed to fetch orders';
    vi.mocked(api.api.get).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.orders).toEqual([]);
  });

  it('should refetch orders when refresh is called', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        tableNumber: 5,
        serverName: 'John',
        status: OrderStatus.PENDING,
        createdAt: '2026-01-14T10:00:00Z',
        updatedAt: '2026-01-14T10:00:00Z',
        items: [],
      },
    ];

    vi.mocked(api.api.get).mockResolvedValue({ data: mockOrders, total: 1 });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.api.get).toHaveBeenCalledTimes(1);

    // Call refresh
    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('should apply status filter when provided', async () => {
    vi.mocked(api.api.get).mockResolvedValue({ data: [], total: 0 });

    renderHook(() => useOrders({ status: OrderStatus.PENDING }));

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith('/orders?status=PENDING');
    });
  });

  it('should apply tableNumber filter when provided', async () => {
    vi.mocked(api.api.get).mockResolvedValue({ data: [], total: 0 });

    renderHook(() => useOrders({ tableNumber: 5 }));

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith('/orders?tableNumber=5');
    });
  });

  it('should apply both filters when provided', async () => {
    vi.mocked(api.api.get).mockResolvedValue({ data: [], total: 0 });

    renderHook(() => useOrders({ status: OrderStatus.PENDING, tableNumber: 5 }));

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith('/orders?status=PENDING&tableNumber=5');
    });
  });
});
