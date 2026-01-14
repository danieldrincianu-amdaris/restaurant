// Frontend Socket.io client utility tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SOCKET_EVENTS } from '@restaurant/shared';

// Mock socket.io-client
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connected: false,
  id: 'mock-socket-id',
};

const mockIo = vi.fn(() => mockSocket);

vi.mock('socket.io-client', () => ({
  io: mockIo,
}));

describe('Socket Client Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module cache to ensure fresh import
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create socket singleton on first call', async () => {
    const { getSocket } = await import('../../src/lib/socket');
    
    const socket1 = getSocket();
    const socket2 = getSocket();
    
    expect(socket1).toBe(socket2); // Same instance
    expect(mockIo).toHaveBeenCalledTimes(1); // Only created once
  });

  it('should configure socket with correct options', async () => {
    const { getSocket } = await import('../../src/lib/socket');
    
    getSocket();
    
    expect(mockIo).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })
    );
  });

  it('should use VITE_API_URL environment variable if set', async () => {
    // Set env variable
    import.meta.env.VITE_API_URL = 'http://custom-api.com';
    
    const { getSocket } = await import('../../src/lib/socket');
    getSocket();
    
    expect(mockIo).toHaveBeenCalledWith(
      'http://custom-api.com',
      expect.any(Object)
    );
    
    // Clean up
    delete import.meta.env.VITE_API_URL;
  });

  it('should default to localhost:3001 if VITE_API_URL not set', async () => {
    const { getSocket } = await import('../../src/lib/socket');
    getSocket();
    
    expect(mockIo).toHaveBeenCalledWith(
      'http://localhost:3001',
      expect.any(Object)
    );
  });

  it('should emit JOIN_KITCHEN event when subscribing to kitchen', async () => {
    const { subscribeToKitchen } = await import('../../src/lib/socket');
    
    subscribeToKitchen();
    
    expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.JOIN_KITCHEN);
  });

  it('should emit LEAVE_KITCHEN event when unsubscribing from kitchen', async () => {
    const { unsubscribeFromKitchen } = await import('../../src/lib/socket');
    
    unsubscribeFromKitchen();
    
    expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.LEAVE_KITCHEN);
  });

  it('should emit JOIN_ORDERS event when subscribing to orders', async () => {
    const { subscribeToOrders } = await import('../../src/lib/socket');
    
    subscribeToOrders();
    
    expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.JOIN_ORDERS);
  });

  it('should emit LEAVE_ORDERS event when unsubscribing from orders', async () => {
    const { unsubscribeFromOrders } = await import('../../src/lib/socket');
    
    unsubscribeFromOrders();
    
    expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.LEAVE_ORDERS);
  });

  it('should disconnect and clean up socket', async () => {
    const { getSocket, disconnectSocket } = await import('../../src/lib/socket');
    
    getSocket(); // Create socket
    disconnectSocket();
    
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should allow multiple subscribe/unsubscribe calls', async () => {
    const { subscribeToKitchen, unsubscribeFromKitchen } = await import('../../src/lib/socket');
    
    subscribeToKitchen();
    unsubscribeFromKitchen();
    subscribeToKitchen();
    
    expect(mockSocket.emit).toHaveBeenCalledTimes(3);
    expect(mockSocket.emit).toHaveBeenNthCalledWith(1, SOCKET_EVENTS.JOIN_KITCHEN);
    expect(mockSocket.emit).toHaveBeenNthCalledWith(2, SOCKET_EVENTS.LEAVE_KITCHEN);
    expect(mockSocket.emit).toHaveBeenNthCalledWith(3, SOCKET_EVENTS.JOIN_KITCHEN);
  });
});
