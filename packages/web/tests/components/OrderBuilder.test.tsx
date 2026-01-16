import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import OrderBuilder from '../../src/components/staff/OrderBuilder';
import { OrderProvider, useOrder } from '../../src/contexts/OrderContext';
import { ToastProvider } from '../../src/contexts/ToastContext';
import { MenuItem, Category, FoodType } from '@restaurant/shared';
import * as useCreateOrderModule from '../../src/hooks/useCreateOrder';

// Mock dependencies
vi.mock('../../src/hooks/useCreateOrder');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock child components
vi.mock('../../src/components/staff/OrderItemRow', () => ({
  default: ({ item }: { item: { menuItemId: string; menuItem: { name: string }; quantity: number } }) => (
    <div data-testid={`order-item-${item.menuItemId}`}>
      {item.menuItem.name} - {item.quantity}x
    </div>
  ),
}));

vi.mock('../../src/components/ui/ConfirmDialog', () => ({
  default: ({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) => 
    isOpen ? (
      <div data-testid="confirm-dialog">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
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
  sortOrder: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('OrderBuilder', () => {
  const mockCreateOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useCreateOrderModule, 'useCreateOrder').mockReturnValue({
      createOrder: mockCreateOrder,
      isSubmitting: false,
      error: null,
    });
  });

  const renderWithProvider = (component: React.ReactNode) => {
    return render(
      <MemoryRouter>
        <ToastProvider>
          <OrderProvider>{component}</OrderProvider>
        </ToastProvider>
      </MemoryRouter>
    );
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
      
      // Add item on mount - empty deps to run once
      useEffect(() => {
        addItem(mockMenuItem);

      }, []);

      return <OrderBuilder />;
    };

    renderWithProvider(<Wrapper />);

    expect(screen.getByTestId('order-item-1')).toBeInTheDocument();
    expect(screen.getByText(/Caesar Salad - 1x/)).toBeInTheDocument();
  });

  it('displays correct running total', () => {
    const Wrapper = () => {
      const { addItem } = useOrder();
      
      // Add item twice on mount - empty deps to run once
      useEffect(() => {
        addItem(mockMenuItem);
        addItem(mockMenuItem);

      }, []);

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

  it('Submit button is disabled when no items', () => {
    renderWithProvider(<OrderBuilder />);

    const submitButton = screen.getByRole('button', { name: /Submit Order/i });
    expect(submitButton).toBeDisabled();
  });

  it('Submit button is disabled when no table number', () => {
    const Wrapper = () => {
      const { addItem, setServerName } = useOrder();
      
      useEffect(() => {
        addItem(mockMenuItem);
        setServerName('John');

      }, []);

      return <OrderBuilder />;
    };

    renderWithProvider(<Wrapper />);

    const submitButton = screen.getByRole('button', { name: /Submit Order/i });
    expect(submitButton).toBeDisabled();
  });

  it('Submit button is disabled when no server name', () => {
    const Wrapper = () => {
      const { addItem, setTableNumber } = useOrder();
      
      useEffect(() => {
        addItem(mockMenuItem);
        setTableNumber(5);

      }, []);

      return <OrderBuilder />;
    };

    renderWithProvider(<Wrapper />);

    const submitButton = screen.getByRole('button', { name: /Submit Order/i });
    expect(submitButton).toBeDisabled();
  });

  it('Submit button is enabled when all requirements are met', () => {
    const Wrapper = () => {
      const { addItem, setTableNumber, setServerName } = useOrder();
      
      useEffect(() => {
        addItem(mockMenuItem);
        setTableNumber(5);
        setServerName('John');

      }, []);

      return <OrderBuilder />;
    };

    renderWithProvider(<Wrapper />);

    const submitButton = screen.getByRole('button', { name: /Submit Order/i });
    expect(submitButton).toBeEnabled();
  });

  it('Clear button shows confirmation when items exist', async () => {
    const user = userEvent.setup();
    const Wrapper = () => {
      const { addItem } = useOrder();
      
      useEffect(() => {
        addItem(mockMenuItem);

      }, []);

      return <OrderBuilder />;
    };

    renderWithProvider(<Wrapper />);

    const clearButton = screen.getByRole('button', { name: /Clear/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });
  });

  it('Clear button clears order when confirmed', async () => {
    const user = userEvent.setup();
    const Wrapper = () => {
      const { addItem, items } = useOrder();
      
      useEffect(() => {
        addItem(mockMenuItem);

      }, []);

      return (
        <div>
          <OrderBuilder />
          <div data-testid="item-count">{items.length}</div>
        </div>
      );
    };

    renderWithProvider(<Wrapper />);

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');

    const clearButton = screen.getByRole('button', { name: /Clear/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });
  });
});
