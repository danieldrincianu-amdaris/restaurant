import { useState } from 'react';
import { MenuItem } from '@restaurant/shared';
import { api } from '../lib/api';

interface UseUpdateAvailabilityResult {
  updateAvailability: (id: string, available: boolean) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export function useUpdateAvailability(
  items: MenuItem[],
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>
): UseUpdateAvailabilityResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvailability = async (id: string, available: boolean) => {
    // Store previous state for rollback
    const previousItems = [...items];

    // Optimistic update
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, available } : item))
    );

    try {
      setIsUpdating(true);
      setError(null);

      await api.patch<MenuItem>(`/menu-items/${id}`, { available });
    } catch (err) {
      // Rollback on error
      setItems(previousItems);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update availability';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateAvailability,
    isUpdating,
    error,
  };
}
