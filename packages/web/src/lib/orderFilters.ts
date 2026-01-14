import { Order, OrderStatus } from '@restaurant/shared';

/**
 * Filter completed orders to only include those within a time window
 * 
 * @param orders - Array of orders to filter
 * @param minutes - Time window in minutes (default: 30)
 * @returns Orders completed within the last N minutes
 */
export function filterRecentCompleted(orders: Order[], minutes = 30): Order[] {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  
  return orders.filter((order) => {
    if (order.status !== OrderStatus.COMPLETED) {
      return false;
    }
    
    const updatedAt = new Date(order.updatedAt);
    return updatedAt >= cutoffTime;
  });
}

/**
 * Filter orders by a specific status
 * 
 * @param orders - Array of orders to filter
 * @param status - OrderStatus to filter by
 * @returns Orders matching the specified status
 */
export function filterByStatus(orders: Order[], status: OrderStatus): Order[] {
  return orders.filter((order) => order.status === status);
}

/**
 * Exclude canceled orders from the array
 * 
 * @param orders - Array of orders to filter
 * @returns Orders that are not canceled
 */
export function excludeCanceled(orders: Order[]): Order[] {
  return orders.filter((order) => order.status !== OrderStatus.CANCELED);
}

/**
 * Apply standard kitchen display filters
 * - Excludes canceled orders by default
 * - Filters completed orders to recent only (last 30 minutes)
 * 
 * @param orders - Array of orders to filter
 * @param showCanceled - Whether to include canceled orders (default: false)
 * @param completedMinutes - Time window for completed orders (default: 30)
 * @returns Filtered orders suitable for kitchen display
 */
export function applyKitchenFilters(
  orders: Order[],
  showCanceled = false,
  completedMinutes = 30
): Order[] {
  let filtered = orders;

  // Exclude canceled orders unless explicitly shown
  if (!showCanceled) {
    filtered = excludeCanceled(filtered);
  }

  // Split into completed and non-completed
  const completed = filterByStatus(filtered, OrderStatus.COMPLETED);
  const nonCompleted = filtered.filter(o => o.status !== OrderStatus.COMPLETED);

  // Filter recent completed orders
  const recentCompleted = filterRecentCompleted(completed, completedMinutes);

  // Combine and return
  return [...nonCompleted, ...recentCompleted];
}
