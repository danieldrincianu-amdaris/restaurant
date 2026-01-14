import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Category, FoodType, MenuItem } from '@restaurant/shared';
import NewOrderPage from '../../src/pages/staff/NewOrderPage';
import * as useAvailableMenuItemsHook from '../../src/hooks/useAvailableMenuItems';

// Mock dependencies
vi.mock('../../src/hooks/useAvailableMenuItems');
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
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.spyOn(useAvailableMenuItemsHook, 'useAvailableMenuItems').mockReturnValue({
      items: mockMenuItems,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  const renderNewOrderPage = () => {
    return render(
      <BrowserRouter>
        <NewOrderPage />
      </BrowserRouter>
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
});
