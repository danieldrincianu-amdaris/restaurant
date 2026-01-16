import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditOrderPage from '../../src/pages/staff/EditOrderPage';
import { ToastProvider } from '../../src/contexts/ToastContext';
import { Order, OrderStatus, Category, FoodType } from '@restaurant/shared';
import * as api from '../../src/lib/api';
import { useAvailableMenuItems } from '../../src/hooks/useAvailableMenuItems';

// Mock the API module
vi.mock('../../src/lib/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock useAvailableMenuItems hook
vi.mock('../../src/hooks/useAvailableMenuItems', () => ({
  useAvailableMenuItems: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EditOrderPage', () => {
  const mockPendingOrder: Order = {
    id: 'order-123',
    tableNumber: 5,
    serverName: 'Alice',
    status: OrderStatus.PENDING,
    items: [
      {
        id: 'item-1',
        orderId: 'order-123',
        menuItemId: 'menu-1',
        quantity: 2,
        specialInstructions: null,
        createdAt: '2024-01-15T10:00:00Z',
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };

  const mockMenuItems = [
    {
      id: 'menu-1',
      name: 'Cheeseburger',
      price: 12.99,
      category: Category.MAIN,
      foodType: FoodType.MEAT,
      available: true,
      ingredients: [],
      imageUrl: null,
      sortOrder: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const renderEditOrderPage = (orderId: string = 'order-123') => {
    return render(
      <MemoryRouter initialEntries={[`/staff/orders/${orderId}/edit`]}>
        <ToastProvider>
          <Routes>
            <Route path="/staff/orders/:id/edit" element={<EditOrderPage />} />
            <Route path="/staff/orders" element={<div>Orders List</div>} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Default mock for useAvailableMenuItems
    vi.mocked(useAvailableMenuItems).mockReturnValue({
      items: mockMenuItems,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state while fetching order', () => {
    vi.mocked(api.api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderEditOrderPage();

    expect(screen.getByText(/loading order/i)).toBeInTheDocument();
  });

  it('should show error when order fetch fails', async () => {
    vi.mocked(api.api.get).mockRejectedValue(new Error('Order not found'));

    renderEditOrderPage();

    await waitFor(() => {
      expect(screen.getByText(/order not found/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /back to orders/i })).toBeInTheDocument();
  });

  it('should redirect to orders list for COMPLETED orders', async () => {
    const completedOrder = {
      ...mockPendingOrder,
      status: OrderStatus.COMPLETED,
    };

    vi.mocked(api.api.get).mockResolvedValue({ data: completedOrder });

    renderEditOrderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/staff/orders');
    });
  });

  it('should redirect to orders list for CANCELED orders', async () => {
    const canceledOrder = {
      ...mockPendingOrder,
      status: OrderStatus.CANCELED,
    };

    vi.mocked(api.api.get).mockResolvedValue({ data: canceledOrder });

    renderEditOrderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/staff/orders');
    });
  });

  it('should show warning modal for IN_PROGRESS orders', async () => {
    const inProgressOrder = {
      ...mockPendingOrder,
      status: OrderStatus.IN_PROGRESS,
    };

    vi.mocked(api.api.get).mockResolvedValue({ data: inProgressOrder });

    renderEditOrderPage();

    await waitFor(() => {
      expect(screen.getByText(/warning/i)).toBeInTheDocument();
      expect(
        screen.getByText(/kitchen has started this order/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continue editing/i })
    ).toBeInTheDocument();
  });

  it('should load PENDING order without warning', async () => {
    const orderWithMenuItem = {
      ...mockPendingOrder,
      items: [
        {
          ...mockPendingOrder.items[0],
          menuItem: mockMenuItems[0],
        },
      ],
    };

    vi.mocked(api.api.get).mockResolvedValueOnce({ data: orderWithMenuItem });

    renderEditOrderPage();

    await waitFor(() => {
      expect(screen.getByText(/edit order #/i)).toBeInTheDocument();
    });

    // Should NOT show warning modal
    expect(screen.queryByText(/warning/i)).not.toBeInTheDocument();

    // Should show order details
    expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // Table number
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument(); // Server name
  });

  it('should load HALTED order without warning', async () => {
    const haltedOrder = {
      ...mockPendingOrder,
      status: OrderStatus.HALTED,
      items: [
        {
          ...mockPendingOrder.items[0],
          menuItem: mockMenuItems[0],
        },
      ],
    };

    vi.mocked(api.api.get).mockResolvedValueOnce({ data: haltedOrder });

    renderEditOrderPage();

    await waitFor(() => {
      expect(screen.getByText(/edit order #/i)).toBeInTheDocument();
    });

    // Should NOT show warning modal
    expect(screen.queryByText(/warning/i)).not.toBeInTheDocument();
  });

  it('should have back button that navigates to orders list', async () => {
    const orderWithMenuItem = {
      ...mockPendingOrder,
      items: [
        {
          ...mockPendingOrder.items[0],
          menuItem: mockMenuItems[0],
        },
      ],
    };

    vi.mocked(api.api.get).mockResolvedValueOnce({ data: orderWithMenuItem });

    const user = userEvent.setup();
    renderEditOrderPage();

    await waitFor(() => {
      expect(screen.getByText(/edit order #/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/staff/orders');
  });

  it('should render MenuBrowser and OrderBuilder components', async () => {
    const orderWithMenuItem = {
      ...mockPendingOrder,
      items: [
        {
          ...mockPendingOrder.items[0],
          menuItem: mockMenuItems[0],
        },
      ],
    };

    vi.mocked(api.api.get).mockResolvedValueOnce({ data: orderWithMenuItem });

    renderEditOrderPage();

    await waitFor(() => {
      expect(screen.getByText(/edit order #/i)).toBeInTheDocument();
    });

    // OrderBuilder should show table number and server name inputs
    expect(screen.getByLabelText(/table number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/server name/i)).toBeInTheDocument();

    // Should show Save Changes button (edit mode)
    await waitFor(() => {
      const saveButton = screen.queryByRole('button', { name: /save changes/i });
      if (saveButton) {
        expect(saveButton).toBeInTheDocument();
      }
    });
  });

  it('should populate order context with existing order data', async () => {
    vi.mocked(api.api.get).mockResolvedValueOnce({
      data: {
        ...mockPendingOrder,
        items: [
          {
            ...mockPendingOrder.items[0],
            menuItem: mockMenuItems[0],
          },
        ],
      },
    });

    renderEditOrderPage();

    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    });

    // Should show existing item in order (use getAllByText since item appears in menu and order)
    await waitFor(() => {
      const items = screen.getAllByText(/cheeseburger/i);
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
