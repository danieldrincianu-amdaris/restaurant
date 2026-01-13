import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { MenuItem } from '@restaurant/shared';

interface UseMenuItemResult {
  item: MenuItem | null;
  isLoading: boolean;
  error: string | null;
}

export function useMenuItem(id: string | undefined): UseMenuItemResult {
  const [item, setItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }

    const fetchItem = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<{ data: MenuItem }>(`/menu-items/${id}`);
        setItem(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch menu item');
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  return { item, isLoading, error };
}
