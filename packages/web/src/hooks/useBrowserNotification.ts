// Custom React hook for browser notifications

import { useCallback } from 'react';

/**
 * Hook for managing browser notifications
 * 
 * Provides functions to request notification permission and show notifications.
 * Handles permission states and automatically checks if tab is in background.
 * 
 * @returns Object with requestPermission and showNotification functions
 * 
 * @example
 * ```tsx
 * function KitchenBoard() {
 *   const { requestPermission, showNotification } = useBrowserNotification();
 *   
 *   // Request permission on first user interaction
 *   useEffect(() => {
 *     const handleFirstClick = async () => {
 *       await requestPermission();
 *       document.removeEventListener('click', handleFirstClick);
 *     };
 *     document.addEventListener('click', handleFirstClick, { once: true });
 *   }, []);
 *   
 *   // Show notification for new order
 *   const handleNewOrder = (order) => {
 *     showNotification(
 *       `New Order - Table ${order.tableNumber}`,
 *       `Order #${order.id} - ${order.items.length} items`
 *     );
 *   };
 * }
 * ```
 */
export function useBrowserNotification(): {
  requestPermission: () => Promise<boolean>;
  showNotification: (title: string, body: string) => void;
} {
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false; // Notifications not supported
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'denied') {
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window)) {
      return; // Notifications not supported
    }
    
    if (Notification.permission !== 'granted') {
      return; // Permission not granted
    }
    
    // Only show notification if tab is in background
    if (!document.hidden) {
      return; // Tab is active, no need for notification
    }
    
    try {
      new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'restaurant-order', // Replace previous notifications
      });
    } catch {
      // Notification failed silently
    }
  }, []);

  return { requestPermission, showNotification };
}
