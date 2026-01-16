import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderItem, OrderStatus, Category, FoodType } from '@restaurant/shared';
import OrderItemsList from '../../../src/components/kitchen/OrderItemsList';

describe('OrderItemsList', () => {
  const createMockItem = (
    id: string,
    quantity: number,
    name: string,
    specialInstructions: string | null = null
  ): OrderItem => ({
    id,
    orderId: 'order-123',
    menuItemId: `menu-${id}`,
    quantity,
    specialInstructions,
    createdAt: new Date().toISOString(),
    menuItem: {
      id: `menu-${id}`,
      name,
      price: 10.99,
      ingredients: [],
      imageUrl: null,
      category: Category.MAIN,
      foodType: FoodType.MEAT,
      available: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  it('displays all items with quantities', () => {
    const items: OrderItem[] = [
      createMockItem('1', 2, 'Margherita Pizza'),
      createMockItem('2', 1, 'Caesar Salad'),
      createMockItem('3', 3, 'Espresso'),
    ];

    render(<OrderItemsList items={items} />);

    expect(screen.getByText('2x Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('1x Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('3x Espresso')).toBeInTheDocument();
  });

  it('displays special instructions with emphasis styling', () => {
    const items: OrderItem[] = [
      createMockItem('1', 1, 'Burger', 'No pickles, extra cheese'),
      createMockItem('2', 1, 'Pizza', 'Well done'),
    ];

    render(<OrderItemsList items={items} />);

    expect(screen.getByText(/"No pickles, extra cheese"/)).toBeInTheDocument();
    expect(screen.getByText(/"Well done"/)).toBeInTheDocument();
    
    // Check for amber background styling
    const instruction1 = screen.getByText(/"No pickles, extra cheese"/);
    expect(instruction1).toHaveClass('bg-amber-50');
    expect(instruction1).toHaveClass('text-amber-800');
  });

  it('shows indicator badge when order has special instructions', () => {
    const items: OrderItem[] = [
      createMockItem('1', 1, 'Burger'),
      createMockItem('2', 1, 'Pizza', 'Extra cheese'),
    ];

    render(<OrderItemsList items={items} />);

    expect(screen.getByText('Special instructions')).toBeInTheDocument();
  });

  it('does not show indicator badge when no special instructions', () => {
    const items: OrderItem[] = [
      createMockItem('1', 1, 'Burger'),
      createMockItem('2', 1, 'Pizza'),
    ];

    render(<OrderItemsList items={items} />);

    expect(screen.queryByText('Special instructions')).not.toBeInTheDocument();
  });

  it('handles empty items array', () => {
    render(<OrderItemsList items={[]} />);

    expect(screen.getByText('No items in order')).toBeInTheDocument();
  });

  it('handles undefined menuItem gracefully', () => {
    const itemWithoutMenuItem: OrderItem = {
      id: '1',
      orderId: 'order-123',
      menuItemId: 'menu-1',
      quantity: 2,
      specialInstructions: null,
      createdAt: new Date().toISOString(),
      // No menuItem field
    };

    render(<OrderItemsList items={[itemWithoutMenuItem]} />);

    expect(screen.getByText('2x Unknown Item')).toBeInTheDocument();
  });

  it('renders menu item names correctly', () => {
    const items: OrderItem[] = [
      createMockItem('1', 1, 'Spaghetti Carbonara'),
      createMockItem('2', 2, 'Chicken Tikka Masala'),
    ];

    render(<OrderItemsList items={items} />);

    expect(screen.getByText('1x Spaghetti Carbonara')).toBeInTheDocument();
    expect(screen.getByText('2x Chicken Tikka Masala')).toBeInTheDocument();
  });

  it('displays special instructions icon (🗒️) with instructions', () => {
    const items: OrderItem[] = [
      createMockItem('1', 1, 'Steak', 'Medium rare'),
    ];

    const { container } = render(<OrderItemsList items={items} />);

    // Check for icon emoji in the rendered output
    expect(container.textContent).toContain('🗒️');
  });
});
