import { MenuItem } from '@restaurant/shared';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;

  return (
    <button
      onClick={() => onClick(item)}
      className="bg-white rounded-lg shadow p-4 hover:shadow-md active:scale-95 transition-all min-h-[44px] min-w-[44px] text-left w-full"
      aria-label={`Add ${item.name} to order`}
    >
      <div className="flex gap-3 items-start">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-16 h-16 object-cover rounded flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-2xl flex-shrink-0">
            🍽️
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {item.name}
          </h3>
          <p className="text-blue-600 font-bold text-base">
            {formatPrice(item.price)}
          </p>
        </div>
      </div>
    </button>
  );
}

export default MenuItemCard;
