// Tests for useOrderEvents hook

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOrderEvents } from '../../src/hooks/useOrderEvents';
import { SOCKET_EVENTS, Order, OrderStatus } from '@restaurant/shared';

// Type for socket event handlers
type EventHandler = (payload: unknown) => void;

// Mock socket and subscription functions
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

const mockSubscribeToKitchen = vi.fn();
const mockUnsubscribeFromKitchen = vi.fn();
const mockSubscribeToOrders = vi.fn();
const mockUnsubscribeFromOrders = vi.fn();

vi.mock('../../src/lib/socket', () => ({
  getSocket: vi.fn(() => mockSocket),
  subscribeToKitchen: () => mockSubscribeToKitchen(),
  unsubscribeFromKitchen: () => mockUnsubscribeFromKitchen(),
  subscribeToOrders: () => mockSubscribeToOrders(),
  unsubscribeFromOrders: () => mockUnsubscribeFromOrders(),
}));

describe('useOrderEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to kitchen room when room is "kitchen"', () => {
    renderHook(() => useOrderEvents({ room: 'kitchen' }));

    expect(mockSubscribeToKitchen).toHaveBeenCalled();
    expect(mockSubscribeToOrders).not.toHaveBeenCalled();
  });

  it('should subscribe to orders room when room is "orders"', () => {
    renderHook(() => useOrderEvents({ room: 'orders' }));

    expect(mockSubscribeToOrders).toHaveBeenCalled();
    expect(mockSubscribeToKitchen).not.toHaveBeenCalled();
  });

  it('should register all 7 order event listeners on mount', () => {
    renderHook(() => useOrderEvents({ room: 'kitchen' }));

    expect(mockSocket.on).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_CREATED, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_UPDATED, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_DELETED, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_STATUS_CHANGED, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_ITEM_ADDED, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_ITEM_UPDATED, expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_ITEM_REMOVED, expect.any(Function));
  });

  it('should call onCreate callback when ORDER_CREATED event received', () => {
    const onCreate = vi.fn();
    let createdHandler: EventHandler | undefined;

    mockSocket.on.mockImplementation((event, handler) => {
      if (event === SOCKET_EVENTS.ORDER_CREATED) {
        createdHandler = handler as EventHandler;
      }
    });

    renderHook(() => useOrderEvents({ room: 'kitchen', onCreate }));

    const mockOrder: Order = {
      id: 'order-1',
      tableNumber: 5,
      serverName: 'Alice',
      status: OrderStatus.PENDING,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Trigger the event
    if (createdHandler) {
      createdHandler({ order: mockOrder });
    }

    expect(onCreate).toHaveBeenCalledWith({ order: mockOrder });
  });

  it('should call onStatusChange callback when ORDER_STATUS_CHANGED event received', () => {
    const onStatusChange = vi.fn();
    let statusHandler: EventHandler | undefined;

    mockSocket.on.mockImplementation((event, handler) => {
      if (event === SOCKET_EVENTS.ORDER_STATUS_CHANGED) {
        statusHandler = handler as EventHandler;
      }
    });

    renderHook(() => useOrderEvents({ room: 'kitchen', onStatusChange }));

    const payload = {
      orderId: 'order-1',
      previousStatus: OrderStatus.PENDING,
      newStatus: OrderStatus.IN_PROGRESS,
      updatedAt: new Date().toISOString(),
    };

    // Trigger the event
    if (statusHandler) {
      statusHandler(payload);
    }

    expect(onStatusChange).toHaveBeenCalledWith(payload);
  });

  it('should call onDelete callback when ORDER_DELETED event received', () => {
    const onDelete = vi.fn();
    let deleteHandler: EventHandler | undefined;

    mockSocket.on.mockImplementation((event, handler) => {
      if (event === SOCKET_EVENTS.ORDER_DELETED) {
        deleteHandler = handler as EventHandler;
      }
    });

    renderHook(() => useOrderEvents({ room: 'kitchen', onDelete }));

    const payload = { orderId: 'order-1' };

    // Trigger the event
    if (deleteHandler) {
      deleteHandler(payload);
    }

    expect(onDelete).toHaveBeenCalledWith(payload);
  });

  it('should call onItemAdded callback when ORDER_ITEM_ADDED event received', () => {
    const onItemAdded = vi.fn();
    let itemAddedHandler: EventHandler | undefined;

    mockSocket.on.mockImplementation((event, handler) => {
      if (event === SOCKET_EVENTS.ORDER_ITEM_ADDED) {
        itemAddedHandler = handler as EventHandler;
      }
    });

    renderHook(() => useOrderEvents({ room: 'kitchen', onItemAdded }));

    const payload = {
      orderId: 'order-1',
      item: {
        id: 'item-1',
        orderId: 'order-1',
        menuItemId: 'menu-1',
        quantity: 2,
        specialInstructions: 'No onions',
        createdAt: new Date().toISOString(),
      },
    };

    // Trigger the event
    if (itemAddedHandler) {
      itemAddedHandler(payload);
    }

    expect(onItemAdded).toHaveBeenCalledWith(payload);
  });

  it('should not call callbacks if they are not provided', () => {
    let createdHandler: EventHandler | undefined;

    mockSocket.on.mockImplementation((event, handler) => {
      if (event === SOCKET_EVENTS.ORDER_CREATED) {
        createdHandler = handler as EventHandler;
      }
    });

    // No callbacks provided
    renderHook(() => useOrderEvents({ room: 'kitchen' }));

    // Trigger event - should not throw
    expect(() => {
      if (createdHandler) {
        createdHandler({ order: {} });
      }
    }).not.toThrow();
  });

  it('should unsubscribe from kitchen room on unmount', () => {
    const { unmount } = renderHook(() => useOrderEvents({ room: 'kitchen' }));

    vi.clearAllMocks();

    unmount();

    expect(mockUnsubscribeFromKitchen).toHaveBeenCalled();
  });

  it('should unsubscribe from orders room on unmount', () => {
    const { unmount } = renderHook(() => useOrderEvents({ room: 'orders' }));

    vi.clearAllMocks();

    unmount();

    expect(mockUnsubscribeFromOrders).toHaveBeenCalled();
  });

  it('should remove all event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOrderEvents({ room: 'kitchen' }));

    vi.clearAllMocks();

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_CREATED, expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_UPDATED, expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_DELETED, expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_STATUS_CHANGED, expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_ITEM_ADDED, expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_ITEM_UPDATED, expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(SOCKET_EVENTS.ORDER_ITEM_REMOVED, expect.any(Function));
  });

  it('should handle callback changes without re-subscribing', () => {
    const onCreate1 = vi.fn();
    const onCreate2 = vi.fn();

    const { rerender } = renderHook(
      ({ onCreate }) => useOrderEvents({ room: 'kitchen', onCreate }),
      { initialProps: { onCreate: onCreate1 } }
    );

    const initialSubscribeCalls = mockSubscribeToKitchen.mock.calls.length;

    // Change callback
    rerender({ onCreate: onCreate2 });

    // Should not re-subscribe
    expect(mockSubscribeToKitchen).toHaveBeenCalledTimes(initialSubscribeCalls);
  });
});
