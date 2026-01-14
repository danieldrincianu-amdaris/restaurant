import { useState, useEffect } from 'react';
import { MenuItem } from '@restaurant/shared';
import { api } from '../lib/api';

interface UseAvailableMenuItemsResult {
  items: MenuItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAvailableMenuItems(
  category?: string,
  foodType?: string
): UseAvailableMenuItemsResult {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('available', 'true'); // Only fetch available items
      if (category) params.append('category', category);
      if (foodType) params.append('foodType', foodType);

      const queryString = params.toString();
      const endpoint = `/menu-items?${queryString}`;

      const response = await api.get<{ data: MenuItem[] }>(endpoint);
      setItems(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available menu items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, foodType]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
  };
}
