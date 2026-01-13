import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Category, FoodType, OrderStatus } from '@prisma/client';

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
  
  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  
  // Seed menu items
  console.log('Creating menu items...');
  const createdMenuItems = [];
  for (const item of menuItems) {
    const menuItem = await prisma.menuItem.create({ data: item });
    createdMenuItems.push(menuItem);
    console.log(`  Created: ${menuItem.name}`);
  }
  console.log(`Seeded ${menuItems.length} menu items`);

  // Seed sample orders
  console.log('\nCreating sample orders...');
  
  // Order 1: Pending order for table 5
  const order1 = await prisma.order.create({
    data: {
      tableNumber: 5,
      serverName: 'Alice',
      status: OrderStatus.PENDING,
      items: {
        create: [
          {
            menuItemId: createdMenuItems[2].id, // Margherita Pizza
            quantity: 2,
            specialInstructions: 'Extra cheese',
          },
          {
            menuItemId: createdMenuItems[7].id, // Espresso
            quantity: 2,
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log(`  Created Order ${order1.id} (${order1.status}) - Table ${order1.tableNumber}`);

  // Order 2: In-progress order for table 12
  const order2 = await prisma.order.create({
    data: {
      tableNumber: 12,
      serverName: 'Bob',
      status: OrderStatus.IN_PROGRESS,
      items: {
        create: [
          {
            menuItemId: createdMenuItems[0].id, // Bruschetta
            quantity: 1,
          },
          {
            menuItemId: createdMenuItems[4].id, // Grilled Salmon
            quantity: 1,
            specialInstructions: 'No lemon',
          },
          {
            menuItemId: createdMenuItems[5].id, // Caesar Salad
            quantity: 1,
          },
          {
            menuItemId: createdMenuItems[8].id, // Italian Soda
            quantity: 2,
            specialInstructions: 'Strawberry flavor',
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log(`  Created Order ${order2.id} (${order2.status}) - Table ${order2.tableNumber}`);

  // Order 3: Completed order for table 8
  const order3 = await prisma.order.create({
    data: {
      tableNumber: 8,
      serverName: 'Carol',
      status: OrderStatus.COMPLETED,
      items: {
        create: [
          {
            menuItemId: createdMenuItems[3].id, // Spaghetti Carbonara
            quantity: 1,
          },
          {
            menuItemId: createdMenuItems[6].id, // Tiramisu
            quantity: 2,
          },
          {
            menuItemId: createdMenuItems[7].id, // Espresso
            quantity: 1,
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log(`  Created Order ${order3.id} (${order3.status}) - Table ${order3.tableNumber}`);

  console.log(`\nSeeded 3 orders with ${order1.items.length + order2.items.length + order3.items.length} total order items`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
