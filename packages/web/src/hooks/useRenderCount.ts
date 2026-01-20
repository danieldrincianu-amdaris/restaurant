import { useRef, useEffect } from 'react';

interface RenderInfo {
  component: string;
  renderCount: number;
  lastRenderTime: number;
  props?: Record<string, unknown>;
}

const renderStats = new Map<string, RenderInfo>();

/**
 * Development-only hook to track component render counts
 * 
 * Logs render information to console in development mode.
 * Has no effect in production builds.
 * 
 * @param componentName - Name of the component to track
 * @param props - Optional props to log (avoid logging sensitive data)
 * 
 * @example
 * ```tsx
 * function OrderCard({ order }: OrderCardProps) {
 *   useRenderCount('OrderCard', { orderId: order.id, status: order.status });
 *   
 *   return <div>...</div>;
 * }
 * ```
 */
export function useRenderCount(
  componentName: string,
  props?: Record<string, unknown>
): void {
  const renderCountRef = useRef(0);
  const isDevMode = import.meta.env.DEV;

  useEffect(() => {
    if (!isDevMode) return;

    renderCountRef.current += 1;
    const now = Date.now();

    // Update global stats
    const info: RenderInfo = {
      component: componentName,
      renderCount: renderCountRef.current,
      lastRenderTime: now,
      props,
    };
    renderStats.set(componentName, info);
  });
}

/**
 * Get render statistics for all tracked components
 * 
 * @returns Map of component names to render information
 */
export function getRenderStats(): Map<string, RenderInfo> {
  return new Map(renderStats);
}

/**
 * Clear all render statistics
 * 
 * Useful for resetting between test runs or when starting fresh monitoring.
 */
export function clearRenderStats(): void {
  renderStats.clear();
}

/**
 * Get render statistics as a sorted array
 * 
 * @param sortBy - Field to sort by ('renderCount' or 'lastRenderTime')
 * @returns Sorted array of render info
 */
export function getRenderStatsArray(
  sortBy: 'renderCount' | 'lastRenderTime' = 'renderCount'
): RenderInfo[] {
  const stats = Array.from(renderStats.values());
  
  return stats.sort((a, b) => {
    if (sortBy === 'renderCount') {
      return b.renderCount - a.renderCount; // Descending
    }
    return b.lastRenderTime - a.lastRenderTime; // Most recent first
  });
}

/**
 * Log summary of render statistics to console
 */
export function logRenderStatsSummary(): void {
  if (!import.meta.env.DEV) return;

  const stats = getRenderStatsArray('renderCount');
  
  if (stats.length === 0) {
    return;
  }

  // Statistics available through getRenderStatsArray
}
