import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';

interface LastUpdatedIndicatorProps {
  lastUpdated: Date;
}

/**
 * Displays relative time since last update and WebSocket connection status
 * 
 * Shows:
 * - 🟢 Connected / 🔴 Disconnected
 * - Relative time: "Updated 5s ago", "Updated 2m ago"
 * 
 * Updates every second while visible
 */
function LastUpdatedIndicator({ lastUpdated }: LastUpdatedIndicatorProps) {
  const { isConnected } = useSocket();
  const [relativeTime, setRelativeTime] = useState<string>('');

  useEffect(() => {
    const updateRelativeTime = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastUpdated.getTime();
      const diffSec = Math.floor(diffMs / 1000);

      if (diffSec < 60) {
        setRelativeTime(`Updated ${diffSec}s ago`);
      } else if (diffSec < 3600) {
        const diffMin = Math.floor(diffSec / 60);
        setRelativeTime(`Updated ${diffMin}m ago`);
      } else {
        const diffHour = Math.floor(diffSec / 3600);
        setRelativeTime(`Updated ${diffHour}h ago`);
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span
        className="text-lg"
        title={isConnected ? 'Connected to server' : 'Disconnected from server'}
        aria-label={isConnected ? 'Connected' : 'Disconnected'}
      >
        {isConnected ? '🟢' : '🔴'}
      </span>
      <span className="text-xs">{relativeTime}</span>
    </div>
  );
}

export default LastUpdatedIndicator;
