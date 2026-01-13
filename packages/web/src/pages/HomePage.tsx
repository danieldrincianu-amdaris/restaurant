import { Category, FoodType } from '@restaurant/shared';

function HomePage() {
  // Example usage of shared types to verify import works
  const exampleCategory: Category = Category.APPETIZER;
  const exampleType: FoodType = FoodType.SALAD;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="mb-4">Welcome to RestaurantFlow</h1>
      <p className="text-lg text-gray-600">Select your role to continue</p>
      {/* Type check verification - these will be removed in future stories */}
      <div className="hidden">{exampleCategory} {exampleType}</div>
    </div>
  );
}

export default HomePage;
