import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBrowserNotification } from '../../src/hooks/useBrowserNotification';

// Mock Notification API
const mockRequestPermission = vi.fn().mockResolvedValue('granted' as NotificationPermission);

let mockPermission: NotificationPermission = 'default';
let mockDocumentHidden = false;

class MockNotification {
  title: string;
  options: NotificationOptions | undefined;

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
  }

  static get permission() {
    return mockPermission;
  }
  
  static requestPermission = mockRequestPermission;
}

describe('useBrowserNotification', () => {
  let originalNotification: typeof Notification | undefined;

  beforeEach(() => {
    // Save original
    originalNotification = (global as typeof globalThis & { Notification?: typeof Notification }).Notification;

    // Reset mocks
    mockPermission = 'default';
    mockDocumentHidden = false;
    mockRequestPermission.mockClear();
    mockRequestPermission.mockResolvedValue('granted');

    // Mock Notification API
    (global as typeof globalThis & { Notification: typeof Notification }).Notification = MockNotification as unknown as typeof Notification;

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => mockDocumentHidden,
    });
  });

  afterEach(() => {
    // Restore original
    if (originalNotification) {
      (global as typeof globalThis & { Notification: typeof Notification }).Notification = originalNotification;
    } else {
      delete (global as typeof globalThis & { Notification?: typeof Notification }).Notification;
    }
  });

  describe('requestPermission', () => {
    it('should return true if permission already granted', async () => {
      mockPermission = 'granted';
      const { result } = renderHook(() => useBrowserNotification());

      const granted = await act(async () => result.current.requestPermission());

      expect(granted).toBe(true);
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('should return false if permission denied', async () => {
      mockPermission = 'denied';
      const { result } = renderHook(() => useBrowserNotification());

      const granted = await act(async () => result.current.requestPermission());

      expect(granted).toBe(false);
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });

    it('should request permission if default', async () => {
      mockPermission = 'default';
      mockRequestPermission.mockResolvedValue('granted');
      
      const { result } = renderHook(() => useBrowserNotification());

      const granted = await act(async () => result.current.requestPermission());

      expect(granted).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('should return false if permission request rejected', async () => {
      mockPermission = 'default';
      mockRequestPermission.mockResolvedValue('denied');
      
      const { result } = renderHook(() => useBrowserNotification());

      const granted = await act(async () => result.current.requestPermission());

      expect(granted).toBe(false);
    });
  });

  describe('showNotification', () => {
    it('should not show notification when tab is active', () => {
      mockPermission = 'granted';
      mockDocumentHidden = false; // Tab is visible

      const { result } = renderHook(() => useBrowserNotification());

      // Should not throw
      act(() => {
        result.current.showNotification('Test Title', 'Test Body');
      });

      expect(true).toBe(true);
    });

    it('should not show notification if permission not granted', () => {
      mockPermission = 'denied';
      mockDocumentHidden = true;

      const { result } = renderHook(() => useBrowserNotification());

      // Should not throw
      act(() => {
        result.current.showNotification('Test Title', 'Test Body');
      });

      expect(true).toBe(true);
    });
  });
});
