# RestaurantFlow Technical Architecture

---

## Introduction

This document defines the complete technical architecture for RestaurantFlow, a self-hosted restaurant order and menu management system. It serves as the definitive guide for AI-driven development, covering backend systems, frontend implementation, real-time communication, and deployment.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-13 | 0.1 | Initial architecture | Winston (Architect) |

---

## High-Level Architecture

### Technical Summary

RestaurantFlow is a monolithic full-stack TypeScript application with real-time capabilities. The system uses a monorepo structure with shared types between frontend and backend. A Node.js/Express backend serves a REST API for CRUD operations and Socket.io for real-time order updates. PostgreSQL provides persistent storage with Prisma as the type-safe ORM. The React frontend delivers three role-based interfaces (Admin, Staff, Kitchen) with real-time state synchronization. Docker Compose enables simple self-hosted deployment.

### Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        ADMIN[Admin UI<br/>Menu Management]
        STAFF[Staff UI<br/>Order Entry]
        KITCHEN[Kitchen UI<br/>Display Board]
    end

    subgraph "Frontend (React + TypeScript)"
        REACT[React Application<br/>Vite + React Router]
        SOCKET_CLIENT[Socket.io Client]
        API_CLIENT[REST API Client]
    end

    subgraph "Backend (Node.js + TypeScript)"
        EXPRESS[Express Server<br/>Port 3000]
        REST[REST API Routes]
        SOCKET_SERVER[Socket.io Server]
        SERVICES[Business Logic Services]
        PRISMA[Prisma ORM]
    end

    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Database)]
        UPLOADS[Local File Storage<br/>uploads/]
    end

    ADMIN --> REACT
    STAFF --> REACT
    KITCHEN --> REACT

    REACT --> API_CLIENT
    REACT --> SOCKET_CLIENT

    API_CLIENT -->|HTTP| REST
    SOCKET_CLIENT -->|WebSocket| SOCKET_SERVER

    REST --> SERVICES
    SOCKET_SERVER --> SERVICES
    SERVICES --> PRISMA
    PRISMA --> POSTGRES
    REST --> UPLOADS
