import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Order, OrderStatus, Category, FoodType } from '@restaurant/shared';
import KitchenOrderCard from '../../../src/components/kitchen/KitchenOrderCard';

// Mock the useElapsedTime hook
vi.mock('../../../src/lib/timeUtils', () => ({
  useElapsedTime: vi.fn(() => '12 min'),
}));

// Mock useWaitTimeAlert hook
vi.mock('../../../src/hooks/useWaitTimeAlert', () => ({
  useWaitTimeAlert: vi.fn(() => 'none'),
  getElapsedMinutes: vi.fn(() => 12),
}));

// Mock threshold config
vi.mock('../../../src/config/waitTimeThresholds', () => ({
  getWaitTimeThresholds: vi.fn(() => ({
    pendingWarningMinutes: 10,
    pendingCriticalMinutes: 20,
    inProgressWarningMinutes: 30,
  })),
}));

// Mock OrderItemsList component
vi.mock('../../../src/components/kitchen/OrderItemsList', () => ({
  default: ({ items }: { items: unknown[] }) => (
    <div data-testid="order-items-list">
      {items.length} items
    </div>
  ),
}));

import { useElapsedTime } from '../../../src/lib/timeUtils';

const mockUseElapsedTime = useElapsedTime as ReturnType<typeof vi.fn>;

describe('KitchenOrderCard', () => {
  const mockOrder: Order = {
    id: 'order-abc123def456',
    tableNumber: 5,
    serverName: 'John Doe',
    status: OrderStatus.PENDING,
    createdAt: new Date('2026-01-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-15T10:00:00Z').toISOString(),
    items: [
      {
        id: 'item-1',
        orderId: 'order-abc123def456',
        menuItemId: 'menu-1',
        quantity: 2,
        specialInstructions: null,
        createdAt: new Date().toISOString(),
        menuItem: {
          id: 'menu-1',
          name: 'Margherita Pizza',
          price: 12.99,
          ingredients: [],
          imageUrl: null,
          category: Category.MAIN,
          foodType: FoodType.PIZZA,
          available: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseElapsedTime.mockReturnValue('12 min');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays order ID (last 6 characters)', () => {
    render(<KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />);

    expect(screen.getByText('#def456')).toBeInTheDocument();
  });

  it('displays table number', () => {
    render(<KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />);

    expect(screen.getByText('Table 5')).toBeInTheDocument();
  });

  it('displays server name', () => {
    render(<KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />);

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('displays time elapsed', () => {
    render(<KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />);

    expect(screen.getByText('12 min')).toBeInTheDocument();
    expect(screen.getByText('⏱️')).toBeInTheDocument();
  });

  it('calls useElapsedTime hook with createdAt timestamp', () => {
    render(<KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />);

    expect(mockUseElapsedTime).toHaveBeenCalledWith(mockOrder.createdAt);
  });

  it('applies PENDING status border color', () => {
    const { container } = render(
      <KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-blue-500');
  });

  it('applies IN_PROGRESS status border color', () => {
    const { container } = render(
      <KitchenOrderCard order={mockOrder} status={OrderStatus.IN_PROGRESS} />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-amber-500');
  });

  it('applies HALTED status border color', () => {
    const { container } = render(
      <KitchenOrderCard order={mockOrder} status={OrderStatus.HALTED} />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-gray-600');
  });

  it('applies COMPLETED status border color', () => {
    const { container } = render(
      <KitchenOrderCard order={mockOrder} status={OrderStatus.COMPLETED} />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-green-500');
  });

  it('calls onClick handler when card is clicked', () => {
    const handleClick = vi.fn();
    render(
      <KitchenOrderCard
        order={mockOrder}
        status={OrderStatus.PENDING}
        onClick={handleClick}
      />
    );

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick handler when Enter key is pressed', () => {
    const handleClick = vi.fn();
    render(
      <KitchenOrderCard
        order={mockOrder}
        status={OrderStatus.PENDING}
        onClick={handleClick}
      />
    );

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick handler when Space key is pressed', () => {
    const handleClick = vi.fn();
    render(
      <KitchenOrderCard
        order={mockOrder}
        status={OrderStatus.PENDING}
        onClick={handleClick}
      />
    );

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Order def456 for table 5');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('shows special instructions indicator when order has special instructions', () => {
    const orderWithInstructions: Order = {
      ...mockOrder,
      items: [
        {
          ...mockOrder.items[0]!,
          specialInstructions: 'No olives',
        },
      ],
    };

    render(
      <KitchenOrderCard order={orderWithInstructions} status={OrderStatus.PENDING} />
    );

    expect(screen.getByTitle('Has special instructions')).toBeInTheDocument();
    expect(screen.getByText('🗒️')).toBeInTheDocument();
  });

  it('does not show special instructions indicator when order has no special instructions', () => {
    render(<KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />);

    expect(screen.queryByTitle('Has special instructions')).not.toBeInTheDocument();
  });

  it('renders OrderItemsList component with order items', () => {
    render(<KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />);

    expect(screen.getByTestId('order-items-list')).toBeInTheDocument();
    expect(screen.getByText('1 items')).toBeInTheDocument();
  });

  it('has consistent minimum height', () => {
    const { container } = render(
      <KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('min-h-[120px]');
  });

  it('has maximum height with overflow scrolling', () => {
    const { container } = render(
      <KitchenOrderCard order={mockOrder} status={OrderStatus.PENDING} />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('max-h-[300px]');
  });
});
