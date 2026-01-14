import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import OrderCard from '../../src/components/staff/OrderCard';
import { Order, OrderStatus } from '@restaurant/shared';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockPendingOrder: Order = {
  id: 'order-123456',
  tableNumber: 5,
  serverName: 'John',
  status: OrderStatus.PENDING,
  createdAt: new Date(Date.now() - 3 * 60000).toISOString(), // 3 min ago
  updatedAt: new Date(Date.now() - 3 * 60000).toISOString(),
  items: [
    {
      id: 'item-1',
      orderId: 'order-123456',
      menuItemId: 'menu-1',
      quantity: 2,
      specialInstructions: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'item-2',
      orderId: 'order-123456',
      menuItemId: 'menu-2',
      quantity: 1,
      specialInstructions: null,
      createdAt: new Date().toISOString(),
    },
  ],
};

const mockInProgressOrder: Order = {
  ...mockPendingOrder,
  id: 'order-789012',
  status: OrderStatus.IN_PROGRESS,
};

function renderOrderCard(order: Order) {
  return render(
    <BrowserRouter>
      <OrderCard order={order} />
    </BrowserRouter>
  );
}

describe('OrderCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders order ID (last 6 characters)', () => {
    renderOrderCard(mockPendingOrder);
    expect(screen.getByText('Order #123456')).toBeInTheDocument();
  });

  it('renders table number', () => {
    renderOrderCard(mockPendingOrder);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Table:')).toBeInTheDocument();
  });

  it('renders server name', () => {
    renderOrderCard(mockPendingOrder);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Server:')).toBeInTheDocument();
  });

  it('renders item count', () => {
    renderOrderCard(mockPendingOrder);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Items:')).toBeInTheDocument();
  });

  it('renders status badge with correct status', () => {
    renderOrderCard(mockPendingOrder);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders time elapsed', () => {
    renderOrderCard(mockPendingOrder);
    expect(screen.getByText(/3 min/)).toBeInTheDocument();
  });

  it('shows Edit button for PENDING orders', () => {
    renderOrderCard(mockPendingOrder);
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });

  it('does not show Edit button for IN_PROGRESS orders', () => {
    renderOrderCard(mockInProgressOrder);
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
  });

  it('always shows View button', () => {
    renderOrderCard(mockPendingOrder);
    expect(screen.getByRole('button', { name: /View/i })).toBeInTheDocument();
  });

  it('navigates to edit page when card is clicked', async () => {
    const user = userEvent.setup();
    renderOrderCard(mockPendingOrder);

    const card = screen.getByTestId('order-card-order-123456');
    await user.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/staff/orders/order-123456/edit');
  });

  it('navigates to edit page when Edit button is clicked', async () => {
    const user = userEvent.setup();
    renderOrderCard(mockPendingOrder);

    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/staff/orders/order-123456/edit');
  });

  it('navigates to edit page when View button is clicked', async () => {
    const user = userEvent.setup();
    renderOrderCard(mockPendingOrder);

    const viewButton = screen.getByRole('button', { name: /View/i });
    await user.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith('/staff/orders/order-123456/edit');
  });

  it('renders correct status badge colors for different statuses', () => {
    const { rerender } = render(
      <BrowserRouter>
        <OrderCard order={mockPendingOrder} />
      </BrowserRouter>
    );

    let badge = screen.getByText('Pending');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');

    rerender(
      <BrowserRouter>
        <OrderCard order={mockInProgressOrder} />
      </BrowserRouter>
    );

    badge = screen.getByText('In Progress');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });
});
