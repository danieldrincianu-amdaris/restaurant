import { OrderItem } from '@restaurant/shared';

interface OrderItemsListProps {
  items: OrderItem[];
}

/**
 * OrderItemsList - Displays order items with quantities and special instructions
 * 
 * Shows each item with quantity prefix and emphasizes special instructions
 * with icon and highlighted background.
 */
export default function OrderItemsList({ items }: OrderItemsListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
        No items in order
      </div>
    );
  }

  // Check if any item has special instructions
  const hasSpecialInstructions = items.some(item => item.specialInstructions);

  return (
    <div className="space-y-2">
      {hasSpecialInstructions && (
        <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mb-2">
          <span>🗒️</span>
          <span>Special instructions</span>
        </div>
      )}
      
      {items.map((item) => (
        <div key={item.id} className="text-sm">
          <div className="text-gray-700 dark:text-gray-200 font-medium">
            {item.quantity}x {item.menuItem?.name || 'Unknown Item'}
          </div>
          
          {item.specialInstructions && (
            <div className="ml-4 mt-1 flex items-start gap-1.5">
              <span className="text-amber-600 dark:text-amber-400 mt-0.5">└─ 🗒️</span>
              <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded">
                "{item.specialInstructions}"
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
