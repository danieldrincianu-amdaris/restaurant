// Tests for useSocket hook

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSocket } from '../../src/hooks/useSocket';

// Mock the socket module
const mockSocket = {
  connected: true,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

vi.mock('../../src/lib/socket', () => ({
  getSocket: vi.fn(() => mockSocket),
}));

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return socket instance and connected state when socket is connected', () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.socket).toBe(mockSocket);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isReconnecting).toBe(false);
    expect(result.current.connectionStatus).toBe('connected');
  });

  it('should return disconnected state when socket is not connected', () => {
    mockSocket.connected = false;

    const { result } = renderHook(() => useSocket());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionStatus).toBe('disconnected');
  });

  it('should register event listeners on mount', () => {
    renderHook(() => useSocket());

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('reconnect_attempt', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('reconnect', expect.any(Function));
  });

  it('should update state to connected when connect event fires', async () => {
    let connectHandler: (() => void) | undefined;
    mockSocket.on.mockImplementation((event, handler) => {
      if (event === 'connect') {
        connectHandler = handler as () => void;
      }
    });

    const { result } = renderHook(() => useSocket());

    // Initially disconnected
    expect(result.current.connectionStatus).toBe('connected');

    // Trigger connect event
    act(() => {
      if (connectHandler) connectHandler();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.connectionStatus).toBe('connected');
    });
  });

  it('should update state to disconnected when disconnect event fires', async () => {
    let disconnectHandler: (() => void) | undefined;
    mockSocket.on.mockImplementation((event, handler) => {
      if (event === 'disconnect') {
        disconnectHandler = handler as () => void;
      }
    });

    const { result } = renderHook(() => useSocket());

    // Trigger disconnect event
    act(() => {
      if (disconnectHandler) disconnectHandler();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionStatus).toBe('disconnected');
    });
  });

  it('should update state to reconnecting when reconnect_attempt event fires', async () => {
    let reconnectAttemptHandler: (() => void) | undefined;
    mockSocket.on.mockImplementation((event, handler) => {
      if (event === 'reconnect_attempt') {
        reconnectAttemptHandler = handler as () => void;
      }
    });

    const { result } = renderHook(() => useSocket());

    // Trigger reconnect_attempt event
    act(() => {
      if (reconnectAttemptHandler) reconnectAttemptHandler();
    });

    await waitFor(() => {
      expect(result.current.isReconnecting).toBe(true);
      expect(result.current.connectionStatus).toBe('reconnecting');
    });
  });

  it('should update state back to connected when reconnect event fires', async () => {
    let reconnectHandler: (() => void) | undefined;
    mockSocket.on.mockImplementation((event, handler) => {
      if (event === 'reconnect') {
        reconnectHandler = handler as () => void;
      }
    });

    const { result } = renderHook(() => useSocket());

    // Trigger reconnect event
    act(() => {
      if (reconnectHandler) reconnectHandler();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.connectionStatus).toBe('connected');
    });
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useSocket());

    // Clear previous calls
    vi.clearAllMocks();

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('reconnect_attempt', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('reconnect', expect.any(Function));
  });
});
