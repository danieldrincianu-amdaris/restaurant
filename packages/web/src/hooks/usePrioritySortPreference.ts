// Custom React hook for managing priority sort preference in localStorage

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'restaurant-priority-sort-enabled';

/**
 * Hook for managing user preference for priority sorting of orders
 * 
 * Persists preference in localStorage to maintain state across sessions.
 * Priority sorting floats orders with alerts to the top of the kitchen board.
 * 
 * @returns Tuple of [isPrioritySortEnabled, togglePrioritySort]
 * 
 * @example
 * ```tsx
 * const [isPrioritySortEnabled, togglePrioritySort] = usePrioritySortPreference();
 * 
 * <button onClick={togglePrioritySort}>
 *   {isPrioritySortEnabled ? 'Disable' : 'Enable'} Priority Sort
 * </button>
 * ```
 */
export function usePrioritySortPreference(): [boolean, () => void] {
  const [isPrioritySortEnabled, setIsPrioritySortEnabled] = useState<boolean>(() => {
    // Initialize from localStorage or default to false
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    // Persist to localStorage whenever preference changes
    localStorage.setItem(STORAGE_KEY, isPrioritySortEnabled.toString());
  }, [isPrioritySortEnabled]);

  const togglePrioritySort = () => {
    setIsPrioritySortEnabled(prev => !prev);
  };

  return [isPrioritySortEnabled, togglePrioritySort];
}
