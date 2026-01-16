import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDeleteOrder } from '../../src/hooks/useDeleteOrder';
import * as api from '../../src/lib/api';
import { Order, OrderStatus } from '@restaurant/shared';

// Mock the API module
vi.mock('../../src/lib/api', () => ({
  api: {
    delete: vi.fn(),
  },
}));

describe('useDeleteOrder', () => {
  const mockOrder: Order = {
    id: 'order-123',
    tableNumber: 5,
    serverName: 'Alice',
    status: OrderStatus.PENDING,
    items: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delete order successfully', async () => {
    vi.mocked(api.api.delete).mockResolvedValue({
      data: mockOrder,
    });

    const { result } = renderHook(() => useDeleteOrder());

    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBe(null);

    let deletePromise: Promise<Order | null>;
    act(() => {
      deletePromise = result.current.deleteOrder('order-123');
    });

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });

    const deletedOrder = await deletePromise!;
    expect(deletedOrder).toEqual(mockOrder);
    expect(api.api.delete).toHaveBeenCalledWith('/orders/order-123');
    expect(result.current.error).toBe(null);
  });

  it('should handle delete order error', async () => {
    const errorMessage = 'Failed to delete order';
    vi.mocked(api.api.delete).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDeleteOrder());

    let deletedOrder: Order | null = null;
    await act(async () => {
      deletedOrder = await result.current.deleteOrder('order-123');
    });

    expect(deletedOrder).toBe(null);
    expect(api.api.delete).toHaveBeenCalledWith('/orders/order-123');
    expect(result.current.error).toBe(errorMessage);
  });

  it('should set isDeleting to true during deletion', async () => {
    vi.mocked(api.api.delete).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: mockOrder }), 100)
        )
    );

    const { result } = renderHook(() => useDeleteOrder());

    expect(result.current.isDeleting).toBe(false);

    act(() => {
      result.current.deleteOrder('order-123');
    });

    // Should be deleting immediately after call
    expect(result.current.isDeleting).toBe(true);

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });
  });

  it('should clear error on subsequent delete', async () => {
    const errorMessage = 'Failed to delete order';
    vi.mocked(api.api.delete).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useDeleteOrder());

    // First call - should fail
    await act(async () => {
      await result.current.deleteOrder('order-123');
    });

    expect(result.current.error).toBe(errorMessage);

    // Second call - should succeed and clear error
    vi.mocked(api.api.delete).mockResolvedValueOnce({ data: mockOrder });

    await act(async () => {
      await result.current.deleteOrder('order-456');
    });

    expect(result.current.error).toBe(null);
  });

  it('should reset isDeleting even if error occurs', async () => {
    vi.mocked(api.api.delete).mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useDeleteOrder());

    await act(async () => {
      await result.current.deleteOrder('order-123');
    });

    expect(result.current.isDeleting).toBe(false);
  });
});
