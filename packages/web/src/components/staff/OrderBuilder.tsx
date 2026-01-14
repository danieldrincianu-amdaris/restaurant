import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../contexts/OrderContext';
import { useCreateOrder } from '../../hooks/useCreateOrder';
import { useUpdateOrder } from '../../hooks/useUpdateOrder';
import { useToast } from '../../contexts/ToastContext';
import OrderItemRow from './OrderItemRow';
import ConfirmDialog from '../ui/ConfirmDialog';

function OrderBuilder() {
  const {
    items,
    tableNumber,
    serverName,
    orderId,
    isEditMode,
    originalItems,
    setTableNumber,
    setServerName,
    clearOrder,
  } = useOrder();
  const { createOrder, isSubmitting: isCreating } = useCreateOrder();
  const { updateOrder, addOrderItem, updateOrderItem, removeOrderItem, isUpdating } =
    useUpdateOrder();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isSubmitting = isCreating || isUpdating;

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.menuItem ? Number(item.menuItem.price) * item.quantity : 0), 0),
    [items]
  );

  const canSubmit = items.length > 0 && tableNumber !== null && serverName.trim() !== '';

  // Detect changes for edit mode
  const hasChanges = useMemo(() => {
    if (!isEditMode) return false;

    // Check if items have changed
    if (items.length !== originalItems.length) return true;

    // Check each item for differences
    return items.some((item) => {
      const original = originalItems.find((o) => o.id === item.id);
      if (!original) return true; // New item
      return (
        original.quantity !== item.quantity ||
        original.specialInstructions !== item.specialInstructions
      );
    });
  }, [isEditMode, items, originalItems]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      if (isEditMode && orderId) {
        // Edit mode: Calculate changes and apply them
        const addedItems = items.filter(
          (item) => !originalItems.some((o) => o.id === item.id)
        );
        const removedItems = originalItems.filter(
          (original) => !items.some((i) => i.id === original.id)
        );
        const modifiedItems = items.filter((item) => {
          const original = originalItems.find((o) => o.id === item.id);
          return (
            original &&
            (original.quantity !== item.quantity ||
              original.specialInstructions !== item.specialInstructions)
          );
        });

        // Apply changes
        for (const item of addedItems) {
          await addOrderItem(orderId, {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || undefined,
          });
        }

        for (const item of modifiedItems) {
          if (item.id) {
            await updateOrderItem(orderId, item.id, {
              quantity: item.quantity,
              specialInstructions: item.specialInstructions || undefined,
            });
          }
        }

        for (const item of removedItems) {
          if (item.id) {
            await removeOrderItem(orderId, item.id);
          }
        }

        // Update order metadata
        await updateOrder(orderId, {
          tableNumber: tableNumber!,
          serverName,
        });

        showToast(`Order #${orderId.slice(-6)} updated`, 'success');
        navigate('/staff/orders');
      } else {
        // Create mode: Submit new order
        const order = await createOrder({
          tableNumber: tableNumber!,
          serverName,
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || undefined,
          })),
        });

        showToast(`Order #${order.id} submitted to kitchen`, 'success');
        clearOrder();
        navigate('/staff/orders');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit order';
      showToast(errorMessage, 'error');
    }
  };

  const handleClear = () => {
    if (items.length > 0) {
      setShowClearConfirm(true);
    } else {
      clearOrder();
    }
  };

  const confirmClear = () => {
    clearOrder();
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? `Order #${orderId?.slice(-6)}` : 'Order #NEW'}
        </h2>
        
        {/* Table Number and Server Name Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Table Number *
            </label>
            <input
              id="tableNumber"
              type="number"
              min="1"
              value={tableNumber ?? ''}
              onChange={(e) => setTableNumber(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Table #"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="serverName" className="block text-sm font-medium text-gray-700 mb-1">
              Server Name *
            </label>
            <input
              id="serverName"
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="Server name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 font-medium">No items yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Select items from the menu to start building an order
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <OrderItemRow key={item.menuItemId} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Running Total */}
      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleClear}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 min-h-[44px] text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting || (isEditMode && !hasChanges)}
          title={
            !canSubmit
              ? 'Enter table number, server name, and add at least one item'
              : isEditMode && !hasChanges
                ? 'No changes to save'
                : ''
          }
          className="flex-1 px-4 py-3 min-h-[44px] bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {isSubmitting
            ? isEditMode
              ? 'Saving...'
              : 'Submitting...'
            : isEditMode
              ? 'Save Changes ✓'
              : 'Submit Order ▶'}
        </button>
      </div>

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Order"
        message="Clear this order? All items will be removed."
        confirmLabel="Clear"
        onConfirm={confirmClear}
        onCancel={() => setShowClearConfirm(false)}
        variant="destructive"
      />
    </div>
  );
}

export default OrderBuilder;
