# RestaurantFlow Development Environment Setup Script (Windows)
# This script automates the initial setup of the development environment

Write-Host "🚀 RestaurantFlow Development Environment Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
Write-Host "📦 Checking for Node.js..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}
$nodeVersion = node -v
Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green

# Check for pnpm
Write-Host "📦 Checking for pnpm..." -ForegroundColor Yellow
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "⚙️  pnpm not found. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}
$pnpmVersion = pnpm -v
Write-Host "✅ pnpm $pnpmVersion detected" -ForegroundColor Green

# Check for Docker (optional but recommended)
Write-Host "🐳 Checking for Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVersion = docker --version
    Write-Host "✅ $dockerVersion detected" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker not found. You'll need to manually set up PostgreSQL." -ForegroundColor Yellow
}

# Install dependencies
Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Copy .env.example to .env if not exists
Write-Host ""
Write-Host "⚙️  Setting up environment variables..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .env file already exists, skipping..." -ForegroundColor Cyan
}

# Start Docker services
Write-Host ""
Write-Host "🐳 Starting Docker services (PostgreSQL)..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker compose -f docker-compose.dev.yml up -d
    Write-Host "✅ PostgreSQL started" -ForegroundColor Green
    
    # Wait for database to be ready
    Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
} else {
    Write-Host "⚠️  Skipping Docker setup. Ensure PostgreSQL is running manually." -ForegroundColor Yellow
}

# Run database migrations
Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
Set-Location packages/api
pnpm prisma:generate
pnpm prisma:migrate
Write-Host "✅ Database migrations complete" -ForegroundColor Green

# Seed database
Write-Host ""
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
pnpm prisma:seed
Write-Host "✅ Database seeded" -ForegroundColor Green

Set-Location ../..

# Final instructions
Write-Host ""
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "=================="
Write-Host ""
Write-Host "To start the development server, run:" -ForegroundColor Cyan
Write-Host "  pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Cyan
Write-Host "  🌐 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  🚀 API:      http://localhost:3001" -ForegroundColor White
Write-Host "  📚 API Docs: http://localhost:3001/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green
