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
    const existing = renderStats.get(componentName);
    const info: RenderInfo = {
      component: componentName,
      renderCount: renderCountRef.current,
      lastRenderTime: now,
      props,
    };
    renderStats.set(componentName, info);

    // Log to console with styling
    const color = renderCountRef.current > 10 ? '#ff6b6b' : '#51cf66';
    console.log(
      `%c[Render] ${componentName} - Count: ${renderCountRef.current}`,
      `color: ${color}; font-weight: bold;`,
      props ? `Props: ${JSON.stringify(props, null, 2)}` : ''
    );

    // Warn about excessive renders
    if (renderCountRef.current > 20 && renderCountRef.current % 10 === 0) {
      console.warn(
        `⚠️ ${componentName} has rendered ${renderCountRef.current} times. Consider optimization.`
      );
    }
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
    console.log('%c[Performance] No render statistics available', 'color: #868e96;');
    return;
  }

  console.group('%c[Performance] Render Statistics Summary', 'color: #339af0; font-weight: bold; font-size: 14px;');
  
  stats.forEach((info) => {
    const color = info.renderCount > 10 ? '#ff6b6b' : '#51cf66';
    console.log(
      `%c${info.component}%c: ${info.renderCount} renders`,
      `color: ${color}; font-weight: bold;`,
      'color: inherit;'
    );
  });
  
  const totalRenders = stats.reduce((sum, info) => sum + info.renderCount, 0);
  const avgRenders = (totalRenders / stats.length).toFixed(1);
  
  console.log(`\n%cTotal Components: ${stats.length}`, 'color: #868e96;');
  console.log(`%cTotal Renders: ${totalRenders}`, 'color: #868e96;');
  console.log(`%cAverage Renders/Component: ${avgRenders}`, 'color: #868e96;');
  
  console.groupEnd();
}
