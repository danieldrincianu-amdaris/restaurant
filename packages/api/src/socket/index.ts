// Socket.io server setup

import { Server as HTTPServer } from 'http';
import { Server, ServerOptions } from 'socket.io';
import { config } from '../config/index.js';

export function setupSocketServer(httpServer: HTTPServer): Server {
  const socketOptions: Partial<ServerOptions> = {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  };

  const io = new Server(httpServer, socketOptions);
  
  console.log('✅ Socket.io server initialized');
  
  return io;
}
