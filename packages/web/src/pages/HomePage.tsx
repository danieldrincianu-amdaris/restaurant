import { Link } from 'react-router-dom';
import { Category, FoodType } from '@restaurant/shared';

function HomePage() {
  // Example usage of shared types to verify import works
  const exampleCategory: Category = Category.APPETIZER;
  const exampleType: FoodType = FoodType.SALAD;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="mb-4 text-3xl font-bold">Welcome to RestaurantFlow</h1>
      <p className="text-lg text-gray-600 mb-8">Select your role to continue</p>
      
      <div className="flex gap-4">
        <Link 
          to="/staff/orders/new" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          📝 New Order
        </Link>
        <Link 
          to="/staff/orders" 
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          📋 View Orders
        </Link>
        <Link 
          to="/admin/menu" 
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          🍽️ Menu Management
        </Link>
      </div>
      
      {/* Type check verification - these will be removed in future stories */}
      <div className="hidden">{exampleCategory} {exampleType}</div>
    </div>
  );
}

export default HomePage;
