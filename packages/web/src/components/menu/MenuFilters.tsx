import { Category, FoodType } from '@restaurant/shared';

interface MenuFiltersProps {
  selectedCategory: string;
  selectedFoodType: string;
  onCategoryChange: (category: string) => void;
  onFoodTypeChange: (foodType: string) => void;
}

function MenuFilters({
  selectedCategory,
  selectedFoodType,
  onCategoryChange,
  onFoodTypeChange,
}: MenuFiltersProps) {
  const categories = Object.values(Category);
  const foodTypes = Object.values(FoodType);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
        
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedFoodType}
          onChange={(e) => onFoodTypeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {foodTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default MenuFilters;
