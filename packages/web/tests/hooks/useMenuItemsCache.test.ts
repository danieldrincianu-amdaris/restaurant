import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMenuItemsCache } from '../../src/hooks/useMenuItemsCache';
import { api } from '../../src/lib/api';
import type { MenuItem, Category, FoodType } from '@restaurant/shared';

// Mock the API
vi.mock('../../src/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Burger',
    price: 10.99,
    category: 'MAIN' as Category,
    foodType: 'MEAT' as FoodType,
    available: true,
    imageUrl: null,
    ingredients: [],
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Fries',
    price: 3.99,
    category: 'APPETIZER' as Category,
    foodType: 'OTHER' as FoodType,
    available: true,
    imageUrl: null,
    ingredients: [],
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('useMenuItemsCache', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches menu items from API when cache is empty', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockMenuItems });

    const { result } = renderHook(() => useMenuItemsCache());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual(mockMenuItems);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/menu-items');
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('returns cached data immediately and skips API call', async () => {
    // Pre-populate cache
    const cacheKey = 'menu_items_cache';
    const cacheData = {
      data: mockMenuItems,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockMenuItems });

    const { result } = renderHook(() => useMenuItemsCache());

    // Should return cached data immediately
    await waitFor(() => {
      expect(result.current.items).toEqual(mockMenuItems);
      expect(result.current.isLoading).toBe(false);
    });

    // API should still be called for background refresh
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });

  it('fetches fresh data when cache is expired', async () => {
    // Pre-populate cache with expired timestamp (6 minutes ago)
    const cacheKey = 'menu_items_cache';
    const expiredTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago
    const cacheData = {
      data: mockMenuItems,
      timestamp: expiredTimestamp,
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockMenuItems });

    const { result } = renderHook(() => useMenuItemsCache());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should fetch from API since cache was expired
    expect(api.get).toHaveBeenCalledWith('/menu-items');
    expect(result.current.items).toEqual(mockMenuItems);
  });

  it('supports filtering by category', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [mockMenuItems[0]] });

    const { result } = renderHook(() => useMenuItemsCache('burgers'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/menu-items?category=burgers');
  });

  it('supports filtering by foodType', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [mockMenuItems[0]] });

    const { result } = renderHook(() => useMenuItemsCache(undefined, 'entree'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/menu-items?foodType=entree');
  });

  it('supports filtering by both category and foodType', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [mockMenuItems[0]] });

    const { result } = renderHook(() => useMenuItemsCache('burgers', 'entree'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/menu-items?category=burgers&foodType=entree');
  });

  it('refetch forces fresh data fetch', async () => {
    // Pre-populate cache
    const cacheKey = 'menu_items_cache';
    const cacheData = {
      data: mockMenuItems,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

    vi.mocked(api.get).mockResolvedValue({ data: mockMenuItems });

    const { result } = renderHook(() => useMenuItemsCache());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mock to track only refetch calls
    vi.clearAllMocks();

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/menu-items');
    });

    // Refetch should bypass cache
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('invalidateCache clears all menu caches', async () => {
    // Add multiple cache entries
    localStorage.setItem('menu_items_cache', JSON.stringify({ data: [], timestamp: Date.now() }));
    localStorage.setItem('menu_items_cache_cat_burgers', JSON.stringify({ data: [], timestamp: Date.now() }));
    localStorage.setItem('other_cache', 'should not be removed');

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockMenuItems });

    const { result } = renderHook(() => useMenuItemsCache());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.invalidateCache();

    // Menu caches should be cleared
    expect(localStorage.getItem('menu_items_cache')).toBeNull();
    expect(localStorage.getItem('menu_items_cache_cat_burgers')).toBeNull();
    
    // Other cache should remain
    expect(localStorage.getItem('other_cache')).toBe('should not be removed');
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Network error';
    vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useMenuItemsCache());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.items).toEqual([]);
  });

  it('uses different cache keys for different filters', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockMenuItems });

    // Render with category filter
    const { result: result1 } = renderHook(() => useMenuItemsCache('burgers'));
    await waitFor(() => expect(result1.current.isLoading).toBe(false));

    // Render with foodType filter
    const { result: result2 } = renderHook(() => useMenuItemsCache(undefined, 'entree'));
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    // Both filters should have made their own API calls (different cache keys)
    expect(api.get).toHaveBeenCalledWith('/menu-items?category=burgers');
    expect(api.get).toHaveBeenCalledWith('/menu-items?foodType=entree');
    
    // At least 2 calls minimum
    expect(api.get).toHaveBeenCalled();
    expect(api.get).toHaveBeenCalled();
  });

  it('background refresh updates cache without loading state', async () => {
    // Pre-populate cache
    const cacheKey = 'menu_items_cache';
    const cacheData = {
      data: mockMenuItems,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

    const updatedMenuItems = [...mockMenuItems, {
      id: 3,
      name: 'Salad',
      description: 'Fresh salad',
      price: 7.99,
      categoryId: 3,
      foodType: 'side' as const,
      available: true,
      imageUrl: null,
      ingredients: [],
    }];

    vi.mocked(api.get).mockResolvedValueOnce({ data: updatedMenuItems });

    const { result } = renderHook(() => useMenuItemsCache());

    // Should return cached data immediately
    await waitFor(() => {
      expect(result.current.items).toEqual(mockMenuItems);
      expect(result.current.isLoading).toBe(false);
    });

    // Wait for background refresh to complete
    await waitFor(() => {
      expect(result.current.items).toEqual(updatedMenuItems);
    });

    // Loading should not have been triggered during background refresh
    expect(result.current.isLoading).toBe(false);
  });
});
