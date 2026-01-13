import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Category, FoodType } from '@prisma/client';

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const menuItems = [
  {
    name: 'Bruschetta',
    price: 8.99,
    ingredients: ['tomatoes', 'basil', 'garlic', 'olive oil', 'baguette'],
    category: Category.APPETIZER,
    foodType: FoodType.VEGETARIAN,
    available: true,
  },
  {
    name: 'Calamari Fritti',
    price: 12.99,
    ingredients: ['squid', 'flour', 'lemon', 'marinara sauce'],
    category: Category.APPETIZER,
    foodType: FoodType.SEAFOOD,
    available: true,
  },
  {
    name: 'Margherita Pizza',
    price: 16.99,
    ingredients: ['tomato sauce', 'mozzarella', 'basil', 'olive oil'],
    category: Category.MAIN,
    foodType: FoodType.PIZZA,
    available: true,
  },
  {
    name: 'Spaghetti Carbonara',
    price: 18.99,
    ingredients: ['spaghetti', 'eggs', 'pecorino', 'guanciale', 'black pepper'],
    category: Category.MAIN,
    foodType: FoodType.PASTA,
    available: true,
  },
  {
    name: 'Grilled Salmon',
    price: 24.99,
    ingredients: ['salmon fillet', 'lemon', 'herbs', 'vegetables'],
    category: Category.MAIN,
    foodType: FoodType.SEAFOOD,
    available: true,
  },
  {
    name: 'Caesar Salad',
    price: 11.99,
    ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'caesar dressing'],
    category: Category.MAIN,
    foodType: FoodType.SALAD,
    available: true,
  },
  {
    name: 'Tiramisu',
    price: 8.99,
    ingredients: ['mascarpone', 'espresso', 'ladyfingers', 'cocoa'],
    category: Category.DESSERT,
    foodType: FoodType.OTHER,
    available: true,
  },
  {
    name: 'Espresso',
    price: 3.50,
    ingredients: ['espresso beans'],
    category: Category.DRINK,
    foodType: FoodType.COFFEE,
    available: true,
  },
  {
    name: 'Italian Soda',
    price: 4.99,
    ingredients: ['sparkling water', 'flavored syrup', 'cream'],
    category: Category.DRINK,
    foodType: FoodType.BEVERAGE,
    available: true,
  },
  {
    name: 'Beef Bolognese',
    price: 19.99,
    ingredients: ['ground beef', 'tomatoes', 'onion', 'carrots', 'celery', 'pappardelle'],
    category: Category.MAIN,
    foodType: FoodType.MEAT,
    available: false,
  },
];

async function main() {
  console.log('Seeding database...');
  
  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
    console.log(`  Created: ${item.name}`);
  }
  
  console.log(`Seeded ${menuItems.length} menu items`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
