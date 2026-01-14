import { useEffect, useState } from 'react';
import { ConnectionStatus } from '../../components/ui/ConnectionStatus';
import KitchenBoard from '../../components/kitchen/KitchenBoard';

/**
 * KitchenPage - Full-screen kitchen display board
 * 
 * Displays a kanban-style board with orders organized by status columns.
 * Optimized for large displays (kitchen monitors, tablets).
 */
export default function KitchenPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time display every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Kitchen Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-2xl font-bold text-gray-800">
            RestaurantFlow Kitchen
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Mute toggle placeholder - will be implemented in Story 3.8 */}
          <button
            className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            aria-label="Mute notifications"
          >
            🔔
          </button>
          
          <ConnectionStatus />
          
          <time className="text-lg font-medium text-gray-600">
            {formattedTime}
          </time>
        </div>
      </header>

      {/* Kitchen Board - fills remaining viewport height */}
      <main className="flex-1 overflow-hidden">
        <KitchenBoard />
      </main>
    </div>
  );
}
