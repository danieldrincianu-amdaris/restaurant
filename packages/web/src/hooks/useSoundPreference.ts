// Custom React hook for managing sound notification preferences in localStorage

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kitchen.soundMuted';

/**
 * Hook for managing sound notification mute preference
 * 
 * Persists mute state in localStorage and provides toggle functionality.
 * Defaults to unmuted (false) on first visit.
 * 
 * @returns Object with isMuted state and toggleMute function
 * 
 * @example
 * ```tsx
 * function KitchenHeader() {
 *   const { isMuted, toggleMute } = useSoundPreference();
 *   
 *   return (
 *     <button onClick={toggleMute}>
 *       {isMuted ? '🔕' : '🔔'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSoundPreference() {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    // Read initial state from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isMuted.toString());
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return { isMuted, toggleMute };
}
