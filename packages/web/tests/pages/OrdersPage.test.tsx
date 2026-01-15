import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import OrdersPage from '../../src/pages/staff/OrdersPage';
import { ToastProvider } from '../../src/contexts/ToastContext';
import * as useOrdersHook from '../../src/hooks/useOrders';
import { Order, OrderStatus } from '@restaurant/shared';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockOrders: Order[] = [
  {
    id: 'order-1',
    tableNumber: 5,
    serverName: 'John',
    status: OrderStatus.PENDING,
    createdAt: '2026-01-14T12:00:00Z',
    updatedAt: '2026-01-14T12:00:00Z',
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        menuItemId: 'menu-1',
        quantity: 2,
        specialInstructions: null,
        createdAt: '2026-01-14T12:00:00Z',
      },
    ],
  },
  {
    id: 'order-2',
    tableNumber: 3,
    serverName: 'Maria',
    status: OrderStatus.IN_PROGRESS,
    createdAt: '2026-01-14T11:30:00Z',
    updatedAt: '2026-01-14T11:45:00Z',
    items: [
      {
        id: 'item-2',
        orderId: 'order-2',
        menuItemId: 'menu-2',
        quantity: 1,
        specialInstructions: null,
        createdAt: '2026-01-14T11:30:00Z',
      },
    ],
  },
  {
    id: 'order-3',
    tableNumber: 8,
    serverName: 'John',
    status: OrderStatus.PENDING,
    createdAt: '2026-01-14T11:00:00Z',
    updatedAt: '2026-01-14T11:00:00Z',
    items: [],
  },
  {
    id: 'order-4',
    tableNumber: 10,
    serverName: 'Alex',
    status: OrderStatus.COMPLETED,
    createdAt: '2026-01-14T10:00:00Z',
    updatedAt: '2026-01-14T11:00:00Z',
    items: [],
  },
];

const mockRefresh = vi.fn();
const mockSetOrders = vi.fn();

// Mock useOrderEvents hook
vi.mock('../../src/hooks/useOrderEvents', () => ({
  useOrderEvents: vi.fn(),
}));

function renderOrdersPage() {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <OrdersPage />
      </ToastProvider>
    </BrowserRouter>
  );
}

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    localStorage.clear();
    vi.spyOn(useOrdersHook, 'useOrders');
  });

  it('displays loading state while fetching orders', () => {
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: [],
      setOrders: mockSetOrders,
      isLoading: true,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    expect(screen.getByRole('status', { name: 'Loading orders' })).toBeInTheDocument();
  });

  it('displays list of active orders (excluding COMPLETED and CANCELED)', () => {
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: mockOrders,
      setOrders: mockSetOrders,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    // Should display 3 active orders (order-1, order-2, order-3)
    expect(screen.getByText('Order #rder-1')).toBeInTheDocument();
    expect(screen.getByText('Order #rder-2')).toBeInTheDocument();
    expect(screen.getByText('Order #rder-3')).toBeInTheDocument();

    // Should NOT display completed order
    expect(screen.queryByText('Order #rder-4')).not.toBeInTheDocument();
  });

  it('displays orders sorted by creation time (newest first)', () => {
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: mockOrders,
      setOrders: mockSetOrders,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    const orderCards = screen.getAllByTestId(/order-card-/);
    
    // order-1 is newest, should be first
    expect(orderCards[0]).toHaveAttribute('data-testid', 'order-card-order-1');
    // order-2 is second newest
    expect(orderCards[1]).toHaveAttribute('data-testid', 'order-card-order-2');
    // order-3 is oldest
    expect(orderCards[2]).toHaveAttribute('data-testid', 'order-card-order-3');
  });

  it('displays empty state when no orders exist', () => {
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: [],
      setOrders: mockSetOrders,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    expect(screen.getByText('No Active Orders')).toBeInTheDocument();
    expect(screen.getByText(/No active orders at the moment/)).toBeInTheDocument();
  });

  it('displays error state when fetch fails', () => {
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: [],
      setOrders: mockSetOrders,
      isLoading: false,
      error: 'Failed to fetch orders',
      refresh: mockRefresh,
    });

    renderOrdersPage();

    expect(screen.getByText('Failed to fetch orders')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  it('calls refresh when retry button is clicked in error state', async () => {
    const user = userEvent.setup();
    
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: [],
      setOrders: mockSetOrders,
      isLoading: false,
      error: 'Failed to fetch orders',
      refresh: mockRefresh,
    });

    renderOrdersPage();

    const retryButton = screen.getByRole('button', { name: /Retry/i });
    await user.click(retryButton);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('filters orders when "My Orders" tab is selected', async () => {
    const user = userEvent.setup();
    localStorage.setItem('lastServerName', 'John');

    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: mockOrders,
      setOrders: mockSetOrders,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    const myOrdersTab = screen.getByRole('button', { name: /My Orders/i });
    await user.click(myOrdersTab);

    await waitFor(() => {
      // Should only show John's orders
      expect(screen.getByText('Order #rder-1')).toBeInTheDocument();
      expect(screen.getByText('Order #rder-3')).toBeInTheDocument();
      // Should not show Maria's order
      expect(screen.queryByText('Order #rder-2')).not.toBeInTheDocument();
    });
  });

  it('filters orders by status when status filter is changed', async () => {
    const user = userEvent.setup();
    
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: mockOrders,
      setOrders: mockSetOrders,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    const statusSelect = screen.getByRole('combobox');
    await user.selectOptions(statusSelect, OrderStatus.PENDING);

    await waitFor(() => {
      // Should only show PENDING orders
      expect(screen.getByText('Order #rder-1')).toBeInTheDocument();
      expect(screen.getByText('Order #rder-3')).toBeInTheDocument();
      // Should not show IN_PROGRESS order
      expect(screen.queryByText('Order #rder-2')).not.toBeInTheDocument();
    });
  });

  it('calls refresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: mockOrders,
      setOrders: mockSetOrders,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    const refreshButton = screen.getByTitle('Refresh orders');
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('has a link to create new order in header', () => {
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: [],
      setOrders: mockSetOrders,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    const newOrderButton = screen.getByRole('link', { name: '+ New Order' });
    expect(newOrderButton).toHaveAttribute('href', '/staff/orders/new');
  });

  it('clicking an order card navigates to edit page', async () => {
    const user = userEvent.setup();
    
    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: mockOrders,
      setOrders: mockSetOrders,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    const orderCard = screen.getByTestId('order-card-order-1');
    await user.click(orderCard);

    expect(mockNavigate).toHaveBeenCalledWith('/staff/orders/order-1/edit');
  });

  it('displays correct empty state message for "My Orders" filter', async () => {
    const user = userEvent.setup();
    localStorage.setItem('lastServerName', 'Alex');

    vi.mocked(useOrdersHook.useOrders).mockReturnValue({
      orders: mockOrders.filter(o => o.status !== OrderStatus.COMPLETED), // Only active orders
      setOrders: mockSetOrders,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    renderOrdersPage();

    const myOrdersTab = screen.getByRole('button', { name: /My Orders/i });
    await user.click(myOrdersTab);

    await waitFor(() => {
      expect(screen.getByText("You don't have any active orders")).toBeInTheDocument();
    });
  });
});
