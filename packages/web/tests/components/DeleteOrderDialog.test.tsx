import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteOrderDialog from '../../src/components/staff/DeleteOrderDialog';
import { Order, OrderStatus, Category, FoodType } from '@restaurant/shared';

describe('DeleteOrderDialog', () => {
  const mockOrder: Order = {
    id: 'order-abc123',
    tableNumber: 5,
    serverName: 'Alice',
    status: OrderStatus.PENDING,
    items: [
      {
        id: 'item-1',
        orderId: 'order-abc123',
        menuItemId: 'menu-1',
        quantity: 2,
        specialInstructions: null,
        createdAt: '2024-01-15T10:00:00Z',
        menuItem: {
          id: 'menu-1',
          name: 'Pizza',
          price: 15.99,
          ingredients: ['cheese', 'tomato'],
          imageUrl: null,
          category: Category.MAIN,
          foodType: FoodType.PIZZA,
          available: true,
          sortOrder: 0,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      },
      {
        id: 'item-2',
        orderId: 'order-abc123',
        menuItemId: 'menu-2',
        quantity: 1,
        specialInstructions: null,
        createdAt: '2024-01-15T10:00:00Z',
        menuItem: {
          id: 'menu-2',
          name: 'Salad',
          price: 8.99,
          ingredients: ['lettuce'],
          imageUrl: null,
          category: Category.APPETIZER,
          foodType: FoodType.SALAD,
          available: true,
          sortOrder: 0,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };

  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  it('does not render when closed', () => {
    render(
      <DeleteOrderDialog
        isOpen={false}
        order={mockOrder}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('Delete Order')).not.toBeInTheDocument();
  });

  it('does not render when order is null', () => {
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={null}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('Delete Order')).not.toBeInTheDocument();
  });

  it('renders order summary information', () => {
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={mockOrder}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('heading', { name: 'Delete Order' })).toBeInTheDocument();
    expect(screen.getByText(/bc123/)).toBeInTheDocument(); // Last 6 chars of ID
    expect(screen.getByText('5')).toBeInTheDocument(); // Table number
    expect(screen.getByText('Alice')).toBeInTheDocument(); // Server name
    expect(screen.getByText('2')).toBeInTheDocument(); // Item count
  });

  it('calculates and displays total price', () => {
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={mockOrder}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // 2 × $15.99 + 1 × $8.99 = $40.97
    expect(screen.getByText('$40.97')).toBeInTheDocument();
  });

  it('displays warning message', () => {
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={mockOrder}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(
      screen.getByText(/This action cannot be undone/i)
    ).toBeInTheDocument();
  });

  it('calls onConfirm when delete button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={mockOrder}
        isDeleting={false}
        onConfirm={onConfirm}
        onCancel={mockOnCancel}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete Order' });
    fireEvent.click(deleteButton);

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={mockOrder}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('disables buttons when deleting', () => {
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={mockOrder}
        isDeleting={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const deleteButton = screen.getByText('Deleting...');
    const cancelButton = screen.getByText('Cancel');

    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows "Deleting..." text when deletion in progress', () => {
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={mockOrder}
        isDeleting={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('calls onCancel when overlay is clicked', () => {
    const onCancel = vi.fn();
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={mockOrder}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={onCancel}
      />
    );

    const overlay = screen.getByRole('heading', { name: 'Delete Order' }).parentElement?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(onCancel).toHaveBeenCalledOnce();
    }
  });

  it('does not call onCancel when clicking overlay while deleting', () => {
    const onCancel = vi.fn();
    render(
      <DeleteOrderDialog
        isOpen={true}
        order={mockOrder}
        isDeleting={true}
        onConfirm={mockOnConfirm}
        onCancel={onCancel}
      />
    );

    const overlay = screen.getByRole('heading', { name: 'Delete Order' }).parentElement?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(onCancel).not.toHaveBeenCalled();
    }
  });

  it('handles order with no items', () => {
    const orderWithNoItems: Order = {
      ...mockOrder,
      items: [],
    };

    render(
      <DeleteOrderDialog
        isOpen={true}
        order={orderWithNoItems}
        isDeleting={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument(); // Item count
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument(); // Total not shown when 0
  });
});
