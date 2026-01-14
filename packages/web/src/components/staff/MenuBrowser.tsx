import { useState, useMemo } from 'react';
import { MenuItem, Category, FoodType } from '@restaurant/shared';
import { useAvailableMenuItems } from '../../hooks/useAvailableMenuItems';
import MenuItemCard from './MenuItemCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface MenuBrowserProps {
  onSelectItem: (item: MenuItem) => void;
}

function MenuBrowser({ onSelectItem }: MenuBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFoodType, setSelectedFoodType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { items, isLoading, error } = useAvailableMenuItems(
    selectedCategory,
    selectedFoodType
  );

  // Client-side filtering for search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const categories = Object.values(Category);
  const foodTypes = Object.values(FoodType);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Error loading menu items</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Input */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="🔍 Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Food Type Filter */}
      <div className="px-4 py-3 border-b border-gray-200">
        <select
          value={selectedFoodType}
          onChange={(e) => setSelectedFoodType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {foodTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onClick={onSelectItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuBrowser;
