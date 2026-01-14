import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUpdateOrder } from '../../src/hooks/useUpdateOrder';
import * as api from '../../src/lib/api';
import { Order, OrderStatus } from '@restaurant/shared';

// Mock the API module
vi.mock('../../src/lib/api', () => ({
  api: {
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useUpdateOrder', () => {
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

  it('should update order metadata', async () => {
    vi.mocked(api.api.put).mockResolvedValue({
      data: { ...mockOrder, tableNumber: 10, serverName: 'Bob' },
    });

    const { result } = renderHook(() => useUpdateOrder());

    expect(result.current.isUpdating).toBe(false);

    let updatePromise: Promise<Order | null>;
    act(() => {
      updatePromise = result.current.updateOrder('order-123', {
        tableNumber: 10,
        serverName: 'Bob',
      });
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    const updatedOrder = await updatePromise!;
    expect(updatedOrder?.tableNumber).toBe(10);
    expect(updatedOrder?.serverName).toBe('Bob');
    expect(api.api.put).toHaveBeenCalledWith('/orders/order-123', {
      tableNumber: 10,
      serverName: 'Bob',
    });
  });

  it('should handle update order error', async () => {
    const errorMessage = 'Failed to update order';
    vi.mocked(api.api.put).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUpdateOrder());

    await expect(async () => {
      await act(async () => {
        await result.current.updateOrder('order-123', {
          tableNumber: 10,
        });
      });
    }).rejects.toThrow(errorMessage);

    expect(api.api.put).toHaveBeenCalledWith('/orders/order-123', {
      tableNumber: 10,
    });
  });

  it('should add order item', async () => {
    const orderWithNewItem = {
      ...mockOrder,
      items: [
        {
          id: 'item-1',
          orderId: 'order-123',
          menuItemId: 'menu-1',
          quantity: 2,
          specialInstructions: 'No pickles',
          createdAt: '2024-01-15T10:00:00Z',
        },
      ],
    };

    vi.mocked(api.api.post).mockResolvedValue({ data: orderWithNewItem });

    const { result } = renderHook(() => useUpdateOrder());

    let orderPromise: Promise<Order | null>;
    act(() => {
      orderPromise = result.current.addOrderItem('order-123', {
        menuItemId: 'menu-1',
        quantity: 2,
        specialInstructions: 'No pickles',
      });
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    const order = await orderPromise!;
    expect(order?.items).toHaveLength(1);
    expect(order?.items[0]?.menuItemId).toBe('menu-1');
    expect(api.api.post).toHaveBeenCalledWith('/orders/order-123/items', {
      menuItemId: 'menu-1',
      quantity: 2,
      specialInstructions: 'No pickles',
    });
  });

  it('should update order item', async () => {
    const orderWithUpdatedItem = {
      ...mockOrder,
      items: [
        {
          id: 'item-1',
          orderId: 'order-123',
          menuItemId: 'menu-1',
          quantity: 3,
          specialInstructions: 'Extra cheese',
          createdAt: '2024-01-15T10:00:00Z',
        },
      ],
    };

    vi.mocked(api.api.put).mockResolvedValue({ data: orderWithUpdatedItem });

    const { result } = renderHook(() => useUpdateOrder());

    let orderPromise: Promise<Order | null>;
    act(() => {
      orderPromise = result.current.updateOrderItem('order-123', 'item-1', {
        quantity: 3,
        specialInstructions: 'Extra cheese',
      });
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    const order = await orderPromise!;
    expect(order?.items).toHaveLength(1);
    expect(order?.items[0]?.quantity).toBe(3);
    expect(order?.items[0]?.specialInstructions).toBe('Extra cheese');
    expect(api.api.put).toHaveBeenCalledWith('/orders/order-123/items/item-1', {
      quantity: 3,
      specialInstructions: 'Extra cheese',
    });
  });

  it('should remove order item', async () => {
    vi.mocked(api.api.delete).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useUpdateOrder());

    let deletePromise: Promise<Order | null>;
    act(() => {
      deletePromise = result.current.removeOrderItem('order-123', 'item-1');
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    await deletePromise!;
    expect(api.api.delete).toHaveBeenCalledWith('/orders/order-123/items/item-1');
  });

  it('should handle remove item error', async () => {
    const errorMessage = 'Failed to remove item';
    vi.mocked(api.api.delete).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUpdateOrder());

    await expect(async () => {
      await act(async () => {
        await result.current.removeOrderItem('order-123', 'item-1');
      });
    }).rejects.toThrow(errorMessage);

    expect(api.api.delete).toHaveBeenCalledWith('/orders/order-123/items/item-1');
  });
});
