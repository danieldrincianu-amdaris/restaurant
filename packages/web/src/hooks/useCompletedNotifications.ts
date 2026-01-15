import { useState, useEffect } from 'react';

/**
 * Custom hook for managing staff completed notification preference
 * 
 * Stores preference in localStorage to persist across sessions.
 * Key: 'staff-completed-notifications'
 * 
 * @returns {[boolean, () => void]} Tuple of [enabled, toggleEnabled]
 */
export function useCompletedNotifications(): [boolean, () => void] {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem('staff-completed-notifications');
    // Default to enabled if not set
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('staff-completed-notifications', enabled.toString());
  }, [enabled]);

  const toggleEnabled = () => {
    setEnabled((prev) => !prev);
  };

  return [enabled, toggleEnabled];
}
