import { Category, FoodType, MenuItem, OrderItem, Order, OrderStatus } from '@restaurant/shared';

/**
 * Creates a mock MenuItem with all required fields
 */
export function createMockMenuItem(overrides?: Partial<MenuItem>): MenuItem {
  return {
    id: 'test-item-1',
    name: 'Test Item',
    price: 10.99,
    category: Category.APPETIZER,
    foodType: FoodType.SALAD,
    available: true,
    ingredients: [],
    imageUrl: null,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates a mock OrderItem with all required fields
 */
export function createMockOrderItem(overrides?: Partial<OrderItem>): OrderItem {
  return {
    id: 'test-order-item-1',
    orderId: 'test-order-1',
    menuItemId: 'test-item-1',
    quantity: 1,
    specialInstructions: null,
    createdAt: new Date().toISOString(),
    menuItem: overrides?.menuItem,
    ...overrides,
  };
}

/**
 * Creates a mock Order with all required fields
 */
export function createMockOrder(overrides?: Partial<Order>): Order {
  return {
    id: 'test-order-1',
    tableNumber: 1,
    serverName: 'Test Server',
    status: OrderStatus.PENDING,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
