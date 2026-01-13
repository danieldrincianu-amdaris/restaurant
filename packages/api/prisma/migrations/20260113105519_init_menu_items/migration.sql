-- CreateEnum
CREATE TYPE "Category" AS ENUM ('APPETIZER', 'MAIN', 'DRINK', 'DESSERT');

-- CreateEnum
CREATE TYPE "FoodType" AS ENUM ('MEAT', 'PASTA', 'PIZZA', 'SEAFOOD', 'VEGETARIAN', 'SALAD', 'SOUP', 'SANDWICH', 'COFFEE', 'BEVERAGE', 'OTHER');

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "ingredients" TEXT[],
    "imageUrl" TEXT,
    "category" "Category" NOT NULL,
    "foodType" "FoodType" NOT NULL DEFAULT 'OTHER',
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);
