// Visual indicator for WebSocket connection status

import { useSocket } from '../../hooks/useSocket';

export interface ConnectionStatusProps {
  /** Optional className for custom positioning */
  className?: string;
  
  /** Show detailed status text alongside indicator */
  showLabel?: boolean;
}

/**
 * ConnectionStatus component displays a visual indicator of the WebSocket connection state
 * 
 * - Green dot: Connected
 * - Yellow pulsing dot: Reconnecting
 * - Red dot: Disconnected
 * 
 * @example
 * ```tsx
 * // In header
 * <header>
 *   <h1>Restaurant Dashboard</h1>
 *   <ConnectionStatus showLabel />
 * </header>
 * 
 * // Corner indicator
 * <ConnectionStatus className="fixed top-4 right-4" />
 * ```
 */
export function ConnectionStatus({ className = '', showLabel = false }: ConnectionStatusProps) {
  const { connectionStatus } = useSocket();

  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      label: 'Connected',
      animation: '',
      ariaLabel: 'WebSocket connected',
    },
    reconnecting: {
      color: 'bg-yellow-500',
      label: 'Reconnecting',
      animation: 'animate-pulse',
      ariaLabel: 'WebSocket reconnecting',
    },
    disconnected: {
      color: 'bg-red-500',
      label: 'Disconnected',
      animation: '',
      ariaLabel: 'WebSocket disconnected',
    },
  };

  const config = statusConfig[connectionStatus];

  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={config.ariaLabel}
    >
      <div className="relative">
        <div 
          className={`w-3 h-3 rounded-full ${config.color} ${config.animation}`}
          title={config.label}
        />
        {connectionStatus === 'reconnecting' && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-yellow-500 opacity-75 animate-ping" />
        )}
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {config.label}
        </span>
      )}
    </div>
  );
}
