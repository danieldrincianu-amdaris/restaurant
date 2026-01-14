// Socket.io connection event handlers

import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@restaurant/shared';

export function setupSocketHandlers(io: Server): void {
  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Handle kitchen room subscription
    socket.on(SOCKET_EVENTS.JOIN_KITCHEN, () => {
      socket.join('kitchen');
      console.log(`👨‍🍳 ${socket.id} joined kitchen room`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_KITCHEN, () => {
      socket.leave('kitchen');
      console.log(`👨‍🍳 ${socket.id} left kitchen room`);
    });

    // Handle orders room subscription
    socket.on(SOCKET_EVENTS.JOIN_ORDERS, () => {
      socket.join('orders');
      console.log(`📋 ${socket.id} joined orders room`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_ORDERS, () => {
      socket.leave('orders');
      console.log(`📋 ${socket.id} left orders room`);
    });

    // Handle disconnect
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Handle connection errors
    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: Error) => {
      console.error(`⚠️ Connection error for ${socket.id}:`, error.message);
    });
  });
}
