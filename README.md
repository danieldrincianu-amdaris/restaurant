# RestaurantFlow

A modern, self-hosted restaurant order and menu management system built with TypeScript, React, and Express.

## ✨ Features

- **🍽️ Menu Management** - Create, edit, and organize menu items with categories and food types
- **📋 Order Management** - Take and track customer orders with real-time updates
- **👨‍🍳 Kitchen Display** - Real-time order queue with drag-and-drop status management
- **🖨️ Kitchen Tickets** - Print thermal receipt-style tickets with QR codes for order tracking
- **⚡ Real-time Updates** - WebSocket-powered live updates across all devices
- **📱 Responsive Design** - Works seamlessly on desktop and tablet devices
- **🌙 Dark Mode** - Full dark mode support for comfortable viewing

## 🏗️ Architecture

RestaurantFlow is built as a monorepo with three packages:

```mermaid
graph TD
    A[Web Frontend - React + Vite] --> B[API Server - Express + Socket.io]
    B --> C[PostgreSQL Database]
    A --> D[Shared Types Package]
    B --> D
```

### Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, React Router, Socket.io Client
- **Backend**: Express 4, TypeScript, Socket.io, Prisma ORM
- **Database**: PostgreSQL 16
- **Dev Tools**: Vite, tsx, Vitest, Docker

## 🚀 Quick Start (< 5 minutes)

### Prerequisites

- **Node.js** 20.0.0 or higher
- **pnpm** 8.0.0 or higher
- **Docker** (for PostgreSQL database)

### Option 1: Automated Setup (Recommended)

**Windows:**
```powershell
.\scripts\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file
cp .env.example .env

# 3. Start PostgreSQL database
docker compose -f docker-compose.dev.yml up -d

# 4. Run database migrations
cd packages/api
pnpm prisma:generate
pnpm prisma:migrate

# 5. Seed sample data (optional)
pnpm prisma:seed

# 6. Start development servers
cd ../..
pnpm dev
```

### Access the Application

- 🌐 **Frontend**: http://localhost:5173
- 🚀 **API**: http://localhost:3001
- 📚 **API Documentation**: http://localhost:3001/api/docs
- 🗄️ **Database Studio**: Run `pnpm --filter @restaurant/api prisma:studio`

## 📖 Documentation

