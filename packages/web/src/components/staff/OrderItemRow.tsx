import { useState } from 'react';
import { MenuItem } from '@restaurant/shared';
import { useOrder } from '../../contexts/OrderContext';
import SpecialInstructionsModal from './SpecialInstructionsModal';
import ConfirmDialog from '../ui/ConfirmDialog';

interface OrderItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions: string | null;
}

interface OrderItemRowProps {
  item: OrderItem;
}

function OrderItemRow({ item }: OrderItemRowProps) {
  const { updateQuantity, removeItem, updateInstructions } = useOrder();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const price = Number(item.menuItem.price);
  const subtotal = price * item.quantity;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1) {
      updateQuantity(item.menuItemId, newQuantity);
    } else {
      setShowRemoveConfirm(true);
    }
  };

  const handleRemove = () => {
    removeItem(item.menuItemId);
    setShowRemoveConfirm(false);
  };

  const handleInstructionsSave = (instructions: string) => {
    updateInstructions(item.menuItemId, instructions);
    setShowInstructionsModal(false);
  };

  return (
    <>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-medium text-gray-900 truncate">{item.menuItem.name}</h3>
            <p className="text-sm text-gray-600">${price.toFixed(2)} each</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-blue-600">${subtotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Special Instructions Display */}
        {item.specialInstructions && (
          <div className="mb-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
            "{item.specialInstructions}"
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-9 h-9 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:scale-95 transition-transform text-gray-700 font-bold"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center font-medium text-gray-900">{item.quantity}x</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-9 h-9 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:scale-95 transition-transform text-gray-700 font-bold"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add/Edit Instructions Button */}
            <button
              onClick={() => setShowInstructionsModal(true)}
              className="px-3 py-2 min-h-[44px] text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:scale-95 transition-transform text-gray-700"
            >
              {item.specialInstructions ? '📝 Edit' : '+ Instructions'}
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="w-9 h-9 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-red-300 rounded-md hover:bg-red-50 active:scale-95 transition-transform text-red-600 font-bold"
            aria-label="Remove item"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Special Instructions Modal */}
      <SpecialInstructionsModal
        isOpen={showInstructionsModal}
        itemName={item.menuItem.name}
        currentInstructions={item.specialInstructions}
        onSave={handleInstructionsSave}
        onClose={() => setShowInstructionsModal(false)}
      />

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRemoveConfirm}
        title="Remove Item?"
        message={`Remove ${item.menuItem.name} from order?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleRemove}
        onCancel={() => setShowRemoveConfirm(false)}
      />
    </>
  );
}

export default OrderItemRow;
