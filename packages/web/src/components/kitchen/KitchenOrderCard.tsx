import { Order, OrderStatus } from '@restaurant/shared';
import { useElapsedTime } from '../../lib/timeUtils';
import { useWaitTimeAlert, type AlertLevel } from '../../hooks/useWaitTimeAlert';
import { getWaitTimeThresholds } from '../../config/waitTimeThresholds';
import OrderItemsList from './OrderItemsList';

interface KitchenOrderCardProps {
  order: Order;
  status: OrderStatus;
  onClick?: () => void;
}

const statusConfig = {
  [OrderStatus.PENDING]: {
    borderColor: 'border-blue-500',
  },
  [OrderStatus.IN_PROGRESS]: {
    borderColor: 'border-amber-500',
  },
  [OrderStatus.HALTED]: {
    borderColor: 'border-gray-600',
  },
  [OrderStatus.COMPLETED]: {
    borderColor: 'border-green-500',
  },
  [OrderStatus.CANCELED]: {
    borderColor: 'border-red-500',
  },
};

const getAlertBorderColor = (status: OrderStatus, alertLevel: AlertLevel): string => {
  // Alert colors override status colors for active orders
  if (alertLevel === 'critical') {
    return 'border-red-500 animate-pulse-critical';
  }
  if (alertLevel === 'warning') {
    return 'border-amber-500 animate-pulse-warning';
  }
  // Default to status color
  return statusConfig[status].borderColor;
};

const getAlertTooltip = (status: OrderStatus, alertLevel: AlertLevel, elapsedMinutes: number): string | undefined => {
  const thresholds = getWaitTimeThresholds();
  
  if (alertLevel === 'none') {
    return undefined;
  }

  const statusLabel = status === OrderStatus.PENDING ? 'pending' : 'in progress';
  
  if (alertLevel === 'critical') {
    return `Order has been ${statusLabel} for ${elapsedMinutes} minutes - critical threshold: ${thresholds.pendingCriticalMinutes}min`;
  }
  
  if (alertLevel === 'warning') {
    const threshold = status === OrderStatus.PENDING 
      ? thresholds.pendingWarningMinutes 
      : thresholds.inProgressWarningMinutes;
    return `Order has been ${statusLabel} for ${elapsedMinutes} minutes - warning threshold: ${threshold}min`;
  }
};

/**
 * KitchenOrderCard - Displays full order details in kitchen display
 * 
 * Shows order ID, table number, time elapsed, items with special instructions,
 * and server name. Updates time elapsed every minute.
 * 
 * Wait time alerts:
 * - Warning (yellow): PENDING >10min, IN_PROGRESS >30min
 * - Critical (red): PENDING >20min
 */
export default function KitchenOrderCard({ order, status, onClick }: KitchenOrderCardProps) {
  const elapsedTime = useElapsedTime(order.createdAt);
  const thresholds = getWaitTimeThresholds();
  const alertLevel = useWaitTimeAlert(order.createdAt, status, thresholds);
  const hasSpecialInstructions = order.items.some(item => item.specialInstructions);
  
  const borderColor = getAlertBorderColor(status, alertLevel);
  const alertTooltip = getAlertTooltip(status, alertLevel, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000));

  return (
    <div
      onClick={onClick}
      className={`border-l-4 ${borderColor} bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer min-h-[120px] max-h-[300px] flex flex-col`}
      role="button"
      tabIndex={0}
      aria-label={`Order ${order.id.slice(-6)} for table ${order.tableNumber}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Card Header */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-gray-800">
            #{order.id.slice(-6)}
          </span>
          <span className="text-sm text-gray-600">
            Table {order.tableNumber}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1" title={alertTooltip}>
            <span>⏱️</span>
            <span>{elapsedTime}</span>
            {alertLevel !== 'none' && (
              <span className={alertLevel === 'critical' ? 'text-red-500' : 'text-amber-500'}>
                ⚠️
              </span>
            )}
          </div>
          
          {hasSpecialInstructions && (
            <span className="text-amber-600" title="Has special instructions">
              🗒️
            </span>
          )}
        </div>
      </div>

      {/* Card Body - Scrollable Items List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <OrderItemsList items={order.items} />
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <div className="text-xs text-gray-500">
          Server: <span className="font-medium text-gray-700">{order.serverName}</span>
        </div>
      </div>
    </div>
  );
}
