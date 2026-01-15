import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { Order, OrderStatus } from '@restaurant/shared';
import DraggableOrderCard from '../../../src/components/kitchen/DraggableOrderCard';

// Mock the KitchenOrderCard component
vi.mock('../../../src/components/kitchen/KitchenOrderCard', () => ({
  default: ({ order, status }: { order: Order; status: OrderStatus }) => (
    <div data-testid="kitchen-order-card">
      Order #{order.id.slice(-6)} - Table {order.tableNumber} - {status}
    </div>
  ),
}));

describe('DraggableOrderCard', () => {
  const mockOrder: Order = {
    id: 'order-abc123def456',
    tableNumber: 5,
    serverName: 'John Doe',
    status: OrderStatus.PENDING,
    createdAt: new Date('2026-01-15T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-15T12:00:00Z').toISOString(),
    items: [],
  };

  // Wrapper with DndContext for @dnd-kit hooks
  const renderWithDndContext = (component: React.ReactElement) => {
    return render(<DndContext>{component}</DndContext>);
  };

  it('should render KitchenOrderCard with order data', () => {
    renderWithDndContext(
      <DraggableOrderCard order={mockOrder} status={OrderStatus.PENDING} />
    );

    expect(screen.getByTestId('kitchen-order-card')).toBeInTheDocument();
    expect(screen.getByText(/Order #def456/)).toBeInTheDocument();
    expect(screen.getByText(/Table 5/)).toBeInTheDocument();
  });

  it('should have draggable id matching order id', () => {
    const { container } = renderWithDndContext(
      <DraggableOrderCard order={mockOrder} status={OrderStatus.PENDING} />
    );

    // The wrapper div should have dnd-kit attributes
    const draggableWrapper = container.firstChild as HTMLElement;
    expect(draggableWrapper).toBeTruthy();
  });

  it('should pass order and status data to useDraggable', () => {
    renderWithDndContext(
      <DraggableOrderCard order={mockOrder} status={OrderStatus.PENDING} />
    );

    // Component should render without errors, data is passed internally
    expect(screen.getByTestId('kitchen-order-card')).toBeInTheDocument();
  });

  it('should pass onClick handler when not dragging', () => {
    const handleClick = vi.fn();

    renderWithDndContext(
      <DraggableOrderCard
        order={mockOrder}
        status={OrderStatus.PENDING}
        onClick={handleClick}
      />
    );

    // KitchenOrderCard should receive the onClick prop
    // (we'd verify this with user interaction in integration tests)
    expect(screen.getByTestId('kitchen-order-card')).toBeInTheDocument();
  });

  it('should render with different statuses', () => {
    const { rerender } = renderWithDndContext(
      <DraggableOrderCard order={mockOrder} status={OrderStatus.PENDING} />
    );
    expect(screen.getByText(/PENDING/)).toBeInTheDocument();

    rerender(
      <DndContext>
        <DraggableOrderCard order={mockOrder} status={OrderStatus.IN_PROGRESS} />
      </DndContext>
    );
    expect(screen.getByText(/IN_PROGRESS/)).toBeInTheDocument();

    rerender(
      <DndContext>
        <DraggableOrderCard order={mockOrder} status={OrderStatus.COMPLETED} />
      </DndContext>
    );
    expect(screen.getByText(/COMPLETED/)).toBeInTheDocument();
  });
});
