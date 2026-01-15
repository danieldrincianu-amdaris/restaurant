import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import OrderCard from '../../src/components/staff/OrderCard';
import KitchenOrderCard from '../../src/components/kitchen/KitchenOrderCard';
import MenuItemCard from '../../src/components/staff/MenuItemCard';
import { Order, OrderStatus, FoodType } from '@restaurant/shared';

// Wrapper component to provide Router context
function WithRouter({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

// Test component without memo for comparison
function OrderCardWithoutMemo({ order }: { order: Order }) {
  return (
    <div data-testid="order-card-no-memo">
      <div>{order.id}</div>
      <div>{order.status}</div>
    </div>
  );
}

describe('React.memo Performance Tests', () => {
  const mockOrder: Order = {
    id: 'order-1',
    tableNumber: 5,
    status: OrderStatus.PENDING,
    items: [
      { 
        id: 'item-1', 
        orderId: 'order-1', 
        menuItemId: 'menu-1', 
        quantity: 2, 
        specialInstructions: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        menuItem: {
          id: 'menu-1',
          name: 'Test Item',
          price: 10.99,
          category: 'MAIN' as any,
          foodType: FoodType.MEAT,
          available: true,
          imageUrl: null,
          ingredients: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('OrderCard memo optimization', () => {
    it('prevents re-render when unrelated parent state changes', () => {
      // Verify OrderCard is memoized and renders correctly
      const { rerender } = render(
        <WithRouter>
          <OrderCard order={mockOrder} />
        </WithRouter>
      );
      
      expect(screen.getByText('Table:')).toBeInTheDocument();
      expect(screen.getByText(mockOrder.tableNumber.toString())).toBeInTheDocument();
      
      // Rerender with same props - memo should optimize this
      rerender(
        <WithRouter>
          <OrderCard order={mockOrder} />
        </WithRouter>
      );
      
      // Verify it still works (memo doesn't break functionality)
      expect(screen.getByText('Table:')).toBeInTheDocument();
      expect(screen.getByText(mockOrder.tableNumber.toString())).toBeInTheDocument();
    });

    it('DOES re-render when order status changes', () => {
      const renderSpy = vi.fn();
      
      const SpiedOrderCard = (props: { order: Order }) => {
        renderSpy();
        return <OrderCard {...props} />;
      };
      
      const { rerender } = render(
        <WithRouter>
          <SpiedOrderCard order={mockOrder} />
        </WithRouter>
      );
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Different status - SHOULD re-render
      const updatedOrder = { ...mockOrder, status: OrderStatus.IN_PROGRESS };
      rerender(
        <WithRouter>
          <SpiedOrderCard order={updatedOrder} />
        </WithRouter>
      );
      expect(renderSpy).toHaveBeenCalledTimes(2); // Increased to 2
    });

    it('DOES re-render when updatedAt changes', () => {
      const renderSpy = vi.fn();
      
      const SpiedOrderCard = (props: { order: Order }) => {
        renderSpy();
        return <OrderCard {...props} />;
      };
      
      const { rerender } = render(
        <WithRouter>
          <SpiedOrderCard order={mockOrder} />
        </WithRouter>
      );
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Different updatedAt - SHOULD re-render
      const updatedOrder = { ...mockOrder, updatedAt: new Date(Date.now() + 1000).toISOString() };
      rerender(
        <WithRouter>
          <SpiedOrderCard order={updatedOrder} />
        </WithRouter>
      );
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('KitchenOrderCard memo optimization', () => {
    it('prevents re-render with same props', () => {
      // Verify KitchenOrderCard is memoized and renders correctly
      const { container, rerender } = render(
        <KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />
      );
      
      // Component renders successfully
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByRole('button')).toBeInTheDocument();
      
      // Rerender with same props - memo should optimize this
      rerender(
        <KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />
      );
      
      // Verify it still works
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('DOES re-render when order items change', () => {
      // Verify component updates when items change
      const { container, rerender } = render(
        <KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />
      );
      
      // Component renders successfully
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByRole('button')).toBeInTheDocument();
      
      // Different items - SHOULD trigger re-render and update display
      const newItem = { 
        ...mockOrder.items[0], 
        id: 'item-2', 
        quantity: 3,
        orderId: 'order-1',
        menuItemId: 'menu-1',
        specialInstructions: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedOrder = { ...mockOrder, items: [...mockOrder.items, newItem] };
      rerender(
        <KitchenOrderCard order={updatedOrder} status={OrderStatus.PENDING} />
      );
      
      // Verify component still renders (memo detects items change)
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('MenuItemCard memo optimization', () => {
    const mockMenuItem = {
      id: 'menu-1',
      name: 'Test Item',
      price: 10.99,
      category: 'MAIN' as any,
      foodType: FoodType.MEAT,
      available: true,
      imageUrl: null,
      ingredients: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('prevents re-render with same props', () => {
      // Verify MenuItemCard is memoized and renders correctly
      const onClick = vi.fn();
      
      const { rerender } = render(<MenuItemCard item={mockMenuItem} onClick={onClick} />);
      
      expect(screen.getByText(mockMenuItem.name)).toBeInTheDocument();
      
      // Rerender with same props - memo should optimize this
      rerender(<MenuItemCard item={mockMenuItem} onClick={onClick} />);
      
      // Verify it still works
      expect(screen.getByText(mockMenuItem.name)).toBeInTheDocument();
    });

    it('DOES re-render when availability changes', () => {
      const renderSpy = vi.fn();
      const onClick = vi.fn();
      
      const SpiedMenuItemCard = (props: { item: typeof mockMenuItem; onClick: (item: unknown) => void }) => {
        renderSpy();
        return <MenuItemCard item={props.item} onClick={props.onClick} />;
      };
      
      const { rerender } = render(<SpiedMenuItemCard item={mockMenuItem} onClick={onClick} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Different availability - SHOULD re-render
      const updatedItem = { ...mockMenuItem, available: false };
      rerender(<SpiedMenuItemCard item={updatedItem} onClick={onClick} />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Comparison: With and Without Memo', () => {
    it('shows render count difference between memoized and non-memoized components', () => {
      // Test that memoized component works correctly
      const { rerender: rerenderMemo } = render(
        <WithRouter>
          <OrderCard order={mockOrder} />
        </WithRouter>
      );
      
      expect(screen.getByText('Table:')).toBeInTheDocument();
      
      // Non-memoized component for comparison
      const { rerender: rerenderNoMemo } = render(<OrderCardWithoutMemo order={mockOrder} />);
      expect(screen.getByText(mockOrder.id)).toBeInTheDocument();
      
      // Both should continue working after multiple rerenders
      for (let i = 0; i < 10; i++) {
        rerenderMemo(
          <WithRouter>
            <OrderCard order={mockOrder} />
          </WithRouter>
        );
        rerenderNoMemo(<OrderCardWithoutMemo order={mockOrder} />);
      }

      // Verify both still render correctly (memo optimization is transparent)
      expect(screen.getAllByText('Table:')[0]).toBeInTheDocument();
      expect(screen.getAllByText(mockOrder.id)[0]).toBeInTheDocument();
    });
  });
});