```

---

## Project Structure

### Monorepo Layout

```
restaurant-flow/
├── packages/
│   ├── api/                    # Backend application
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point
│   │   │   ├── app.ts          # Express app setup
│   │   │   ├── config/         # Configuration
│   │   │   │   └── index.ts    # Environment config
│   │   │   ├── routes/         # REST API routes
│   │   │   │   ├── index.ts    # Route aggregator
│   │   │   │   ├── health.ts
│   │   │   │   ├── menu-items.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── categories.ts
│   │   │   │   └── upload.ts
│   │   │   ├── services/       # Business logic
│   │   │   │   ├── menu.service.ts
│   │   │   │   ├── order.service.ts
│   │   │   │   └── socket.service.ts
│   │   │   ├── middleware/     # Express middleware
│   │   │   │   ├── error-handler.ts
│   │   │   │   ├── validate.ts
│   │   │   │   └── cors.ts
│   │   │   ├── socket/         # WebSocket handlers
│   │   │   │   ├── index.ts
│   │   │   │   └── order-events.ts
│   │   │   └── utils/          # Utilities
│   │   │       └── logger.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   ├── migrations/     # Database migrations
│   │   │   └── seed.ts         # Seed data
│   │   ├── uploads/            # Uploaded images (gitignored)
│   │   ├── tests/              # Backend tests
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                    # Frontend application
│   │   ├── src/
│   │   │   ├── main.tsx        # Entry point
│   │   │   ├── App.tsx         # Root component
│   │   │   ├── components/     # Shared components
│   │   │   │   ├── ui/         # Base UI components
│   │   │   │   ├── layout/     # Layout components
│   │   │   │   └── common/     # Common components
│   │   │   ├── pages/          # Page components
│   │   │   │   ├── admin/
│   │   │   │   ├── staff/
│   │   │   │   └── kitchen/
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   │   ├── useOrderEvents.ts
│   │   │   │   ├── useSocket.ts
│   │   │   │   └── useApi.ts
│   │   │   ├── services/       # API client services
│   │   │   │   ├── api.ts
│   │   │   │   ├── menu.service.ts
│   │   │   │   └── order.service.ts
│   │   │   ├── stores/         # State management
│   │   │   │   └── orderStore.ts
│   │   │   ├── styles/         # Global styles
│   │   │   └── utils/          # Frontend utilities
│   │   ├── public/             # Static assets
│   │   ├── tests/              # Frontend tests
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── shared/                 # Shared types and utilities
│       ├── src/
│       │   ├── types/          # TypeScript interfaces
│       │   │   ├── menu.ts
│       │   │   ├── order.ts
│       │   │   └── events.ts
│       │   ├── constants/      # Shared constants
│       │   │   └── status.ts
│       │   └── utils/          # Shared utilities
│       │       └── validation.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.dev.yml
├── package.json                # Root workspace config
├── pnpm-workspace.yaml         # pnpm workspace config
├── tsconfig.base.json          # Base TS config
├── .eslintrc.js
├── .prettierrc
├── .env.example
└── README.md
```

---

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend Language** | TypeScript | 5.3+ | Type-safe frontend development |
| **Frontend Framework** | React | 18.2+ | Component-based UI |
| **Build Tool** | Vite | 5.0+ | Fast dev server and bundling |
| **Routing** | React Router | 6.20+ | Client-side routing |
| **State Management** | Zustand | 4.4+ | Lightweight state management |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **Drag & Drop** | @dnd-kit | 6.0+ | Accessible drag and drop |
| **Backend Language** | TypeScript | 5.3+ | Type-safe backend development |
| **Backend Framework** | Express | 4.18+ | HTTP server and routing |
| **Real-time** | Socket.io | 4.7+ | WebSocket communication |
| **Database** | PostgreSQL | 15+ | Relational database |
| **ORM** | Prisma | 5.7+ | Type-safe database access |
| **Validation** | Zod | 3.22+ | Schema validation |
| **File Upload** | Multer | 1.4+ | Multipart form handling |
| **Testing (Backend)** | Vitest | 1.0+ | Unit and integration tests |
| **Testing (Frontend)** | Vitest + RTL | 1.0+ | Component testing |
| **Monorepo** | pnpm workspaces | 8.0+ | Package management |
| **Containerization** | Docker | 24+ | Container runtime |
| **Orchestration** | Docker Compose | 2.20+ | Multi-container deployment |

---

## Data Models

### Entity Relationship Diagram

```mermaid
erDiagram
    MenuItem ||--o{ OrderItem : "referenced by"
    Order ||--|{ OrderItem : "contains"

    MenuItem {
        string id PK
        string name
        decimal price
        string[] ingredients
        string imageUrl
        Category category
        FoodType foodType
        boolean available
        datetime createdAt
        datetime updatedAt
    }

    Order {
        string id PK
        int tableNumber
        string serverName
        OrderStatus status
        datetime createdAt
        datetime updatedAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string menuItemId FK
        int quantity
        string specialInstructions
        datetime createdAt
    }
```

### Prisma Schema

```prisma
// packages/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Category {
  APPETIZER
  MAIN
  DRINK
  DESSERT
}

enum FoodType {
  MEAT
  PASTA
  PIZZA
  SEAFOOD
  VEGETARIAN
  SALAD
  SOUP
  SANDWICH
  COFFEE
  BEVERAGE
  OTHER
}

enum OrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  HALTED
  CANCELED
}

model MenuItem {
  id          String     @id @default(cuid())
  name        String
  price       Decimal    @db.Decimal(10, 2)
  ingredients String[]
  imageUrl    String?
  category    Category
  foodType    FoodType   @default(OTHER)
  available   Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  orderItems  OrderItem[]

  @@map("menu_items")
}

model Order {
  id          String      @id @default(cuid())
  tableNumber Int
  serverName  String
  status      OrderStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  items       OrderItem[]

  @@index([status])
  @@index([tableNumber])
  @@map("orders")
}

model OrderItem {
  id                  String   @id @default(cuid())
  orderId             String
  menuItemId          String
  quantity            Int      @default(1)
  specialInstructions String?
  createdAt           DateTime @default(now())

  order    Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem MenuItem @relation(fields: [menuItemId], references: [id])

  @@index([orderId])
  @@map("order_items")
}
```

### Shared TypeScript Interfaces

```typescript
// packages/shared/src/types/menu.ts

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
```

```typescript
// packages/shared/src/types/order.ts

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  HALTED = 'HALTED',
  CANCELED = 'CANCELED',
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  specialInstructions: string | null;
  createdAt: string;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  tableNumber: number;
  serverName: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderInput {
  tableNumber: number;
  serverName: string;
  items?: CreateOrderItemInput[];
}

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

