import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusColumn from '../../../src/components/kitchen/StatusColumn';
import { Order, OrderStatus } from '@restaurant/shared';

describe('StatusColumn', () => {
  const mockOrders: Order[] = [
    {
      id: '1',
      tableNumber: 5,
      serverName: 'John',
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 'item1',
          orderId: '1',
          menuItemId: 'menu1',
          quantity: 2,
          specialInstructions: null,
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: '2',
      tableNumber: 3,
      serverName: 'Sarah',
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    },
  ];

  it('displays status name in header', () => {
    render(<StatusColumn status={OrderStatus.PENDING} orders={mockOrders} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('displays order count badge', () => {
    render(<StatusColumn status={OrderStatus.PENDING} orders={mockOrders} />);

    expect(screen.getByText('2')).toBeInTheDocument(); // 2 orders
  });

  it('displays correct icon for each status', () => {
    const { rerender } = render(<StatusColumn status={OrderStatus.PENDING} orders={[]} />);
    expect(screen.getByText('🔵')).toBeInTheDocument();

    rerender(<StatusColumn status={OrderStatus.IN_PROGRESS} orders={[]} />);
    expect(screen.getByText('🟡')).toBeInTheDocument();

    rerender(<StatusColumn status={OrderStatus.HALTED} orders={[]} />);
    expect(screen.getByText('⚫')).toBeInTheDocument();

    rerender(<StatusColumn status={OrderStatus.COMPLETED} orders={[]} />);
    expect(screen.getByText('🟢')).toBeInTheDocument();
  });

  it('applies status-specific color classes for PENDING', () => {
    const { container } = render(<StatusColumn status={OrderStatus.PENDING} orders={mockOrders} />);

    const header = container.querySelector('.bg-blue-500');
    expect(header).toBeInTheDocument();
  });

  it('applies status-specific color classes for IN_PROGRESS', () => {
    const { container } = render(
      <StatusColumn status={OrderStatus.IN_PROGRESS} orders={mockOrders} />
    );

    const header = container.querySelector('.bg-amber-500');
    expect(header).toBeInTheDocument();
  });

  it('applies status-specific color classes for HALTED', () => {
    const { container } = render(<StatusColumn status={OrderStatus.HALTED} orders={mockOrders} />);

    const header = container.querySelector('.bg-gray-600');
    expect(header).toBeInTheDocument();
  });

  it('applies status-specific color classes for COMPLETED', () => {
    const { container } = render(
      <StatusColumn status={OrderStatus.COMPLETED} orders={mockOrders} />
    );

    const header = container.querySelector('.bg-green-500');
    expect(header).toBeInTheDocument();
  });

  it('shows empty state when no orders', () => {
    render(<StatusColumn status={OrderStatus.PENDING} orders={[]} />);

    expect(screen.getByText('No orders')).toBeInTheDocument();
  });

  it('renders placeholder cards for each order', () => {
    render(<StatusColumn status={OrderStatus.PENDING} orders={mockOrders} />);

    // Check that order IDs are displayed (last 6 chars)
    expect(screen.getByText(`#${mockOrders[0].id.slice(-6)}`)).toBeInTheDocument();
    expect(screen.getByText(`#${mockOrders[1].id.slice(-6)}`)).toBeInTheDocument();

    // Check table numbers
    expect(screen.getByText('Table 5')).toBeInTheDocument();
    expect(screen.getByText('Table 3')).toBeInTheDocument();

    // Check server names
    expect(screen.getByText('Server: John')).toBeInTheDocument();
    expect(screen.getByText('Server: Sarah')).toBeInTheDocument();
  });

  it('displays item count in placeholder cards', () => {
    render(<StatusColumn status={OrderStatus.PENDING} orders={mockOrders} />);

    // First order has 1 item, second has 0
    expect(screen.getByText('1 items')).toBeInTheDocument();
    expect(screen.getByText('0 items')).toBeInTheDocument();
  });

  it('applies border color based on status', () => {
    const { container } = render(<StatusColumn status={OrderStatus.PENDING} orders={mockOrders} />);

    const cards = container.querySelectorAll('.border-blue-500');
    expect(cards.length).toBeGreaterThan(0);
  });
});
