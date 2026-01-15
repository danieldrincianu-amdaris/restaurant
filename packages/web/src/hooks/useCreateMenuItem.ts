import { useState } from 'react';
import { api } from '../lib/api';
import { MenuItem, CreateMenuItemInput } from '@restaurant/shared';

interface UseCreateMenuItemResult {
  createMenuItem: (data: CreateMenuItemInput) => Promise<MenuItem>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Invalidate menu items cache in localStorage
 */
function invalidateMenuCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('menu_items_cache')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error invalidating menu cache:', error);
  }
}

export function useCreateMenuItem(): UseCreateMenuItemResult {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createMenuItem = async (data: CreateMenuItemInput): Promise<MenuItem> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.post<{ data: MenuItem }>('/menu-items', data);
      
      // Invalidate cache after successful creation
      invalidateMenuCache();
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createMenuItem, isSubmitting, error };
}
