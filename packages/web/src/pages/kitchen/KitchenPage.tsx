import { useEffect, useState } from 'react';
import { ConnectionStatus } from '../../components/ui/ConnectionStatus';
import KitchenBoard from '../../components/kitchen/KitchenBoard';
import { useSoundPreference } from '../../hooks/useSoundPreference';
import { usePrioritySortPreference } from '../../hooks/usePrioritySortPreference';

/**
 * KitchenPage - Full-screen kitchen display board
 * 
 * Displays a kanban-style board with orders organized by status columns.
 * Optimized for large displays (kitchen monitors, tablets).
 */
export default function KitchenPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isMuted, toggleMute } = useSoundPreference();
  const [isPrioritySorted, togglePrioritySort] = usePrioritySortPreference();

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
          {/* Priority sort toggle button */}
          <button
            onClick={togglePrioritySort}
            className={`px-3 py-2 rounded-md border transition-colors ${
              isPrioritySorted 
                ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
            aria-label={isPrioritySorted ? 'Priority sort enabled - Click to disable' : 'Priority sort disabled - Click to enable'}
            title={isPrioritySorted ? 'Priority Sort: ON' : 'Priority Sort: OFF'}
          >
            {isPrioritySorted ? '🔴' : '⚪'}
          </button>
          
          {/* Mute/unmute toggle button */}
          <button
            onClick={toggleMute}
            className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            aria-label={isMuted ? 'Sound off - Click to unmute' : 'Sound on - Click to mute'}
            title={isMuted ? 'Sound off' : 'Sound on'}
          >
            {isMuted ? '🔕' : '🔔'}
          </button>
          
          <ConnectionStatus />
          
          <time className="text-lg font-medium text-gray-600">
            {formattedTime}
          </time>
        </div>
      </header>

      {/* Kitchen Board - fills remaining viewport height */}
      <main className="flex-1 overflow-hidden">
        <KitchenBoard isMuted={isMuted} isPrioritySorted={isPrioritySorted} />
      </main>
    </div>
  );
}