// Valid status transitions
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.HALTED, OrderStatus.CANCELED],
  [OrderStatus.HALTED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELED]: [],
};
```

---

## REST API Specification

### Base Configuration

- **Base URL:** `/api`
- **Content-Type:** `application/json`
- **Error Format:** `{ error: { code: string, message: string, details?: any } }`

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/categories` | List categories |
| GET | `/api/food-types` | List food types |
| GET | `/api/menu-items` | List menu items |
| POST | `/api/menu-items` | Create menu item |
| GET | `/api/menu-items/:id` | Get menu item |
| PUT | `/api/menu-items/:id` | Update menu item |
| DELETE | `/api/menu-items/:id` | Delete menu item |
| POST | `/api/upload` | Upload image |
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get order |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Delete order |
| PATCH | `/api/orders/:id/status` | Update order status |
| POST | `/api/orders/:id/items` | Add order item |
| PUT | `/api/orders/:id/items/:itemId` | Update order item |
| DELETE | `/api/orders/:id/items/:itemId` | Remove order item |

### Menu Item Endpoints

#### GET /api/menu-items

List all menu items with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| foodType | string | Filter by food type |
| available | boolean | Filter by availability |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "clq1234567890",
      "name": "Margherita Pizza",
      "price": 18.99,
      "ingredients": ["tomato", "mozzarella", "basil"],
      "imageUrl": "/uploads/pizza.jpg",
      "category": "MAIN",
      "foodType": "PIZZA",
      "available": true,
      "createdAt": "2026-01-13T10:00:00Z",
      "updatedAt": "2026-01-13T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### POST /api/menu-items

Create a new menu item.

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "price": 18.99,
  "ingredients": ["tomato", "mozzarella", "basil"],
  "imageUrl": "/uploads/pizza.jpg",
  "category": "MAIN",
  "foodType": "PIZZA",
  "available": true
}
```

**Response: 201 Created**
```json
{
  "data": { /* MenuItem object */ }
}
```

### Order Endpoints

#### POST /api/orders

Create a new order.

**Request Body:**
```json
{
  "tableNumber": 5,
  "serverName": "John",
  "items": [
    {
      "menuItemId": "clq1234567890",
      "quantity": 2,
      "specialInstructions": "No olives"
    }
  ]
}
```

**Response: 201 Created**
```json
{
  "data": {
    "id": "clq0987654321",
    "tableNumber": 5,
    "serverName": "John",
    "status": "PENDING",
    "createdAt": "2026-01-13T12:30:00Z",
    "updatedAt": "2026-01-13T12:30:00Z",
    "items": [
      {
        "id": "clq1111111111",
        "menuItemId": "clq1234567890",
        "quantity": 2,
        "specialInstructions": "No olives",
        "menuItem": { /* MenuItem object */ }
      }
    ]
  }
}
```

#### PATCH /api/orders/:id/status

Update order status with transition validation.

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Response: 200 OK**
```json
{
  "data": { /* Order object with new status */ }
}
```

**Response: 400 Bad Request** (invalid transition)
```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot transition from COMPLETED to IN_PROGRESS"
  }
}
```

---

## WebSocket Event Architecture

### Connection Setup

```typescript
// packages/shared/src/socket-events.ts
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Order events (server → client)
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_DELETED: 'order:deleted',
  ORDER_STATUS_CHANGED: 'order:status-changed',
  
  // Order item events (server → client)
  ORDER_ITEM_ADDED: 'order-item:added',
  ORDER_ITEM_UPDATED: 'order-item:updated',
  ORDER_ITEM_REMOVED: 'order-item:removed',
  
  // Menu events (server → client)
  MENU_ITEM_CREATED: 'menu-item:created',
  MENU_ITEM_UPDATED: 'menu-item:updated',
  MENU_ITEM_DELETED: 'menu-item:deleted',
  
  // Client subscriptions (client → server)
  JOIN_KITCHEN: 'join:kitchen',
  LEAVE_KITCHEN: 'leave:kitchen',
  JOIN_ORDERS: 'join:orders',
  LEAVE_ORDERS: 'leave:orders',
} as const;
```

### Event Payload Types

```typescript
// packages/shared/src/socket-payloads.ts
export interface OrderCreatedPayload {
  order: Order;
}

