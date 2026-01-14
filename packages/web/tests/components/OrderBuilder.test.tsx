import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useEffect } from 'react';
import OrderBuilder from '../../src/components/staff/OrderBuilder';
import { OrderProvider, useOrder } from '../../src/contexts/OrderContext';
import { MenuItem, Category, FoodType } from '@restaurant/shared';

// Mock child components
vi.mock('../../src/components/staff/OrderItemRow', () => ({
  default: ({ item }: { item: { menuItemId: string; menuItem: { name: string }; quantity: number } }) => (
    <div data-testid={`order-item-${item.menuItemId}`}>
      {item.menuItem.name} - {item.quantity}x
    </div>
  ),
}));

const mockMenuItem: MenuItem = {
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
};

describe('OrderBuilder', () => {
  const renderWithProvider = (component: React.ReactNode) => {
    return render(<OrderProvider>{component}</OrderProvider>);
  };

  it('renders empty state when no items', () => {
    renderWithProvider(<OrderBuilder />);

    expect(screen.getByText('No items yet')).toBeInTheDocument();
    expect(screen.getByText(/Select items from the menu to start building an order/i)).toBeInTheDocument();
  });

  it('displays table number and server name inputs', () => {
    renderWithProvider(<OrderBuilder />);

    expect(screen.getByLabelText(/Table Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Server Name/i)).toBeInTheDocument();
  });

  it('updates table number in context', () => {
    const Wrapper = () => {
      const { tableNumber } = useOrder();
      return (
        <div>
          <OrderBuilder />
          <div data-testid="table-value">{tableNumber ?? 'null'}</div>
        </div>
      );
    };

    renderWithProvider(<Wrapper />);

    const tableInput = screen.getByLabelText(/Table Number/i) as HTMLInputElement;

    fireEvent.change(tableInput, { target: { value: '5' } });

    expect(screen.getByTestId('table-value')).toHaveTextContent('5');
  });

  it('updates server name in context', () => {
    const Wrapper = () => {
      const { serverName } = useOrder();
      return (
        <div>
          <OrderBuilder />
          <div data-testid="server-value">{serverName}</div>
        </div>
      );
    };

    renderWithProvider(<Wrapper />);

    const serverInput = screen.getByLabelText(/Server Name/i) as HTMLInputElement;

    fireEvent.change(serverInput, { target: { value: 'John' } });

    expect(screen.getByTestId('server-value')).toHaveTextContent('John');
  });

  it('displays order items from context', () => {
    const Wrapper = () => {
      const { addItem } = useOrder();
      
      // Add item on mount
      useEffect(() => {
        addItem(mockMenuItem);
      }, [addItem]);

      return <OrderBuilder />;
    };

    renderWithProvider(<Wrapper />);

    expect(screen.getByTestId('order-item-1')).toBeInTheDocument();
    expect(screen.getByText(/Caesar Salad - 1x/)).toBeInTheDocument();
  });

  it('displays correct running total', () => {
    const Wrapper = () => {
      const { addItem } = useOrder();
      
      // Add item twice on mount
      useEffect(() => {
        addItem(mockMenuItem);
        addItem(mockMenuItem);
      }, [addItem]);

      return <OrderBuilder />;
    };

    renderWithProvider(<Wrapper />);

    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$25.98')).toBeInTheDocument(); // 12.99 * 2
  });

  it('does not display total when no items', () => {
    renderWithProvider(<OrderBuilder />);

    expect(screen.queryByText('Total:')).not.toBeInTheDocument();
  });

  it('displays Order #NEW header', () => {
    renderWithProvider(<OrderBuilder />);

    expect(screen.getByText('Order #NEW')).toBeInTheDocument();
  });
});