- **[API Documentation](http://localhost:3001/api/docs)** - Interactive Swagger/OpenAPI docs
- **[User Guide](./docs/user-guide.md)** - End-user documentation for staff
- **[Architecture](./docs/architecture.md)** - Detailed architecture documentation
- **[PRD](./docs/prd.md)** - Product Requirements Document

## 📜 Available Scripts

### Workspace Root

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all packages in development mode with hot reload |
| `pnpm build` | Build all packages for production |
| `pnpm test` | Run tests across all packages |
| `pnpm lint` | Lint all TypeScript files |
| `pnpm lint:fix` | Lint and auto-fix issues |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Type-check all packages |

### API Package (`packages/api`)

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start API server with hot reload (tsx watch) |
| `pnpm build` | Compile TypeScript to JavaScript |
| `pnpm start` | Start production server |
| `pnpm test` | Run API tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm prisma:migrate` | Run database migrations |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:seed` | Seed database with sample data |
| `pnpm prisma:studio` | Open Prisma Studio GUI |

### Web Package (`packages/web`)

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run frontend tests |
| `pnpm test:watch` | Run tests in watch mode |

## 📁 Project Structure

```
restaurant/
├── packages/
│   ├── api/                    # Backend API server
│   │   ├── src/
│   │   │   ├── routes/         # API route handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── schemas/        # Zod validation schemas
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── socket/         # WebSocket handlers
│   │   │   ├── config/         # Configuration (Swagger, etc.)
│   │   │   └── lib/            # Utilities
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   ├── migrations/     # Database migrations
│   │   │   └── seed.ts         # Sample data
│   │   └── tests/              # API tests
│   ├── web/                    # Frontend React app
│   │   ├── src/
│   │   │   ├── pages/          # Page components
│   │   │   ├── components/     # Reusable components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── contexts/       # React contexts
│   │   │   ├── router/         # React Router config
│   │   │   └── lib/            # Utilities
│   │   └── tests/              # Frontend tests
│   └── shared/                 # Shared TypeScript types
│       └── src/
│           └── types/          # Type definitions
├── docs/                       # Documentation
│   ├── stories/                # User stories
│   ├── qa/                     # QA gates and reports
│   ├── user-guide.md           # End-user guide
│   ├── architecture.md         # Architecture docs
│   └── prd.md                  # Product requirements
├── scripts/                    # Setup scripts
│   ├── setup.sh                # Unix setup script
│   └── setup.ps1               # Windows setup script
├── docker-compose.dev.yml      # Docker services for dev
├── pnpm-workspace.yaml         # pnpm workspace config
└── package.json                # Workspace root

```

## 🔧 Environment Variables

### Backend (API)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `NODE_ENV` | `development` | Environment mode (development/production/test) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin for frontend |
| `DATABASE_URL` | `postgresql://restaurant:restaurant_dev@localhost:5432/restaurant` | PostgreSQL connection string |

### Frontend (Web)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001/api` | Backend API URL |
| `VITE_RESTAURANT_NAME` | `RestaurantFlow` | Restaurant name for printed kitchen tickets |
| `VITE_PENDING_WARNING_MINUTES` | `10` | Minutes before pending orders show warning |
| `VITE_PENDING_CRITICAL_MINUTES` | `20` | Minutes before pending orders show critical alert |
| `VITE_IN_PROGRESS_WARNING_MINUTES` | `30` | Minutes before in-progress orders show warning |

See [`.env.example`](./.env.example) for complete documentation.

## 🗄️ Database Management

### Start/Stop Database

```bash
# Start PostgreSQL in Docker
docker compose -f docker-compose.dev.yml up -d

# Stop database
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (deletes data)
docker compose -f docker-compose.dev.yml down -v
```

### Migrations

```bash
# Create a new migration
cd packages/api
pnpm prisma migrate dev --name your_migration_name

# Apply migrations
pnpm prisma:migrate

# Reset database (destructive)
pnpm prisma migrate reset
```

### Seed Data

```bash
cd packages/api
pnpm prisma:seed
```

This creates:
- 12 sample menu items across all categories
- 3 sample orders in various states

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @restaurant/api test
pnpm --filter @restaurant/web test

# Watch mode
pnpm --filter @restaurant/api test:watch

# Run tests with coverage
pnpm --filter @restaurant/api test --coverage
```

## 🐛 Troubleshooting

### Port Already in Use

If port 3001 (API) or 5173 (web) is already in use:

```bash
# Windows - Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac - Find and kill process
lsof -ti:3001 | xargs kill -9
```

Or change the port in `.env`:
```env
PORT=3002  # API
```

### Database Connection Failed

1. Ensure Docker is running
2. Verify PostgreSQL container is up:
   ```bash
   docker ps
   ```
3. Check DATABASE_URL in `.env` matches docker-compose.dev.yml
4. Restart database:
   ```bash
   docker compose -f docker-compose.dev.yml restart
   ```

### Hot Module Replacement Not Working

1. **API**: The API uses `tsx watch` which should auto-restart on file changes. If not working, check for syntax errors.
2. **Web**: Vite HMR is enabled by default. If not working:
   - Clear Vite cache: `rm -rf packages/web/node_modules/.vite`
   - Restart dev server

### TypeScript Errors

```bash
# Regenerate Prisma client
cd packages/api
pnpm prisma:generate

# Type-check all packages
pnpm typecheck
```

### Test Failures

1. Ensure database is running
2. Check if migrations are up to date:
   ```bash
   cd packages/api
   pnpm prisma:migrate
   ```
3. Clear test database: Tests use a separate test database automatically

## 🤝 Contributing

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes with tests
3. Run linting and type-checking:
   ```bash
   pnpm lint
   pnpm typecheck
   ```
4. Run all tests:
   ```bash
   pnpm test
   ```
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with 2-space indentation
- **Testing**: Vitest for unit and integration tests
- **Commits**: Descriptive commit messages

### Adding New Features

1. Create a story document in `docs/stories/`
2. Implement with tests
3. Update documentation
4. Create QA gate in `docs/qa/gates/`

## 📄 License

MIT

---

**Built with ❤️ for restaurants everywhere**

