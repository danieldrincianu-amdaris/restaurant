// Custom React hook for calculating wait time alert levels

import { useState, useEffect } from 'react';
import { OrderStatus } from '@restaurant/shared';

export type AlertLevel = 'none' | 'warning' | 'critical';

export interface WaitTimeAlertConfig {
  pendingWarningMinutes: number;
  pendingCriticalMinutes: number;
  inProgressWarningMinutes: number;
}

const DEFAULT_CONFIG: WaitTimeAlertConfig = {
  pendingWarningMinutes: 10,
  pendingCriticalMinutes: 20,
  inProgressWarningMinutes: 30,
};

/**
 * Hook for calculating wait time alert level based on order age and status
 * 
 * Updates alert level every 30 seconds to provide real-time feedback
 * about orders that are waiting too long.
 * 
 * @param createdAt - ISO timestamp when order was created
 * @param status - Current order status
 * @param config - Optional threshold configuration (defaults from env vars)
 * 
 * @returns AlertLevel - 'none', 'warning', or 'critical'
 * 
 * @example
 * ```tsx
 * const alertLevel = useWaitTimeAlert(order.createdAt, order.status);
 * const borderColor = alertLevel === 'critical' ? 'border-red-500' : 
 *                     alertLevel === 'warning' ? 'border-amber-500' : 
 *                     'border-blue-500';
 * ```
 */
export function useWaitTimeAlert(
  createdAt: string,
  status: OrderStatus,
  config: Partial<WaitTimeAlertConfig> = {}
): AlertLevel {
  const thresholds = { ...DEFAULT_CONFIG, ...config };
  
  const calculateAlertLevel = (): AlertLevel => {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const elapsedMinutes = Math.floor((now - created) / 60000);

    // Only alert for active statuses
    if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELED) {
      return 'none';
    }

    // Pending status thresholds
    if (status === OrderStatus.PENDING) {
      if (elapsedMinutes >= thresholds.pendingCriticalMinutes) {
        return 'critical';
      }
      if (elapsedMinutes >= thresholds.pendingWarningMinutes) {
        return 'warning';
      }
    }

    // In Progress status thresholds
    if (status === OrderStatus.IN_PROGRESS) {
      if (elapsedMinutes >= thresholds.inProgressWarningMinutes) {
        return 'warning';
      }
    }

    return 'none';
  };

  const [alertLevel, setAlertLevel] = useState<AlertLevel>(calculateAlertLevel);

  useEffect(() => {
    // Update immediately on mount/change
    setAlertLevel(calculateAlertLevel());

    // Update every 30 seconds
    const interval = setInterval(() => {
      setAlertLevel(calculateAlertLevel());
    }, 30000);

    return () => clearInterval(interval);
  }, [createdAt, status, thresholds.pendingWarningMinutes, thresholds.pendingCriticalMinutes, thresholds.inProgressWarningMinutes]);

  return alertLevel;
}

/**
 * Get elapsed minutes for an order
 * Utility function for threshold calculations
 */
export function getElapsedMinutes(createdAt: string): number {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  return Math.floor((now - created) / 60000);
}
