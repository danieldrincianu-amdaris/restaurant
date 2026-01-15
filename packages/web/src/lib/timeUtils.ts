import { useEffect, useState } from 'react';

/**
 * Format elapsed time from a given date to now in human-readable format
 * 
 * @param createdAt - ISO date string of when the order was created
 * @returns Formatted string: "< 1 min", "X min", or "Xh Ym"
 */
export function formatElapsedTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const elapsedMs = now.getTime() - created.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);

  if (elapsedMinutes < 1) {
    return '< 1 min';
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min`;
  }

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Custom hook that returns elapsed time and updates every minute
 * 
 * @param createdAt - ISO date string of when the order was created
 * @returns Current elapsed time string that updates every minute
 */
export function useElapsedTime(createdAt: string): string {
  const [elapsedTime, setElapsedTime] = useState(() => formatElapsedTime(createdAt));

  useEffect(() => {
    // Update immediately on mount in case the initial value is stale
    setElapsedTime(formatElapsedTime(createdAt));

    // Update every minute
    const timer = setInterval(() => {
      setElapsedTime(formatElapsedTime(createdAt));
    }, 60000);

    return () => clearInterval(timer);
  }, [createdAt]);

  return elapsedTime;
}
