import express, { Express } from 'express';
import cors from 'cors';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { config } from './config/index.js';
import { createRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { setupSocketServer } from './socket/index.js';
import { setupSocketHandlers } from './socket/handlers.js';

export function createApp(prisma: PrismaClient, httpServer: HTTPServer): { app: Express; io: SocketIOServer } {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use('/uploads', express.static('uploads'));

  // Routes
  app.use('/api', createRoutes(prisma));

  // Error handling (must be last)
  app.use(errorHandler);

  // Setup Socket.io server
  const io = setupSocketServer(httpServer);
  
  // Setup Socket.io event handlers
  setupSocketHandlers(io);

  return { app, io };
}
