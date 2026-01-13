import { MenuItem } from '@restaurant/shared';

interface MenuItemTableProps {
  items: MenuItem[];
  onToggleAvailability: (id: string, available: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function MenuItemTable({ items, onToggleAvailability, onEdit, onDelete }: MenuItemTableProps) {
  const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Available
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-2xl">
                    🍽️
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {item.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatPrice(item.price)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {item.category}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {item.foodType}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleAvailability(item.id, !item.available)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    item.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                  aria-label={`Toggle availability for ${item.name}`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    item.available ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {item.available ? 'Available' : 'Unavailable'}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(item.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    aria-label={`Edit ${item.name}`}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    aria-label={`Delete ${item.name}`}
                  >
                    🗑 Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MenuItemTable;
