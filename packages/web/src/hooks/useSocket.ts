// Custom React hook for managing WebSocket connection state

import { useState, useEffect } from 'react';
import { getSocket } from '../lib/socket';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface UseSocketReturn {
  socket: ReturnType<typeof getSocket>;
  isConnected: boolean;
  isReconnecting: boolean;
  connectionStatus: ConnectionStatus;
}

/**
 * React hook for monitoring WebSocket connection state
 * 
 * @returns Socket instance and connection state
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isConnected, connectionStatus } = useSocket();
 *   
 *   if (!isConnected) {
 *     return <div>Connecting...</div>;
 *   }
 *   
 *   return <div>Status: {connectionStatus}</div>;
 * }
 * ```
 */
export function useSocket(): UseSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    const socket = getSocket();

    // Set initial state
    if (socket.connected) {
      setConnectionStatus('connected');
    }

    // Connection event handlers
    const handleConnect = () => {
      setConnectionStatus('connected');
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleReconnectAttempt = () => {
      setConnectionStatus('reconnecting');
    };

    const handleReconnect = () => {
      setConnectionStatus('connected');
    };

    // Register listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect', handleReconnect);

    // Cleanup listeners on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect', handleReconnect);
    };
  }, []);

  const socket = getSocket();

  return {
    socket,
    isConnected: connectionStatus === 'connected',
    isReconnecting: connectionStatus === 'reconnecting',
    connectionStatus,
  };
}
