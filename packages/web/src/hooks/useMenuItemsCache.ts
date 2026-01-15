import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '@restaurant/shared';
import { api } from '../lib/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseMenuItemsCacheResult {
  items: MenuItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  invalidateCache: () => void;
}

const CACHE_KEY_PREFIX = 'menu_items_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate cache key based on filter parameters
 */
function getCacheKey(category?: string, foodType?: string): string {
  const parts = [CACHE_KEY_PREFIX];
  if (category) parts.push(`cat_${category}`);
  if (foodType) parts.push(`type_${foodType}`);
  return parts.join('_');
}

/**
 * Get cached data from localStorage if valid (not expired)
 */
function getCachedData<T>(cacheKey: string): T | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Save data to localStorage with timestamp
 */
function setCachedData<T>(cacheKey: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

/**
 * Custom hook with cache-first strategy and background refresh
 */
export function useMenuItemsCache(
  category?: string,
  foodType?: string
): UseMenuItemsCacheResult {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = getCacheKey(category, foodType);

  const fetchItems = useCallback(
    async (useCache = true) => {
      try {
        // Try cache first
        if (useCache) {
          const cachedItems = getCachedData<MenuItem[]>(cacheKey);
          if (cachedItems) {
            setItems(cachedItems);
            setIsLoading(false);
            
            // Background refresh - fetch fresh data without blocking UI
            fetchItems(false);
            return;
          }
        }

        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (foodType) params.append('foodType', foodType);

        const queryString = params.toString();
        const endpoint = queryString ? `/menu-items?${queryString}` : '/menu-items';

        const response = await api.get<{ data: MenuItem[] }>(endpoint);
        
        // Update cache
        setCachedData(cacheKey, response.data);
        
        setItems(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
      } finally {
        setIsLoading(false);
      }
    },
    [category, foodType, cacheKey]
  );

  const invalidateCache = useCallback(() => {
    try {
      // Clear all menu item caches
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchItems(false); // Force fetch, bypass cache
  }, [fetchItems]);

  useEffect(() => {
    fetchItems(true); // Use cache on mount
  }, [fetchItems]);

  return {
    items,
    isLoading,
    error,
    refetch,
    invalidateCache,
  };
}
