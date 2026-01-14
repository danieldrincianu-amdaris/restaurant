import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Category, FoodType, MenuItem } from '@restaurant/shared';
import NewOrderPage from '../../src/pages/staff/NewOrderPage';
import * as useAvailableMenuItemsHook from '../../src/hooks/useAvailableMenuItems';
import * as useCreateOrderModule from '../../src/hooks/useCreateOrder';
import * as ToastContext from '../../src/contexts/ToastContext';

// Mock dependencies
vi.mock('../../src/hooks/useAvailableMenuItems');
vi.mock('../../src/hooks/useCreateOrder');
vi.mock('../../src/contexts/ToastContext', async () => {
  const actual = await vi.importActual('../../src/contexts/ToastContext');
  return {
    ...actual,
    useToast: vi.fn(),
  };
});
vi.mock('../../src/components/ui/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Caesar Salad',
    price: 12.99,
    ingredients: ['Romaine', 'Parmesan'],
    imageUrl: null,
    category: Category.APPETIZER,
    foodType: FoodType.SALAD,
    available: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    price: 18.99,
    ingredients: ['Tomato', 'Mozzarella'],
    imageUrl: null,
    category: Category.MAIN,
    foodType: FoodType.PIZZA,
    available: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('NewOrderPage', () => {
  const mockCreateOrder = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.spyOn(useAvailableMenuItemsHook, 'useAvailableMenuItems').mockReturnValue({
      items: mockMenuItems,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    vi.spyOn(useCreateOrderModule, 'useCreateOrder').mockReturnValue({
      createOrder: mockCreateOrder,
      isSubmitting: false,
      error: null,
    });

    vi.spyOn(ToastContext, 'useToast').mockReturnValue({
      toasts: [],
      showToast: mockShowToast,
      removeToast: vi.fn(),
    });
  });

  const renderNewOrderPage = (initialRoute = '/staff/orders/new') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/staff/orders/new" element={<NewOrderPage />} />
          <Route path="/staff/orders" element={<div>Orders Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders page at /staff/orders/new route', () => {
    renderNewOrderPage();

    expect(screen.getByText('New Order')).toBeInTheDocument();
    expect(screen.getByText(/select menu items to add to order/i)).toBeInTheDocument();
  });

  it('displays menu browser and order panel layout', () => {
    renderNewOrderPage();

    // Menu browser elements
    expect(screen.getByPlaceholderText(/search menu items/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    
    // Order builder elements
    expect(screen.getByText('Order #NEW')).toBeInTheDocument();
    expect(screen.getByLabelText(/Table Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Server Name/i)).toBeInTheDocument();
    expect(screen.getByText('No items yet')).toBeInTheDocument();
  });

  it('clicking menu item adds to order context', async () => {
    renderNewOrderPage();

    // Initially no items in order
    expect(screen.getByText('No items yet')).toBeInTheDocument();

    // Find and click a menu item card button
    const menuItems = screen.getAllByRole('button');
    const caesarSaladButton = menuItems.find(
      (button) => button.textContent?.includes('Caesar Salad')
    );
    
    expect(caesarSaladButton).toBeDefined();
    fireEvent.click(caesarSaladButton!);

    // Order should now show the item in OrderItemRow component
    await waitFor(() => {
      // Check that Caesar Salad appears in order section
      expect(screen.getAllByText('Caesar Salad').length).toBeGreaterThan(1); // Once in menu, once in order
      expect(screen.getByText('1x')).toBeInTheDocument(); // Quantity display
      expect(screen.getByText('$12.99 each')).toBeInTheDocument(); // Unit price
      expect(screen.getByText('Total:')).toBeInTheDocument();
    });
  });

  it('displays running total when items added', async () => {
    renderNewOrderPage();

    const menuItems = screen.getAllByRole('button');
    const caesarButton = menuItems.find((button) =>
      button.textContent?.includes('Caesar Salad')
    );
    const pizzaButton = menuItems.find((button) =>
      button.textContent?.includes('Margherita Pizza')
    );

    // Add Caesar Salad ($12.99)
    fireEvent.click(caesarButton!);

    await waitFor(() => {
      expect(screen.getByText('Total:')).toBeInTheDocument();
      // Check that total shows the item price
      const totalSection = screen.getByText('Total:').parentElement;
      expect(totalSection).toHaveTextContent('$12.99');
    });

    // Add Pizza ($18.99)
    fireEvent.click(pizzaButton!);

    await waitFor(() => {
      // Check that the total updates to the sum of both items
      const totalSection = screen.getByText('Total:').parentElement;
      expect(totalSection).toHaveTextContent('$31.98'); // 12.99 + 18.99
    });
  });

  it('increments quantity when same item clicked multiple times', async () => {
    renderNewOrderPage();

    const menuItems = screen.getAllByRole('button');
    const caesarButton = menuItems.find((button) =>
      button.textContent?.includes('Caesar Salad')
    );

    // Click once
    fireEvent.click(caesarButton!);

    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument();
      // Check that total shows the item price
      const totalSection = screen.getByText('Total:').parentElement;
      expect(totalSection).toHaveTextContent('$12.99');
    });

    // Click again
    fireEvent.click(caesarButton!);

    await waitFor(() => {
      expect(screen.getByText('2x')).toBeInTheDocument();
      // Check that total doubles
      const totalSection = screen.getByText('Total:').parentElement;
      expect(totalSection).toHaveTextContent('$25.98'); // 12.99 * 2
    });
  });

  it('back button navigates away', () => {
    const mockBack = vi.fn();
    window.history.back = mockBack;

    renderNewOrderPage();

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('displays item count correctly', async () => {
    renderNewOrderPage();

    const menuItems = screen.getAllByRole('button');
    const caesarButton = menuItems.find((button) =>
      button.textContent?.includes('Caesar Salad')
    );
    const pizzaButton = menuItems.find((button) =>
      button.textContent?.includes('Margherita Pizza')
    );

    // Add first item
    fireEvent.click(caesarButton!);

    await waitFor(() => {
      // Check that Caesar Salad appears in the order
      expect(screen.getAllByText('Caesar Salad').length).toBeGreaterThan(1); // Appears in menu and order
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    // Add second different item
    fireEvent.click(pizzaButton!);

    await waitFor(() => {
      // Check that both items appear in the order
      expect(screen.getAllByText('Caesar Salad').length).toBeGreaterThan(1);
      expect(screen.getAllByText('Margherita Pizza').length).toBeGreaterThan(1);
      expect(screen.getAllByText('1x')).toHaveLength(2); // Both items have 1x quantity
    });
  });

  it('successful submission flow - shows toast and redirects', async () => {
    const user = userEvent.setup();
    const mockOrder = {
      id: 'order-123',
      tableNumber: 5,
      serverName: 'John',
      status: 'PENDING' as const,
      createdAt: '2026-01-14T10:00:00Z',
      updatedAt: '2026-01-14T10:00:00Z',
      items: [],
    };

    mockCreateOrder.mockResolvedValue(mockOrder);

    renderNewOrderPage();

    // Add an item
    const menuItems = screen.getAllByRole('button');
    const caesarButton = menuItems.find((button) =>
      button.textContent?.includes('Caesar Salad')
    );
    await user.click(caesarButton!);

    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    // Fill in table number and server name
    const tableInput = screen.getByLabelText(/Table Number/i);
    const serverInput = screen.getByLabelText(/Server Name/i);

    await user.type(tableInput, '5');
    await user.type(serverInput, 'John');

    // Submit order
    const submitButton = screen.getByRole('button', { name: /Submit Order/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith({
        tableNumber: 5,
        serverName: 'John',
        items: [{
          menuItemId: '1',
          quantity: 1,
          specialInstructions: undefined,
        }],
      });
      expect(mockShowToast).toHaveBeenCalledWith('Order #order-123 submitted to kitchen', 'success');
      expect(screen.getByText('Orders Page')).toBeInTheDocument();
    });
  });

  it('error handling - shows error toast and preserves data', async () => {
    const user = userEvent.setup();
    mockCreateOrder.mockRejectedValue(new Error('Network error'));

    renderNewOrderPage();

    // Add an item
    const menuItems = screen.getAllByRole('button');
    const caesarButton = menuItems.find((button) =>
      button.textContent?.includes('Caesar Salad')
    );
    await user.click(caesarButton!);

    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    // Fill in table number and server name
    const tableInput = screen.getByLabelText(/Table Number/i);
    const serverInput = screen.getByLabelText(/Server Name/i);

    await user.type(tableInput, '5');
    await user.type(serverInput, 'John');

    // Submit order
    const submitButton = screen.getByRole('button', { name: /Submit Order/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Network error', 'error');
      // Verify data is still there (not cleared)
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect((tableInput as HTMLInputElement).value).toBe('5');
      expect((serverInput as HTMLInputElement).value).toBe('John');
      // Should still be on new order page
      expect(screen.queryByText('Orders Page')).not.toBeInTheDocument();
    });
  });
});
