import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrder } from '../../src/hooks/useOrder';
import * as api from '../../src/lib/api';
import { Order, OrderStatus, Category, FoodType } from '@restaurant/shared';

// Mock the API module
vi.mock('../../src/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('useOrder', () => {
  const mockOrder: Order = {
    id: 'order-123',
    tableNumber: 5,
    serverName: 'Alice',
    status: OrderStatus.PENDING,
    items: [
      {
        id: 'item-1',
        orderId: 'order-123',
        menuItemId: 'menu-1',
        quantity: 2,
        specialInstructions: 'No pickles',
        createdAt: '2024-01-15T10:00:00Z',
        menuItem: {
          id: 'menu-1',
          name: 'Cheeseburger',
          price: 12.99,
          ingredients: ['beef', 'cheese', 'lettuce'],
          foodType: FoodType.MEAT,
          category: Category.MAIN,
          imageUrl: null,
          available: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch order on mount', async () => {
    vi.mocked(api.api.get).mockResolvedValue({ data: mockOrder });

    const { result } = renderHook(() => useOrder('order-123'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.order).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.order).toEqual(mockOrder);
    expect(result.current.error).toBeNull();
    expect(api.api.get).toHaveBeenCalledWith('/orders/order-123');
    expect(api.api.get).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Order not found';
    vi.mocked(api.api.get).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useOrder('order-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.order).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(api.api.get).toHaveBeenCalledWith('/orders/order-123');
  });

  it('should not fetch when orderId is undefined', async () => {
    const { result } = renderHook(() => useOrder(undefined));

    // Should not be loading and should not call API
    expect(result.current.isLoading).toBe(false);
    expect(result.current.order).toBeNull();
    expect(result.current.error).toBeNull();
    expect(api.api.get).not.toHaveBeenCalled();
  });

  it('should support manual refetch', async () => {
    vi.mocked(api.api.get).mockResolvedValue({ data: mockOrder });

    const { result } = renderHook(() => useOrder('order-123'));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.order).toEqual(mockOrder);
    expect(api.api.get).toHaveBeenCalledTimes(1);

    // Update mock to return different data
    const updatedOrder = {
      ...mockOrder,
      tableNumber: 10,
    };
    vi.mocked(api.api.get).mockResolvedValue({ data: updatedOrder });

    // Trigger refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.order).toEqual(updatedOrder);
    });

    expect(api.api.get).toHaveBeenCalledTimes(2);
    expect(api.api.get).toHaveBeenCalledWith('/orders/order-123');
  });
});
