// Socket.io client utility for frontend WebSocket connections

import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@restaurant/shared';

let socket: Socket | null = null;

/**
 * Get or create the Socket.io client singleton
 * Connects to the API server with automatic reconnection
 */
export function getSocket(): Socket {
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    socket = io(apiUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  
  return socket;
}

/**
 * Subscribe to kitchen room for real-time order updates
 * Kitchen display should call this on mount
 */
export function subscribeToKitchen(): void {
  const socket = getSocket();
  socket.emit(SOCKET_EVENTS.JOIN_KITCHEN);
}

/**
 * Unsubscribe from kitchen room
 */
export function unsubscribeFromKitchen(): void {
  const socket = getSocket();
  socket.emit(SOCKET_EVENTS.LEAVE_KITCHEN);
}

/**
 * Subscribe to orders room for staff order status updates
 * Staff views should call this on mount
 */
export function subscribeToOrders(): void {
  const socket = getSocket();
  socket.emit(SOCKET_EVENTS.JOIN_ORDERS);
}

/**
 * Unsubscribe from orders room
 */
export function unsubscribeFromOrders(): void {
  const socket = getSocket();
  socket.emit(SOCKET_EVENTS.LEAVE_ORDERS);
}

/**
 * Disconnect the socket (for cleanup)
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
