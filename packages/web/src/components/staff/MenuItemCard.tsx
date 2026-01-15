import { MenuItem } from '@restaurant/shared';
import { memo } from 'react';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;

  return (
    <button
      onClick={() => onClick(item)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 hover:shadow-md dark:hover:shadow-gray-900/70 active:scale-95 transition-all min-h-[44px] min-w-[44px] text-left w-full"
      aria-label={`Add ${item.name} to order`}
      style={{ contain: 'layout style paint' }}
    >
      <div className="flex gap-3 items-start">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-16 h-16 object-cover rounded flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 text-2xl flex-shrink-0">
            🍽️
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
            {item.name}
          </h3>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-base">
            {formatPrice(item.price)}
          </p>
        </div>
      </div>
    </button>
  );
}

// Custom comparison function for React.memo
// Only re-render if item data changes (onClick is stable)
const arePropsEqual = (prevProps: MenuItemCardProps, nextProps: MenuItemCardProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.available === nextProps.item.available &&
    prevProps.item.imageUrl === nextProps.item.imageUrl
  );
};

export default memo(MenuItemCard, arePropsEqual);
