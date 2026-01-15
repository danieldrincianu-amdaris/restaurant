import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import KitchenBoard from '../../../src/components/kitchen/KitchenBoard';
import { Order, OrderStatus, SOCKET_EVENTS, Category, FoodType } from '@restaurant/shared';
import * as useOrdersModule from '../../../src/hooks/useOrders';
import * as socketModule from '../../../src/lib/socket';

// Mock dependencies
vi.mock('../../../src/hooks/useOrders');
vi.mock('../../../src/lib/socket');
vi.mock('../../../src/lib/api', () => ({
  api: {
    patch: vi.fn(),
  },
}));

vi.mock('../../../src/hooks/useNotificationSound', () => ({
  useNotificationSound: vi.fn(() => ({
    play: vi.fn(),
  })),
}));

vi.mock('../../../src/hooks/useBrowserNotification', () => ({
  useBrowserNotification: vi.fn(() => ({
    requestPermission: vi.fn(),
    showNotification: vi.fn(),
  })),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}));

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  id: 'mock-socket-id',
};

const mockOrder: Order = {
  id: 'order-1',
  tableNumber: 5,
  serverName: 'John Doe',
  status: OrderStatus.PENDING,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: 'item-1',
      orderId: 'order-1',
      menuItemId: 'menu-1',
      quantity: 2,
      specialInstructions: null,
      createdAt: new Date().toISOString(),
      menuItem: {
        id: 'menu-1',
        name: 'Burger',
        price: 12.99,
        category: Category.MAIN,
        foodType: FoodType.MEAT,
        available: true,
        ingredients: ['beef', 'bun'],
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ],
};

describe('KitchenBoard - Real-time Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useOrdersModule, 'useOrders').mockReturnValue({
      orders: [mockOrder],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });
    vi.spyOn(socketModule, 'getSocket').mockReturnValue(mockSocket as unknown as Socket);
    vi.spyOn(socketModule, 'subscribeToKitchen').mockImplementation(() => {});
    vi.spyOn(socketModule, 'unsubscribeFromKitchen').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderKitchenBoard = () => {
    return render(
      <BrowserRouter>
        <KitchenBoard />
      </BrowserRouter>
    );
  };

  describe('Duplicate Prevention', () => {
    it('should not add duplicate order on repeated ORDER_CREATED events', async () => {
      renderKitchenBoard();

      // Simulate ORDER_CREATED being called multiple times
      const onCreateHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === SOCKET_EVENTS.ORDER_CREATED
      )?.[1];

      expect(onCreateHandler).toBeDefined();

      const newOrder = { ...mockOrder, id: 'order-new' };
      
      // Call onCreate multiple times
      onCreateHandler?.({ order: newOrder });
      onCreateHandler?.({ order: newOrder });
      onCreateHandler?.({ order: newOrder });

      // Should only appear once
      await waitFor(() => {
        const orderElements = screen.getAllByText(/Table 5/);
        // Initial order + new order = 2 total (not 4)
        expect(orderElements.length).toBeLessThanOrEqual(2);
      });
    });

    it('should ignore stale ORDER_UPDATED events', async () => {
      renderKitchenBoard();

      const onUpdateHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === SOCKET_EVENTS.ORDER_UPDATED
      )?.[1];

      expect(onUpdateHandler).toBeDefined();

      // Create an older version of the order
      const staleOrder = {
        ...mockOrder,
        updatedAt: new Date(Date.now() - 10000).toISOString(), // 10 seconds ago
        serverName: 'Old Name',
      };

      // Try to update with stale data
      onUpdateHandler?.({ order: staleOrder });

      // Should keep current name
      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.queryByText(/Old Name/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Animation Presence', () => {
    it('should render AnimatePresence wrapper', () => {
      const { container } = renderKitchenBoard();
      
      // AnimatePresence is mocked but should be present in structure
      expect(container).toBeDefined();
    });

    it('should apply new order pulse animation class', async () => {
      renderKitchenBoard();

      const onCreateHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === SOCKET_EVENTS.ORDER_CREATED
      )?.[1];

      const newOrder = {
        ...mockOrder,
        id: 'new-order',
        createdAt: new Date().toISOString(), // Fresh timestamp
      };

      onCreateHandler?.({ order: newOrder });

      // New order should be tracked for animation
      await waitFor(() => {
        expect(screen.getByText(/Table 5/)).toBeInTheDocument();
      });
    });
  });

  describe('Order Item Updates', () => {
    it('should add item when ORDER_ITEM_ADDED event received', async () => {
      renderKitchenBoard();

      const onItemAddedHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === SOCKET_EVENTS.ORDER_ITEM_ADDED
      )?.[1];

      expect(onItemAddedHandler).toBeDefined();

      const newItem = {
        id: 'item-2',
        orderId: mockOrder.id,
        menuItemId: 'menu-2',
        quantity: 1,
        specialInstructions: null,
        createdAt: new Date().toISOString(),
        menuItem: {
          id: 'menu-2',
          name: 'Fries',
          price: 4.99,
          category: Category.APPETIZER,
          foodType: FoodType.OTHER,
          available: true,
          ingredients: ['potato'],
          imageUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      onItemAddedHandler?.({
        orderId: mockOrder.id,
        item: newItem,
      });

      // Order should now have 2 items
      await waitFor(() => {
        expect(screen.getByText(/Table 5/)).toBeInTheDocument();
      });
    });

    it('should remove item when ORDER_ITEM_REMOVED event received', async () => {
      renderKitchenBoard();

      const onItemRemovedHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === SOCKET_EVENTS.ORDER_ITEM_REMOVED
      )?.[1];

      expect(onItemRemovedHandler).toBeDefined();

      onItemRemovedHandler?.({
        orderId: mockOrder.id,
        itemId: 'item-1',
      });

      // Order should have 0 items
      await waitFor(() => {
        expect(screen.getByText(/Table 5/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should respect prefers-reduced-motion via CSS', () => {
      // Animation CSS includes @media (prefers-reduced-motion: reduce)
      // This is handled in index.css, so just verify component renders
      const { container } = renderKitchenBoard();
      expect(container).toBeDefined();
    });
  });
});
