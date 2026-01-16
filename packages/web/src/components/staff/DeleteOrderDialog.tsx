import { useEffect } from 'react';
import { Order } from '@restaurant/shared';

interface DeleteOrderDialogProps {
  isOpen: boolean;
  order: Order | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteOrderDialog({
  isOpen,
  order,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteOrderDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !order) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  const orderId = order.id.slice(-6);
  const itemCount = order.items.length;
  const total = order.items.reduce((sum, item) => {
    const price = item.menuItem?.price ? parseFloat(String(item.menuItem.price)) : 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Order</h2>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
            <span className="font-medium text-gray-900 dark:text-white">#{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Table:</span>
            <span className="font-medium text-gray-900 dark:text-white">{order.tableNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Server:</span>
            <span className="font-medium text-gray-900 dark:text-white">{order.serverName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Items:</span>
            <span className="font-medium text-gray-900 dark:text-white">{itemCount}</span>
          </div>
          {total > 0 && (
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <span className="font-medium text-gray-900 dark:text-white">${total.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-6">
          <p className="text-sm text-red-800 dark:text-red-200">
            <span className="font-semibold">⚠️ Warning:</span> This action cannot be undone. The order and all associated items will be permanently deleted.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 rounded-md font-medium bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteOrderDialog;
