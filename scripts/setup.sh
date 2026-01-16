#!/bin/bash

# RestaurantFlow Development Environment Setup Script
# This script automates the initial setup of the development environment

set -e  # Exit on error

echo "🚀 RestaurantFlow Development Environment Setup"
echo "================================================"
echo ""

# Check for Node.js
echo "📦 Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION detected"

# Check for pnpm
echo "📦 Checking for pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "⚙️  pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi
PNPM_VERSION=$(pnpm -v)
echo "✅ pnpm $PNPM_VERSION detected"

# Check for Docker (optional but recommended)
echo "🐳 Checking for Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ $DOCKER_VERSION detected"
else
    echo "⚠️  Docker not found. You'll need to manually set up PostgreSQL."
fi

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pnpm install

# Copy .env.example to .env if not exists
echo ""
echo "⚙️  Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
else
    echo "ℹ️  .env file already exists, skipping..."
fi

# Start Docker services
echo ""
echo "🐳 Starting Docker services (PostgreSQL)..."
if command -v docker &> /dev/null; then
    docker compose -f docker-compose.dev.yml up -d
    echo "✅ PostgreSQL started"
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 3
else
    echo "⚠️  Skipping Docker setup. Ensure PostgreSQL is running manually."
fi

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
cd packages/api
pnpm prisma:generate
pnpm prisma:migrate
echo "✅ Database migrations complete"

# Seed database
echo ""
echo "🌱 Seeding database with sample data..."
pnpm prisma:seed
echo "✅ Database seeded"

cd ../..

# Final instructions
echo ""
echo "✨ Setup Complete!"
echo "=================="
echo ""
echo "To start the development server, run:"
echo "  pnpm dev"
echo ""
echo "The application will be available at:"
echo "  🌐 Frontend: http://localhost:5173"
echo "  🚀 API:      http://localhost:3001"
echo "  📚 API Docs: http://localhost:3001/api/docs"
echo ""
echo "Happy coding! 🎉"
