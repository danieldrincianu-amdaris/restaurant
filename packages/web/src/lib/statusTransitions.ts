import { OrderStatus } from '@restaurant/shared';

/**
 * Status transition rules matching backend validation
 * 
 * Maps each order status to the statuses it can transition to.
 * COMPLETED and CANCELED are terminal states with no valid transitions.
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.HALTED, OrderStatus.CANCELED],
  [OrderStatus.HALTED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELED]: [],
};

/**
 * Check if a status transition is valid
 * 
 * @param fromStatus - Current order status
 * @param toStatus - Target order status
 * @returns true if transition is allowed, false otherwise
 */
export function isValidTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
}

/**
 * Get all valid target statuses for a given current status
 * 
 * @param fromStatus - Current order status
 * @returns Array of valid target statuses
 */
export function getValidTargetStatuses(fromStatus: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[fromStatus] || [];
}
