import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Order, OrderStatus } from '@restaurant/shared';
import DroppableColumn from '../../../src/components/kitchen/DroppableColumn';
import KitchenDndContext from '../../../src/components/kitchen/KitchenDndContext';

// Mock StatusColumn component
vi.mock('../../../src/components/kitchen/StatusColumn', () => ({
  default: ({ status, orders }: { status: OrderStatus; orders: Order[] }) => (
    <div data-testid="status-column">
      Status: {status} - Orders: {orders.length}
    </div>
  ),
}));

describe('DroppableColumn', () => {
  const mockOrders: Order[] = [
    {
      id: 'order-1',
      tableNumber: 5,
      serverName: 'John',
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    },
    {
      id: 'order-2',
      tableNumber: 8,
      serverName: 'Jane',
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    },
  ];

  const mockOnStatusChange = vi.fn();

  // Wrapper with KitchenDndContext
  const renderWithDndContext = (component: React.ReactElement) => {
    return render(
      <KitchenDndContext onStatusChange={mockOnStatusChange}>
        {component}
      </KitchenDndContext>
    );
  };

  it('should render StatusColumn with orders', () => {
    renderWithDndContext(
      <DroppableColumn status={OrderStatus.PENDING} orders={mockOrders} />
    );

    expect(screen.getByTestId('status-column')).toBeInTheDocument();
    expect(screen.getByText(/Status: PENDING/)).toBeInTheDocument();
    expect(screen.getByText(/Orders: 2/)).toBeInTheDocument();
  });

  it('should render with empty orders array', () => {
    renderWithDndContext(
      <DroppableColumn status={OrderStatus.IN_PROGRESS} orders={[]} />
    );

    expect(screen.getByTestId('status-column')).toBeInTheDocument();
    expect(screen.getByText(/Orders: 0/)).toBeInTheDocument();
  });

  it('should work with all status types', () => {
    const { rerender } = renderWithDndContext(
      <DroppableColumn status={OrderStatus.PENDING} orders={[]} />
    );
    expect(screen.getByText(/PENDING/)).toBeInTheDocument();

    rerender(
      <KitchenDndContext onStatusChange={mockOnStatusChange}>
        <DroppableColumn status={OrderStatus.IN_PROGRESS} orders={[]} />
      </KitchenDndContext>
    );
    expect(screen.getByText(/IN_PROGRESS/)).toBeInTheDocument();

    rerender(
      <KitchenDndContext onStatusChange={mockOnStatusChange}>
        <DroppableColumn status={OrderStatus.HALTED} orders={[]} />
      </KitchenDndContext>
    );
    expect(screen.getByText(/HALTED/)).toBeInTheDocument();

    rerender(
      <KitchenDndContext onStatusChange={mockOnStatusChange}>
        <DroppableColumn status={OrderStatus.COMPLETED} orders={[]} />
      </KitchenDndContext>
    );
    expect(screen.getByText(/COMPLETED/)).toBeInTheDocument();
  });

  it('should apply droppable identifier', () => {
    const { container } = renderWithDndContext(
      <DroppableColumn status={OrderStatus.PENDING} orders={mockOrders} />
    );

    // The component should render successfully with droppable hook
    expect(container.firstChild).toBeTruthy();
  });
});
