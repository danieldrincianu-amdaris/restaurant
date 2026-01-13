# RestaurantFlow

A self-hosted restaurant order and menu management system built with TypeScript.

## Features

- **Menu Management** - Create, edit, and manage menu items with categories
- **Order Management** - Take and track customer orders
- **Kitchen Display** - Real-time order queue with drag-and-drop status updates

## Prerequisites

- **Node.js** 20.0.0 or higher
- **pnpm** 8.0.0 or higher

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd restaurant

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

## Development

```bash
# Start all packages in development mode
pnpm dev

# Start only the API server
pnpm --filter @restaurant/api dev

# Start only the web frontend
pnpm --filter @restaurant/web dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all packages in development mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |

## Project Structure

```
restaurant/
├── packages/
│   ├── api/          # Express backend API
│   ├── web/          # React frontend
│   └── shared/       # Shared types and utilities
├── package.json      # Workspace root
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

## API Endpoints

### Health Check

```
GET /api/health
```

Returns server status:

```json
{
  "status": "ok",
  "timestamp": "2026-01-13T12:00:00.000Z"
}
```

## License

MIT
