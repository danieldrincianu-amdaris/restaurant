import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { OrderProvider, useOrder } from '../../src/contexts/OrderContext';
import { MenuItem, Category, FoodType } from '@restaurant/shared';

const mockMenuItem1: MenuItem = {
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

const mockMenuItem2: MenuItem = {
  id: '2',
  name: 'Margherita Pizza',
  price: 18.99,
  ingredients: ['Tomato', 'Mozzarella'],
  imageUrl: null,
  category: Category.MAIN,
  foodType: FoodType.PIZZA,
  available: true,
  sortOrder: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('OrderContext', () => {
  it('adds new item to order', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    expect(result.current.items).toHaveLength(0);

    act(() => {
      result.current.addItem(mockMenuItem1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      menuItemId: '1',
      quantity: 1,
      specialInstructions: null,
    });
    expect(result.current.items[0]!.menuItem).toEqual(mockMenuItem1);
  });

  it('increments quantity when adding existing item', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    act(() => {
      result.current.addItem(mockMenuItem1);
    });

    expect(result.current.items[0]!.quantity).toBe(1);

    act(() => {
      result.current.addItem(mockMenuItem1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]!.quantity).toBe(2);
  });

  it('adds multiple different items', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    act(() => {
      result.current.addItem(mockMenuItem1);
      result.current.addItem(mockMenuItem2);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]!.menuItemId).toBe('1');
    expect(result.current.items[1]!.menuItemId).toBe('2');
  });

  it('removes item from order', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    act(() => {
      result.current.addItem(mockMenuItem1);
      result.current.addItem(mockMenuItem2);
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]!.menuItemId).toBe('2');
  });

  it('updates item quantity', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    act(() => {
      result.current.addItem(mockMenuItem1);
    });

    expect(result.current.items[0]!.quantity).toBe(1);

    act(() => {
      result.current.updateQuantity('1', 5);
    });

    expect(result.current.items[0]!.quantity).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    act(() => {
      result.current.addItem(mockMenuItem1);
    });

    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.updateQuantity('1', 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('updates special instructions', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    act(() => {
      result.current.addItem(mockMenuItem1);
    });

    expect(result.current.items[0]!.specialInstructions).toBeNull();

    act(() => {
      result.current.updateInstructions('1', 'No croutons');
    });

    expect(result.current.items[0]!.specialInstructions).toBe('No croutons');
  });

  it('sets table number', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    expect(result.current.tableNumber).toBeNull();

    act(() => {
      result.current.setTableNumber(5);
    });

    expect(result.current.tableNumber).toBe(5);
  });

  it('sets server name', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    expect(result.current.serverName).toBe('');

    act(() => {
      result.current.setServerName('John');
    });

    expect(result.current.serverName).toBe('John');
  });

  it('clears entire order', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderProvider,
    });

    act(() => {
      result.current.addItem(mockMenuItem1);
      result.current.addItem(mockMenuItem2);
      result.current.setTableNumber(5);
      result.current.setServerName('John');
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.tableNumber).toBe(5);
    expect(result.current.serverName).toBe('John');

    act(() => {
      result.current.clearOrder();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.tableNumber).toBeNull();
    expect(result.current.serverName).toBe('');
  });

  it('throws error when useOrder called outside provider', () => {
    expect(() => {
      renderHook(() => useOrder());
    }).toThrow('useOrder must be used within an OrderProvider');
  });
});