export interface OrderUpdatedPayload {
  order: Order;
  changedFields: string[];
}

export interface OrderStatusChangedPayload {
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  updatedAt: string;
}

export interface OrderItemPayload {
  orderId: string;
  item: OrderItem;
}

export interface MenuItemPayload {
  menuItem: MenuItem;
}
```

### Real-time Architecture Diagram

```mermaid
sequenceDiagram
    participant Staff as Restaurant Staff
    participant Kitchen as Kitchen Display
    participant Web as Frontend (React)
    participant Socket as Socket.io Server
    participant API as REST API
    participant DB as PostgreSQL

    Staff->>Web: Create Order
    Web->>API: POST /api/orders
    API->>DB: Insert Order
    DB-->>API: Order Created
    API->>Socket: Emit order:created
    Socket-->>Kitchen: order:created event
    Kitchen->>Kitchen: Display New Order
    API-->>Web: 201 Created
    Web->>Web: Update Local State

    Kitchen->>Web: Update Status to "In Progress"
    Web->>API: PATCH /api/orders/:id/status
    API->>DB: Update Status
    DB-->>API: Status Updated
    API->>Socket: Emit order:status-changed
    Socket-->>Staff: order:status-changed event
    Staff->>Staff: See Updated Status
```

### Room-based Subscriptions

```typescript
// packages/api/src/socket/handlers.ts
import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@restaurant/shared';

export function setupSocketHandlers(io: Server) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Kitchen display subscribes to order events
    socket.on(SOCKET_EVENTS.JOIN_KITCHEN, () => {
      socket.join('kitchen');
      console.log(`${socket.id} joined kitchen room`);
    });
    
    socket.on(SOCKET_EVENTS.LEAVE_KITCHEN, () => {
      socket.leave('kitchen');
    });
    
    // Staff view subscribes to order status updates
    socket.on(SOCKET_EVENTS.JOIN_ORDERS, () => {
      socket.join('orders');
      console.log(`${socket.id} joined orders room`);
    });
    
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// Emit to specific rooms
export function emitOrderCreated(io: Server, order: Order) {
  io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_CREATED, { order });
}

export function emitStatusChanged(
  io: Server, 
  orderId: string, 
  previousStatus: OrderStatus, 
  newStatus: OrderStatus
) {
  io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, {
    orderId,
    previousStatus,
    newStatus,
    updatedAt: new Date().toISOString(),
  });
}
```

### Frontend Socket Integration

```typescript
// packages/web/src/lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@restaurant/shared';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
}

export function subscribeToKitchen() {
  const socket = getSocket();
  socket.emit(SOCKET_EVENTS.JOIN_KITCHEN);
}

export function subscribeToOrders() {
  const socket = getSocket();
  socket.emit(SOCKET_EVENTS.JOIN_ORDERS);
}
```

---

## Backend Architecture

### Service Layer Pattern

```typescript
// packages/api/src/services/order.service.ts
import { PrismaClient, Order, OrderStatus } from '@prisma/client';
import { Server } from 'socket.io';
import { CreateOrderDto, UpdateOrderDto } from '../dto/order.dto';
import { STATUS_TRANSITIONS } from '@restaurant/shared';
import { emitOrderCreated, emitStatusChanged } from '../socket/handlers';
import { AppError } from '../utils/errors';

export class OrderService {
  constructor(
    private prisma: PrismaClient,
    private io: Server
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.prisma.order.create({
      data: {
        tableNumber: dto.tableNumber,
        serverName: dto.serverName,
        status: OrderStatus.PENDING,
        items: {
          create: dto.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          })),
        },
      },
      include: { items: { include: { menuItem: true } } },
    });

    emitOrderCreated(this.io, order);
    return order;
  }

  async updateStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    const allowedTransitions = STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new AppError(
        'INVALID_STATUS_TRANSITION',
        `Cannot transition from ${order.status} to ${newStatus}`,
        400
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { items: { include: { menuItem: true } } },
    });

    emitStatusChanged(this.io, orderId, order.status, newStatus);
    return updated;
  }
}
```

### Controller Layer

```typescript
// packages/api/src/controllers/order.controller.ts
import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { createOrderSchema, updateStatusSchema } from '../schemas/order.schema';

