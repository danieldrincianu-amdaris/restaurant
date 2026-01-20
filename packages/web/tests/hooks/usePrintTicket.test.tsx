import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePrintTicket } from '../../src/hooks/usePrintTicket';
import { Order, OrderStatus, Category, FoodType } from '@restaurant/shared';

// Mock window.print
const mockPrint = vi.fn();
Object.defineProperty(window, 'print', {
  writable: true,
  value: mockPrint,
});

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_RESTAURANT_NAME: 'Test Restaurant',
    },
  },
});

const mockOrder: Order = {
  id: 'test-order-123',
  tableNumber: 5,
  serverName: 'John',
  status: OrderStatus.PENDING,
  createdAt: '2026-01-20T12:00:00.000Z',
  updatedAt: '2026-01-20T12:00:00.000Z',
  items: [
    {
      id: 'item-1',
      orderId: 'test-order-123',
      menuItemId: 'menu-1',
      quantity: 2,
      specialInstructions: 'No olives',
      createdAt: '2026-01-20T12:00:00.000Z',
      menuItem: {
        id: 'menu-1',
        name: 'Pizza',
        price: 12.99,
        category: Category.MAIN,
        foodType: FoodType.PIZZA,
        ingredients: [],
        imageUrl: '',
        available: true,
        sortOrder: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  ],
};

describe('usePrintTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining print containers
    document.querySelectorAll('#print-ticket-container').forEach(el => el.remove());
  });

  it('returns printTicket function and isPrinting state', () => {
    const { result } = renderHook(() => usePrintTicket());

    expect(result.current.printTicket).toBeInstanceOf(Function);
    expect(result.current.isPrinting).toBe(false);
  });

  it('sets isPrinting to true when printing starts', async () => {
    const { result } = renderHook(() => usePrintTicket());

    expect(result.current.isPrinting).toBe(false);

    act(() => {
      result.current.printTicket(mockOrder);
    });

    expect(result.current.isPrinting).toBe(true);
  });

  it('creates hidden print container in DOM', async () => {
    const { result } = renderHook(() => usePrintTicket());

    act(() => {
      result.current.printTicket(mockOrder);
    });

    const container = document.getElementById('print-ticket-container');
    expect(container).toBeInTheDocument();
    expect(container?.className).toBe('print-only-container');
  });

  it('triggers window.print()', async () => {
    const { result } = renderHook(() => usePrintTicket());

    act(() => {
      result.current.printTicket(mockOrder);
    });

    await waitFor(() => {
      expect(mockPrint).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  it('cleans up print container after printing', async () => {
    const { result } = renderHook(() => usePrintTicket());

    act(() => {
      result.current.printTicket(mockOrder);
    });

    // Wait for cleanup
    await waitFor(() => {
      const container = document.getElementById('print-ticket-container');
      expect(container).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('sets isPrinting back to false after cleanup', async () => {
    const { result } = renderHook(() => usePrintTicket());

    act(() => {
      result.current.printTicket(mockOrder);
    });

    await waitFor(() => {
      expect(result.current.isPrinting).toBe(false);
    }, { timeout: 1000 });
  });

  it('can print multiple tickets in sequence', async () => {
    const { result } = renderHook(() => usePrintTicket());

    // First print
    act(() => {
      result.current.printTicket(mockOrder);
    });

    await waitFor(() => {
      expect(result.current.isPrinting).toBe(false);
    }, { timeout: 1000 });

    expect(mockPrint).toHaveBeenCalledTimes(1);

    // Second print
    act(() => {
      result.current.printTicket(mockOrder);
    });

    await waitFor(() => {
      expect(result.current.isPrinting).toBe(false);
      expect(mockPrint).toHaveBeenCalledTimes(2);
    }, { timeout: 1000 });
  });

  it('handles errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => usePrintTicket());

    // Make window.print throw an error
    mockPrint.mockImplementationOnce(() => {
      throw new Error('Print failed');
    });

    act(() => {
      result.current.printTicket(mockOrder);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error printing ticket:',
        expect.any(Error)
      );
      expect(result.current.isPrinting).toBe(false);
    }, { timeout: 1000 });

    consoleErrorSpy.mockRestore();
  });
});
