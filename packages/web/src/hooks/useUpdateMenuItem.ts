import { useState } from 'react';
import { api } from '../lib/api';
import { MenuItem, UpdateMenuItemInput } from '@restaurant/shared';

interface UseUpdateMenuItemResult {
  updateMenuItem: (id: string, data: UpdateMenuItemInput) => Promise<MenuItem>;
  isSubmitting: boolean;
  error: string | null;
}

export function useUpdateMenuItem(): UseUpdateMenuItemResult {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateMenuItem = async (id: string, data: UpdateMenuItemInput): Promise<MenuItem> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.put<{ data: MenuItem }>(`/menu-items/${id}`, data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { updateMenuItem, isSubmitting, error };
}