export class OrderController {
  constructor(private orderService: OrderService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createOrderSchema.parse(req.body);
      const order = await this.orderService.createOrder(dto);
      res.status(201).json({ data: order });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = updateStatusSchema.parse(req.body);
      const order = await this.orderService.updateStatus(id, status);
      res.json({ data: order });
    } catch (error) {
      next(error);
    }
  };
}
```

### Error Handling Middleware

```typescript
// packages/api/src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors,
      },
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

### Express App Setup

```typescript
// packages/api/src/app.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/error-handler';
import { setupSocketHandlers } from './socket/handlers';
import { createRoutes } from './routes';

export function createApp() {
  const app = express();
  const httpServer = createServer(app);
  const prisma = new PrismaClient();
  
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static('uploads'));

  // Routes
  app.use('/api', createRoutes(prisma, io));

  // WebSocket
  setupSocketHandlers(io);

  // Error handling
  app.use(errorHandler);

  return { app, httpServer, prisma, io };
}
```

---

## Frontend Architecture

### State Management with Zustand

```typescript
// packages/web/src/stores/order.store.ts
import { create } from 'zustand';
import { Order, OrderStatus, SOCKET_EVENTS } from '@restaurant/shared';
import { getSocket } from '../lib/socket';
import { ordersApi } from '../lib/api';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchOrders: () => Promise<void>;
  createOrder: (data: CreateOrderData) => Promise<Order>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  
  // Socket handlers
  initializeSocket: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await ordersApi.getAll();
      set({ orders, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch orders', isLoading: false });
    }
  },

  createOrder: async (data) => {
    const order = await ordersApi.create(data);
    // Optimistic update - socket will confirm
    set(state => ({ orders: [...state.orders, order] }));
    return order;
  },

  updateStatus: async (orderId, status) => {
    // Optimistic update
    set(state => ({
      orders: state.orders.map(o => 
        o.id === orderId ? { ...o, status } : o
      ),
    }));
    
    try {
      await ordersApi.updateStatus(orderId, status);
    } catch (error) {
      // Rollback on failure
      get().fetchOrders();
      throw error;
    }
  },

  initializeSocket: () => {
    const socket = getSocket();
    
    socket.on(SOCKET_EVENTS.ORDER_CREATED, ({ order }) => {
      set(state => {
        // Avoid duplicates from optimistic updates
        const exists = state.orders.some(o => o.id === order.id);
        if (exists) return state;
        return { orders: [...state.orders, order] };
      });
    });

    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, ({ orderId, newStatus }) => {
      set(state => ({
        orders: state.orders.map(o =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ),
      }));
    });

    socket.on(SOCKET_EVENTS.ORDER_DELETED, ({ orderId }) => {
      set(state => ({
        orders: state.orders.filter(o => o.id !== orderId),
      }));
    });
  },
}));
```

### Menu Store

```typescript
// packages/web/src/stores/menu.store.ts
import { create } from 'zustand';
import { MenuItem, Category, FoodType, SOCKET_EVENTS } from '@restaurant/shared';
import { getSocket } from '../lib/socket';
import { menuApi } from '../lib/api';

interface MenuState {
  items: MenuItem[];
  categories: Category[];
  foodTypes: FoodType[];
  isLoading: boolean;
  filters: {
    category: Category | null;
    foodType: FoodType | null;
    searchQuery: string;
  };
  
  // Actions
  fetchMenu: () => Promise<void>;
  setFilter: (key: keyof MenuState['filters'], value: any) => void;
  getFilteredItems: () => MenuItem[];
  
  // Socket handlers
  initializeSocket: () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: Object.values(Category),
  foodTypes: Object.values(FoodType),
  isLoading: false,
  filters: {
    category: null,
    foodType: null,
    searchQuery: '',
  },

  fetchMenu: async () => {
    set({ isLoading: true });
    try {
      const items = await menuApi.getAll();
      set({ items, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setFilter: (key, value) => {
    set(state => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  getFilteredItems: () => {
    const { items, filters } = get();
    return items.filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.foodType && item.foodType !== filters.foodType) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(query) ||
               item.ingredients.some(i => i.toLowerCase().includes(query));
      }
      return true;
    });
  },

  initializeSocket: () => {
    const socket = getSocket();
    
    socket.on(SOCKET_EVENTS.MENU_ITEM_UPDATED, ({ menuItem }) => {
      set(state => ({
        items: state.items.map(i => i.id === menuItem.id ? menuItem : i),
      }));
    });
  },
}));
```

