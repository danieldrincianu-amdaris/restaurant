import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import KitchenBoard from '../../../src/components/kitchen/KitchenBoard';
import { Order, OrderStatus } from '@restaurant/shared';

// Mock hooks
vi.mock('../../../src/hooks/useOrders', () => ({
  useOrders: vi.fn(),
}));

vi.mock('../../../src/hooks/useOrderEvents', () => ({
  useOrderEvents: vi.fn(),
}));

// Mock StatusColumn component
vi.mock('../../../src/components/kitchen/StatusColumn', () => ({
  default: ({ status, orders }: { status: OrderStatus; orders: Order[] }) => (
    <div data-testid={`status-column-${status}`}>
      {status} ({orders.length} orders)
    </div>
  ),
}));

import { useOrders } from '../../../src/hooks/useOrders';
import { useOrderEvents } from '../../../src/hooks/useOrderEvents';

const mockUseOrders = useOrders as ReturnType<typeof vi.fn>;
const mockUseOrderEvents = useOrderEvents as ReturnType<typeof vi.fn>;

describe('KitchenBoard', () => {
  const mockOrders: Order[] = [
    {
      id: '1',
      tableNumber: 5,
      serverName: 'John',
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    },
    {
      id: '2',
      tableNumber: 3,
      serverName: 'Sarah',
      status: OrderStatus.IN_PROGRESS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    },
    {
      id: '3',
      tableNumber: 8,
      serverName: 'Mike',
      status: OrderStatus.HALTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    },
    {
      id: '4',
      tableNumber: 2,
      serverName: 'Lisa',
      status: OrderStatus.COMPLETED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOrderEvents.mockImplementation(() => {});
    localStorage.clear();
  });

  it('renders 4 StatusColumn components', () => {
    mockUseOrders.mockReturnValue({
      orders: mockOrders,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <KitchenBoard />
      </MemoryRouter>
    );

    expect(screen.getByTestId(`status-column-${OrderStatus.PENDING}`)).toBeInTheDocument();
    expect(screen.getByTestId(`status-column-${OrderStatus.IN_PROGRESS}`)).toBeInTheDocument();
    expect(screen.getByTestId(`status-column-${OrderStatus.HALTED}`)).toBeInTheDocument();
    expect(screen.getByTestId(`status-column-${OrderStatus.COMPLETED}`)).toBeInTheDocument();
  });

  it('distributes orders to correct columns by status', () => {
    mockUseOrders.mockReturnValue({
      orders: mockOrders,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <KitchenBoard />
      </MemoryRouter>
    );

    expect(screen.getByText(/PENDING \(1 orders\)/)).toBeInTheDocument();
    expect(screen.getByText(/IN_PROGRESS \(1 orders\)/)).toBeInTheDocument();
    expect(screen.getByText(/HALTED \(1 orders\)/)).toBeInTheDocument();
    expect(screen.getByText(/COMPLETED \(1 orders\)/)).toBeInTheDocument();
  });

  it('filters completed orders to last 30 minutes', () => {
    const now = new Date();
    const oldCompleted: Order = {
      id: '5',
      tableNumber: 10,
      serverName: 'Alex',
      status: OrderStatus.COMPLETED,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // 45 min ago
      updatedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      items: [],
    };

    mockUseOrders.mockReturnValue({
      orders: [...mockOrders, oldCompleted],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <KitchenBoard />
      </MemoryRouter>
    );

    // Should still show 1 completed (not 2) because old one is filtered out
    expect(screen.getByText(/COMPLETED \(1 orders\)/)).toBeInTheDocument();
  });

  it('hides canceled orders by default', () => {
    const canceledOrder: Order = {
      id: '6',
      tableNumber: 7,
      serverName: 'Tom',
      status: OrderStatus.CANCELED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    };

    mockUseOrders.mockReturnValue({
      orders: [...mockOrders, canceledOrder],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <KitchenBoard />
      </MemoryRouter>
    );

    // Should not have canceled column or canceled orders in any column
    expect(screen.queryByTestId(`status-column-${OrderStatus.CANCELED}`)).not.toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockUseOrders.mockReturnValue({
      orders: [],
      isLoading: true,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <KitchenBoard />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading orders...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseOrders.mockReturnValue({
      orders: [],
      isLoading: false,
      error: 'Failed to fetch orders',
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <KitchenBoard />
      </MemoryRouter>
    );

    expect(screen.getByText('⚠️ Error Loading Orders')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch orders')).toBeInTheDocument();
  });

  it('subscribes to kitchen room for real-time events', () => {
    mockUseOrders.mockReturnValue({
      orders: mockOrders,
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <KitchenBoard />
      </MemoryRouter>
    );

    expect(mockUseOrderEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        room: 'kitchen',
        onCreate: expect.any(Function),
        onUpdate: expect.any(Function),
        onDelete: expect.any(Function),
        onStatusChange: expect.any(Function),
      })
    );
  });
});
