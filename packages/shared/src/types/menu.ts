// Menu-related types for RestaurantFlow

export enum Category {
  APPETIZER = 'APPETIZER',
  MAIN = 'MAIN',
  DRINK = 'DRINK',
  DESSERT = 'DESSERT',
}

export enum FoodType {
  MEAT = 'MEAT',
  PASTA = 'PASTA',
  PIZZA = 'PIZZA',
  SEAFOOD = 'SEAFOOD',
  VEGETARIAN = 'VEGETARIAN',
  SALAD = 'SALAD',
  SOUP = 'SOUP',
  SANDWICH = 'SANDWICH',
  COFFEE = 'COFFEE',
  BEVERAGE = 'BEVERAGE',
  OTHER = 'OTHER',
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  ingredients: string[];
  imageUrl: string | null;
  category: Category;
  foodType: FoodType;
  available: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemInput {
  name: string;
  price: number;
  ingredients: string[];
  imageUrl?: string;
  category: Category;
  foodType?: FoodType;
  available?: boolean;
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {}