### API Client

```typescript
// packages/web/src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Request failed');
  }

  const data = await response.json();
  return data.data;
}

export const ordersApi = {
  getAll: () => request<Order[]>('/orders'),
  getById: (id: string) => request<Order>(`/orders/${id}`),
  create: (data: CreateOrderData) => 
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: OrderStatus) =>
    request<Order>(`/orders/${id}/status`, { 
      method: 'PATCH', 
      body: JSON.stringify({ status }) 
    }),
  delete: (id: string) => 
    request<void>(`/orders/${id}`, { method: 'DELETE' }),
};

export const menuApi = {
  getAll: (params?: MenuFilters) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.foodType) searchParams.set('foodType', params.foodType);
    const query = searchParams.toString();
    return request<MenuItem[]>(`/menu-items${query ? `?${query}` : ''}`);
  },
  create: (data: CreateMenuItemData) =>
    request<MenuItem>('/menu-items', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateMenuItemData) =>
    request<MenuItem>(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/menu-items/${id}`, { method: 'DELETE' }),
};
```

---

## Deployment Configuration

### Docker Compose (Production)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: restaurant-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-restaurant}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-restaurant_secret}
      POSTGRES_DB: ${DB_NAME:-restaurant}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-restaurant}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - restaurant-network

  api:
    build:
      context: .
      dockerfile: packages/api/Dockerfile
    container_name: restaurant-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER:-restaurant}:${DB_PASSWORD:-restaurant_secret}@postgres:5432/${DB_NAME:-restaurant}
      PORT: 3001
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - restaurant-network

  web:
    build:
      context: .
      dockerfile: packages/web/Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL:-http://localhost:3001}
    container_name: restaurant-web
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - restaurant-network

volumes:
  postgres_data:

networks:
  restaurant-network:
    driver: bridge
```

### API Dockerfile

```dockerfile
# packages/api/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/api ./packages/api

# Build shared package
RUN pnpm --filter @restaurant/shared build

# Generate Prisma client
RUN pnpm --filter @restaurant/api prisma:generate

# Build API
RUN pnpm --filter @restaurant/api build

# Production image
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/package.json ./packages/api/
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma
COPY --from=builder /app/packages/api/node_modules ./packages/api/node_modules

WORKDIR /app/packages/api

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Web Dockerfile

```dockerfile
# packages/web/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/web/package.json ./packages/web/

RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY packages/web ./packages/web

RUN pnpm --filter @restaurant/shared build
RUN pnpm --filter @restaurant/web build

# Production image with nginx
FROM nginx:alpine

