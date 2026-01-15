// Configuration for wait time alert thresholds from environment variables

export interface WaitTimeThresholds {
  pendingWarningMinutes: number;
  pendingCriticalMinutes: number;
  inProgressWarningMinutes: number;
}

/**
 * Get wait time alert thresholds from environment variables with fallback defaults
 * 
 * Environment Variables:
 * - VITE_PENDING_WARNING_MINUTES: Minutes before a PENDING order shows warning (default: 10)
 * - VITE_PENDING_CRITICAL_MINUTES: Minutes before a PENDING order shows critical (default: 20)
 * - VITE_IN_PROGRESS_WARNING_MINUTES: Minutes before an IN_PROGRESS order shows warning (default: 30)
 * 
 * @returns WaitTimeThresholds configuration object
 */
export function getWaitTimeThresholds(): WaitTimeThresholds {
  return {
    pendingWarningMinutes: parseInt(import.meta.env.VITE_PENDING_WARNING_MINUTES || '10', 10),
    pendingCriticalMinutes: parseInt(import.meta.env.VITE_PENDING_CRITICAL_MINUTES || '20', 10),
    inProgressWarningMinutes: parseInt(import.meta.env.VITE_IN_PROGRESS_WARNING_MINUTES || '30', 10),
  };
}
