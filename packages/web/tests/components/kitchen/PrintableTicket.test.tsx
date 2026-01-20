import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import PrintableTicket from '../../../src/components/kitchen/PrintableTicket';
import { Order, OrderStatus, Category, FoodType } from '@restaurant/shared';

// Mock QR code component
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg data-testid="qr-code" data-value={value}></svg>
  ),
}));

const createMockOrder = (overrides = {}): Order => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  tableNumber: 5,
  serverName: 'John Doe',
  status: OrderStatus.PENDING,
  createdAt: '2026-01-20T12:45:00.000Z',
  updatedAt: '2026-01-20T12:45:00.000Z',
  items: [
    {
      id: 'item-1',
      orderId: '123e4567-e89b-12d3-a456-426614174000',
      menuItemId: 'menu-1',
      quantity: 2,
      specialInstructions: 'No olives',
      createdAt: '2026-01-20T12:45:00.000Z',
      menuItem: {
        id: 'menu-1',
        name: 'Margherita Pizza',
        price: 12.99,
        category: Category.MAIN,
        foodType: FoodType.PIZZA,
        ingredients: ['tomato', 'mozzarella'],
        imageUrl: '/images/pizza.jpg',
        available: true,
        sortOrder: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    },
    {
      id: 'item-2',
      orderId: '123e4567-e89b-12d3-a456-426614174000',
      menuItemId: 'menu-2',
      quantity: 1,
      specialInstructions: null,
      createdAt: '2026-01-20T12:45:00.000Z',
      menuItem: {
        id: 'menu-2',
        name: 'Caesar Salad',
        price: 8.50,
        category: Category.APPETIZER,
        foodType: FoodType.SALAD,
        ingredients: ['lettuce', 'parmesan'],
        imageUrl: '/images/salad.jpg',
        available: true,
        sortOrder: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  ],
  ...overrides,
});

describe('PrintableTicket', () => {
  it('renders ticket with restaurant name', () => {
    const order = createMockOrder();
    const { container } = render(
      <PrintableTicket order={order} restaurantName="Test Restaurant" />
    );

    expect(container.textContent).toContain('Test Restaurant');
  });

  it('uses default restaurant name when not provided', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    expect(container.textContent).toContain('RestaurantFlow');
  });

  it('displays order information', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    // Short order ID (last 6 chars)
    expect(container.textContent).toContain('174000');
    // Table number
    expect(container.textContent).toContain('Table: 5');
    // Server name
    expect(container.textContent).toContain('Server: John Doe');
  });

  it('groups items by category', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    // Should show category labels
    expect(container.textContent).toContain('APPETIZERS');
    expect(container.textContent).toContain('MAINS');
  });

  it('displays item quantities and names', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    expect(container.textContent).toContain('2x Margherita Pizza');
    expect(container.textContent).toContain('1x Caesar Salad');
  });

  it('displays special instructions with arrow indicator', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    expect(container.textContent).toContain('→ No olives');
  });

  it('displays item prices', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    // 2x $12.99 = $25.98
    expect(container.textContent).toContain('$25.98');
    // 1x $8.50 = $8.50
    expect(container.textContent).toContain('$8.50');
  });

  it('calculates and displays order total', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    // Total: (2 * 12.99) + (1 * 8.50) = 34.48
    expect(container.textContent).toContain('TOTAL:');
    expect(container.textContent).toContain('$34.48');
  });

  it('renders QR code with correct URL', () => {
    const order = createMockOrder();
    const { getByTestId } = render(<PrintableTicket order={order} />);

    const qrCode = getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode.getAttribute('data-value')).toContain('/staff/orders/123e4567-e89b-12d3-a456-426614174000');
  });

  it('displays print timestamp', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    expect(container.textContent).toContain('Printed:');
  });

  it('includes print-specific CSS', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    const styleElement = container.querySelector('style');
    expect(styleElement).toBeInTheDocument();
    expect(styleElement?.textContent).toContain('@media print');
    expect(styleElement?.textContent).toContain('80mm');
  });

  it('hides ticket from screen display', () => {
    const order = createMockOrder();
    const { container } = render(<PrintableTicket order={order} />);

    const ticketElement = container.querySelector('.print-ticket');
    expect(ticketElement).toHaveClass('hidden');
  });

  it('handles orders with items missing menuItem data', () => {
    const order = createMockOrder({
      items: [
        {
          id: 'item-1',
          orderId: '123e4567-e89b-12d3-a456-426614174000',
          menuItemId: 'menu-1',
          quantity: 2,
          specialInstructions: null,
          createdAt: '2026-01-20T12:45:00.000Z',
          menuItem: undefined,
        },
      ],
    });

    const { container } = render(<PrintableTicket order={order} />);

    // Should not crash, should render without items
    expect(container.querySelector('.print-ticket')).toBeInTheDocument();
  });

  it('orders categories in correct sequence', () => {
    const order: Order = {
      id: 'test-order',
      tableNumber: 1,
      serverName: 'Test',
      status: OrderStatus.PENDING,
      createdAt: '2026-01-20T12:00:00.000Z',
      updatedAt: '2026-01-20T12:00:00.000Z',
      items: [
        {
          id: 'dessert-item',
          orderId: 'test-order',
          menuItemId: 'dessert',
          quantity: 1,
          specialInstructions: null,
          createdAt: '2026-01-20T12:00:00.000Z',
          menuItem: {
            id: 'dessert',
            name: 'Ice Cream',
            price: 5.00,
            category: Category.DESSERT,
            foodType: FoodType.OTHER,
            ingredients: [],
            imageUrl: '',
            available: true,
            sortOrder: 1,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
        {
          id: 'appetizer-item',
          orderId: 'test-order',
          menuItemId: 'appetizer',
          quantity: 1,
          specialInstructions: null,
          createdAt: '2026-01-20T12:00:00.000Z',
          menuItem: {
            id: 'appetizer',
            name: 'Soup',
            price: 6.00,
            category: Category.APPETIZER,
            foodType: FoodType.SOUP,
            ingredients: [],
            imageUrl: '',
            available: true,
            sortOrder: 2,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
      ],
    };

    const { container } = render(<PrintableTicket order={order} />);
    const text = container.textContent || '';

    // Appetizers should appear before desserts regardless of order in array
    const appetizerIndex = text.indexOf('APPETIZERS');
    const dessertIndex = text.indexOf('DESSERTS');
    
    expect(appetizerIndex).toBeLessThan(dessertIndex);
  });
});