COPY --from=builder /app/packages/web/dist /usr/share/nginx/html
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# packages/web/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests (optional - if running behind single domain)
    location /api {
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket proxy
    location /socket.io {
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Environment Variables

```bash
# .env.example
# Database
DB_USER=restaurant
DB_PASSWORD=your_secure_password_here
DB_NAME=restaurant

# API
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://restaurant:your_secure_password_here@localhost:5432/restaurant
CORS_ORIGIN=http://localhost

# Frontend
VITE_API_URL=http://localhost:3001
```

---

## Security Considerations

### Input Validation with Zod

```typescript
// packages/api/src/schemas/order.schema.ts
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const createOrderSchema = z.object({
  tableNumber: z.number().int().min(1).max(100),
  serverName: z.string().min(1).max(50).trim(),
  items: z.array(z.object({
    menuItemId: z.string().cuid(),
    quantity: z.number().int().min(1).max(99),
    specialInstructions: z.string().max(500).optional(),
  })).min(1).max(50),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const menuItemSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  price: z.number().positive().multipleOf(0.01),
  ingredients: z.array(z.string().max(50)).max(20),
  imageUrl: z.string().url().optional().nullable(),
  category: z.enum(['APPETIZER', 'MAIN', 'DESSERT', 'BEVERAGE', 'SIDE']),
  foodType: z.enum(['PIZZA', 'PASTA', 'SALAD', 'SOUP', 'SANDWICH', 'DRINK', 'OTHER']),
  available: z.boolean().default(true),
});
```

### Rate Limiting

```typescript
// packages/api/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 uploads per hour
  message: {
    error: {
      code: 'UPLOAD_LIMIT_EXCEEDED',
      message: 'Too many uploads, please try again later',
    },
  },
});
```

### File Upload Security

```typescript
// packages/api/src/middleware/upload.ts
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/errors';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('INVALID_FILE_TYPE', 'Only JPEG, PNG, and WebP images are allowed', 400));
    }
  },
});
```

### CORS Configuration

```typescript
// packages/api/src/config/cors.ts
import cors from 'cors';

export const corsConfig = cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
});
```

---

## Testing Strategy

### Backend Unit Tests

```typescript
// packages/api/src/services/__tests__/order.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from '../order.service';
import { OrderStatus } from '@prisma/client';

describe('OrderService', () => {
  let orderService: OrderService;
  let mockPrisma: any;
  let mockIo: any;

  beforeEach(() => {
    mockPrisma = {
      order: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };
    mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    orderService = new OrderService(mockPrisma, mockIo);
  });

  describe('updateStatus', () => {
    it('should update status for valid transition', async () => {
      const order = { id: '1', status: OrderStatus.PENDING };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.order.update.mockResolvedValue({ ...order, status: OrderStatus.IN_PROGRESS });

      const result = await orderService.updateStatus('1', OrderStatus.IN_PROGRESS);

      expect(result.status).toBe(OrderStatus.IN_PROGRESS);
      expect(mockIo.emit).toHaveBeenCalled();
    });

    it('should throw error for invalid transition', async () => {
      const order = { id: '1', status: OrderStatus.COMPLETED };
      mockPrisma.order.findUnique.mockResolvedValue(order);

      await expect(
        orderService.updateStatus('1', OrderStatus.IN_PROGRESS)
      ).rejects.toThrow('INVALID_STATUS_TRANSITION');
    });
  });
});
```

### Frontend Component Tests

```typescript
// packages/web/src/components/__tests__/OrderCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCard } from '../OrderCard';
import { OrderStatus } from '@restaurant/shared';

describe('OrderCard', () => {
  const mockOrder = {
    id: '1',
    tableNumber: 5,
    serverName: 'John',
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: '1',
        quantity: 2,
        menuItem: { name: 'Pizza', price: 18.99 },
      },
    ],
  };

  it('renders order details correctly', () => {
    render(<OrderCard order={mockOrder} onStatusChange={vi.fn()} />);

    expect(screen.getByText('Table 5')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('x2')).toBeInTheDocument();
  });

  it('calls onStatusChange when status button clicked', () => {
    const onStatusChange = vi.fn();
    render(<OrderCard order={mockOrder} onStatusChange={onStatusChange} />);

    fireEvent.click(screen.getByText('Start'));

    expect(onStatusChange).toHaveBeenCalledWith('1', OrderStatus.IN_PROGRESS);
  });
});
```

### E2E Tests with Playwright

```typescript
// e2e/order-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  test('should create and complete an order', async ({ page }) => {
    // Navigate to order page
    await page.goto('/orders/new');

    // Select table
    await page.fill('[data-testid="table-number"]', '5');
    await page.fill('[data-testid="server-name"]', 'John');

    // Add items
    await page.click('[data-testid="menu-item-pizza"]');
    await page.click('[data-testid="add-to-order"]');

    // Submit order
    await page.click('[data-testid="submit-order"]');

    // Verify order created
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();

    // Navigate to kitchen
    await page.goto('/kitchen');

    // Find and start order
    const orderCard = page.locator('[data-testid="order-card"]').first();
    await expect(orderCard).toContainText('Table 5');
    await orderCard.locator('[data-testid="start-order"]').click();

    // Verify status changed
    await expect(orderCard.locator('[data-testid="status-badge"]')).toContainText('In Progress');
  });
});
```

---

## Development Workflow

### Getting Started

```bash
# Clone and install
git clone <repository-url>
cd restaurant
pnpm install

# Setup database
docker-compose up -d postgres
pnpm --filter @restaurant/api prisma:migrate
pnpm --filter @restaurant/api prisma:seed

# Start development
pnpm dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all packages in development mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm --filter @restaurant/api prisma:studio` | Open Prisma Studio |

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| Order | A customer's request for menu items at a table |
| Menu Item | A food or beverage available for ordering |
| Order Status | Current state of an order (Pending, In Progress, Ready, Completed, Canceled) |
| Kitchen Display | Screen showing active orders for kitchen staff |
| WebSocket | Real-time bidirectional communication protocol |

### References

- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/v4)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
