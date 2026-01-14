// Socket.io server integration tests

import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { prisma, connectDatabase, disconnectDatabase } from '../src/lib/prisma.js';
import { SOCKET_EVENTS } from '@restaurant/shared';

describe('Socket.io Server', () => {
  let httpServer: ReturnType<typeof createServer>;
  let io: SocketIOServer;
  let clientSocket: ClientSocket;
  let serverPort: number;

  beforeAll(async () => {
    await connectDatabase();
    
    // Create server on random available port for testing
    httpServer = createServer();
    const result = createApp(prisma, httpServer);
    io = result.io;
    
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        const address = httpServer.address();
        if (address && typeof address === 'object') {
          serverPort = address.port;
          resolve();
        }
      });
    });
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  afterAll(async () => {
    io.close();
    httpServer.close();
    await disconnectDatabase();
  });

  it('should allow client to connect', async () => {
    return new Promise<void>((resolve, reject) => {
      clientSocket = ioc(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        resolve();
      });

      clientSocket.on('connect_error', (error) => {
        reject(error);
      });
    });
  });

  it('should handle client disconnection', async () => {
    return new Promise<void>((resolve) => {
      clientSocket = ioc(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        clientSocket.disconnect();
      });

      clientSocket.on('disconnect', () => {
        expect(clientSocket.connected).toBe(false);
        resolve();
      });
    });
  });

  it('should allow client to join kitchen room', async () => {
    return new Promise<void>((resolve) => {
      clientSocket = ioc(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        clientSocket.emit(SOCKET_EVENTS.JOIN_KITCHEN);
        
        // Give server time to process room join
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          resolve();
        }, 100);
      });
    });
  });

  it('should allow client to leave kitchen room', async () => {
    return new Promise<void>((resolve) => {
      clientSocket = ioc(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        clientSocket.emit(SOCKET_EVENTS.JOIN_KITCHEN);
        
        setTimeout(() => {
          clientSocket.emit(SOCKET_EVENTS.LEAVE_KITCHEN);
          
          setTimeout(() => {
            expect(clientSocket.connected).toBe(true);
            resolve();
          }, 100);
        }, 100);
      });
    });
  });

  it('should allow client to join orders room', async () => {
    return new Promise<void>((resolve) => {
      clientSocket = ioc(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        clientSocket.emit(SOCKET_EVENTS.JOIN_ORDERS);
        
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          resolve();
        }, 100);
      });
    });
  });

  it('should allow client to leave orders room', async () => {
    return new Promise<void>((resolve) => {
      clientSocket = ioc(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
      });

      clientSocket.on('connect', () => {
        clientSocket.emit(SOCKET_EVENTS.JOIN_ORDERS);
        
        setTimeout(() => {
          clientSocket.emit(SOCKET_EVENTS.LEAVE_ORDERS);
          
          setTimeout(() => {
            expect(clientSocket.connected).toBe(true);
            resolve();
          }, 100);
        }, 100);
      });
    });
  });

  it('should handle reconnection', async () => {
    return new Promise<void>((resolve) => {
      clientSocket = ioc(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 100,
      });

      let connectCount = 0;

      clientSocket.on('connect', () => {
        connectCount++;
        
        if (connectCount === 1) {
          // First connection - disconnect to trigger reconnection
          clientSocket.disconnect();
          clientSocket.connect();
        } else if (connectCount === 2) {
          // Reconnected successfully
          expect(clientSocket.connected).toBe(true);
          resolve();
        }
      });
    });
  });

  it('should accept CORS from configured origin', async () => {
    return new Promise<void>((resolve, reject) => {
      clientSocket = ioc(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
        extraHeaders: {
          origin: 'http://localhost:5173',
        },
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        resolve();
      });

      clientSocket.on('connect_error', (error) => {
        reject(new Error(`CORS test failed: ${error.message}`));
      });
    });
  });
});
