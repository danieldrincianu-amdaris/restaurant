# RestaurantFlow Product Requirements Document (PRD)

---

## Goals and Background Context

### Goals

- Deliver a functional restaurant order management system for learning/exploration
- Enable staff to create and manage orders linked to tables with real-time kitchen updates
- Provide admins with menu management capabilities (CRUD, availability, categories)
- Give kitchen staff a real-time order queue with drag-and-drop status management
- Demonstrate full-stack TypeScript/Node.js capabilities in a self-hosted environment

### Background Context

RestaurantFlow addresses the core operational challenge of restaurant order coordination — getting accurate orders from servers to the kitchen efficiently. Current solutions are either overly complex enterprise POS systems, error-prone paper tickets, or generic order systems not tailored to restaurant workflows.

This project is a self-paced learning/exploration initiative to build a staff-focused web application using Node.js and TypeScript. The MVP focuses on three essential modules (Menu Management, Order Management, Kitchen Display) while explicitly deferring customer-facing features, payment processing, and analytics to future phases.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-13 | 0.1 | Initial PRD draft | Mary (Analyst) |

---

## Requirements

### Functional Requirements

**Menu Management**
- **FR1:** The system shall allow Admin users to create menu items with name, price, ingredients, image, category, and availability status
- **FR2:** The system shall allow Admin users to edit and delete existing menu items
- **FR3:** The system shall support organizing menu items by course category (Appetizers, Mains, Drinks, Desserts) and/or food type (Meat, Pasta, Pizza, etc.)
- **FR4:** The system shall allow Admin users to toggle item availability (86'd/available) with immediate effect across all clients

**Order Management**
- **FR5:** The system shall allow Restaurant Staff to create new orders with table number and server name
- **FR6:** The system shall automatically record timestamp when an order is created
- **FR7:** The system shall allow Restaurant Staff to add menu items to an order with quantity and special instructions
- **FR8:** The system shall allow Restaurant Staff to edit orders (add, remove, modify items) after submission to kitchen
- **FR9:** The system shall track order status: Pending → In Progress → Completed → Halted → Canceled
- **FR10:** The system shall only display available menu items when creating/editing orders

**Kitchen Display**
- **FR11:** The system shall display all active orders in a real-time queue view
- **FR12:** The system shall show order cards with table number, items, quantities, special instructions, and time elapsed
- **FR13:** The system shall allow Kitchen Staff to update order status via drag-and-drop between status columns
- **FR14:** The system shall display orders in oldest-first priority order
- **FR15:** The system shall visually alert Kitchen Staff when orders exceed a configurable wait time threshold
- **FR16:** The system shall notify Kitchen Staff (audio/visual) when new orders arrive

### Non-Functional Requirements

- **NFR1:** Order and status updates shall propagate to all connected clients within 1 second (real-time)
- **NFR2:** The system shall be self-hostable with no external vendor dependencies
- **NFR3:** The system shall use Node.js with TypeScript for backend development
- **NFR4:** The system shall support concurrent access from multiple Staff and Kitchen clients without data conflicts
- **NFR5:** The UI shall be responsive and functional on tablet-sized screens (kitchen display use case)
- **NFR6:** The system shall maintain 99%+ uptime during restaurant operating hours
- **NFR7:** Order creation workflow shall be completable in under 30 seconds

---

## User Interface Design Goals

### Overall UX Vision

A clean, task-focused interface optimized for speed and clarity in a busy restaurant environment. Each user role has a dedicated view tailored to their workflow:
- **Admin:** Dashboard-style menu management with forms and tables
- **Staff:** Fast order entry with minimal taps/clicks, large touch targets
- **Kitchen:** Kanban-style board optimized for quick scanning and drag-and-drop on larger displays

The design prioritizes **glanceability** (instant comprehension) and **error prevention** (clear confirmations, undo options).

### Key Interaction Paradigms

| Paradigm | Application |
|----------|-------------|
| **Kanban Board** | Kitchen display — orders flow through status columns via drag-and-drop |
| **Card-based UI** | Order cards in kitchen, menu item cards in staff view |
| **Modal Forms** | Create/edit menu items (Admin), special instructions (Staff) |
| **Real-time Updates** | Live order queue, instant status changes without refresh |
| **Touch-first** | Large tap targets, swipe gestures where appropriate |

### Core Screens and Views

| # | Screen | Primary User | Purpose |
|---|--------|--------------|---------|
| 1 | Menu Management Dashboard | Admin | List, create, edit, delete menu items; manage categories |
| 2 | Menu Item Form | Admin | Add/edit item details (name, price, ingredients, image, etc.) |
| 3 | Order Entry Screen | Staff | Browse menu, build order, submit to kitchen |
| 4 | Active Orders List | Staff | View own orders, see status, edit if needed |
| 5 | Kitchen Display Board | Kitchen | Kanban view of all orders by status |
| 6 | Order Detail Card | Kitchen/Staff | Expanded view of single order with all items |

### Accessibility

**Level:** WCAG AA

- Sufficient color contrast for kitchen visibility
- Keyboard navigation support
- Screen reader compatible labels
- No critical information conveyed by color alone

### Branding

**Approach:** Clean, minimal, professional

- No specific brand guidelines (learning project)
- Neutral color palette with status-based accent colors:
  - Pending: Blue
  - In Progress: Yellow/Orange
  - Completed: Green
  - Halted/Canceled: Red
- Clear typography prioritizing readability at distance (kitchen display)

### Target Devices and Platforms

**Primary:** Web Responsive

| Device | Use Case | Priority |
|--------|----------|----------|
| Tablet (10"+) | Kitchen display, staff order entry | High |
| Desktop/Laptop | Admin menu management | High |
| Mobile phone | Staff quick order checks | Medium |

---

## Technical Assumptions

### Repository Structure: Monorepo

**Choice:** Monorepo

**Rationale:**
- Single codebase simplifies development for solo developer
- Shared TypeScript types between frontend and backend
- Unified tooling (ESLint, Prettier, testing)
- Easier deployment coordination for self-hosted setup

```
restaurant-flow/
├── packages/
│   ├── api/          # Node.js backend
│   ├── web/          # Frontend application
│   └── shared/       # Shared types and utilities
├── package.json      # Workspace root
└── docker-compose.yml
```

### Service Architecture

**Choice:** Monolith with WebSocket support

**Rationale:**
- Simplest architecture for MVP and learning project
- Single deployment unit = easier self-hosting
- No need for service mesh or inter-service communication complexity
- WebSocket server co-located with REST API for real-time updates
- Can evolve to microservices later if needed (unlikely for this scope)

**Components:**
| Component | Technology | Purpose |
|-----------|------------|---------|
| REST API | Express or Fastify | CRUD operations for menu, orders |
| WebSocket Server | Socket.io | Real-time order updates, notifications |
| Database | PostgreSQL | Persistent storage |
| Frontend | React + TypeScript | All three user interfaces |

### Testing Requirements

**Choice:** Unit + Integration Testing

**Rationale:**
- Unit tests for business logic (order status transitions, menu validation)
- Integration tests for API endpoints and database operations
- E2E testing deferred for MVP (manual testing acceptable for learning project)
- Focus on testable architecture over 100% coverage

**Testing Stack:**
| Layer | Tool | Focus |
|-------|------|-------|
| Unit | Jest/Vitest | Business logic, utilities |
| Integration | Supertest | API endpoints |
| Frontend | React Testing Library | Component behavior |
| E2E | *(deferred)* | Manual testing for MVP |

### Additional Technical Assumptions and Requests

- **Database:** PostgreSQL (relational, ACID-compliant for order transactions)
- **ORM:** Prisma or TypeORM for type-safe database access
- **Authentication:** Simplified for MVP — role selection without login, JWT-based auth in Phase 2
- **Real-time:** Socket.io for WebSocket abstraction and fallback support
- **Frontend Framework:** React with TypeScript (most common, good learning value)
- **Styling:** Tailwind CSS or CSS Modules (developer preference)
- **Containerization:** Docker + docker-compose for self-hosted deployment
- **State Management:** React Context or Zustand (avoid Redux complexity for MVP)
- **Image Storage:** Local filesystem or S3-compatible storage for menu item images

---

## Epic List

| # | Epic | Goal |
|---|------|------|
| **Epic 1** | Foundation & Menu Management | Establish project infrastructure, database schema, and deliver complete menu management functionality for Admin users |
| **Epic 2** | Order Management | Enable Restaurant Staff to create, edit, and manage orders with full menu integration |
| **Epic 3** | Kitchen Display & Real-time | Deliver real-time kitchen display with drag-and-drop status management and notifications |
| **Epic 4** | Enhancements & Polish | Improve performance, UX, accessibility, testing infrastructure, developer experience, and add operational features like order deletion and kitchen ticket printing |

---

## Epic 1: Foundation & Menu Management

### Epic Goal

Establish the project infrastructure including repository setup, database schema, and core API foundation, while delivering complete menu management functionality. By the end of this epic, Admin users can create, read, update, and delete menu items with all required fields, organize items by category, and toggle availability — providing the foundation for all subsequent order and kitchen functionality.

### Stories

#### Story 1.1: Project Setup & Health Check

**As a** developer,  
**I want** the project scaffolded with proper structure and tooling,  
**so that** I have a solid foundation for building features.

**Acceptance Criteria:**
1. Monorepo structure created with `packages/api`, `packages/web`, and `packages/shared` directories
2. TypeScript configured for all packages with strict mode enabled
3. ESLint and Prettier configured with consistent rules across packages
4. Package.json scripts for dev, build, lint, and test commands
5. Express/Fastify API server runs on configurable port (default 3000)
6. Health check endpoint (`GET /api/health`) returns `{ status: "ok", timestamp: <ISO date> }`
7. Basic error handling middleware catches and formats errors as JSON
8. README with setup instructions (install, run, test)

---

#### Story 1.2: Database Setup & Menu Item Schema

**As a** developer,  
**I want** the database configured with the menu item schema,  
**so that** I can persist and query menu data.

**Acceptance Criteria:**
1. PostgreSQL database configured (local dev via Docker or direct install)
2. Prisma (or TypeORM) configured with database connection
3. Menu Item model created with fields: id, name, price, ingredients (array), imageUrl, category, foodType, available, createdAt, updatedAt
4. Category enum defined: APPETIZER, MAIN, DRINK, DESSERT
5. Migration script creates the menu_items table
6. Seed script populates 5-10 sample menu items for development
7. Database connection validated on API startup with graceful error if unavailable

---

#### Story 1.3: Menu Item CRUD API Endpoints

**As an** Admin user,  
**I want** API endpoints to manage menu items,  
**so that** I can create, view, update, and delete items programmatically.

**Acceptance Criteria:**
1. `POST /api/menu-items` creates a new menu item with validation (name required, price > 0)
2. `GET /api/menu-items` returns all menu items (with optional query filters: category, foodType, available)
3. `GET /api/menu-items/:id` returns a single menu item by ID (404 if not found)
4. `PUT /api/menu-items/:id` updates an existing menu item (404 if not found, validation applied)
5. `DELETE /api/menu-items/:id` soft-deletes or removes a menu item (404 if not found)
6. All endpoints return consistent JSON response format with appropriate HTTP status codes
7. Validation errors return 400 with descriptive error messages
8. API responses include the full menu item object on create/update

---

#### Story 1.4: Menu Item Image Upload

**As an** Admin user,  
**I want** to upload images for menu items,  
**so that** items display with visual representation.

**Acceptance Criteria:**
1. `POST /api/upload` endpoint accepts image file (multipart/form-data)
2. Supported formats: JPEG, PNG, WebP (reject others with 400 error)
3. Maximum file size: 5MB (reject larger with 413 error)
4. Image saved to local `uploads/` directory with unique filename (UUID)
5. Endpoint returns the image URL path for storage in menu item record
6. `GET /uploads/:filename` serves uploaded images statically
7. Uploads directory excluded from git via .gitignore

---

#### Story 1.5: Category Management API

**As an** Admin user,  
**I want** to manage menu categories,  
**so that** I can organize menu items effectively.

**Acceptance Criteria:**
1. `GET /api/categories` returns list of available categories (course-based: Appetizer, Main, Drink, Dessert)
2. `GET /api/food-types` returns list of food types (Meat, Pasta, Pizza, Seafood, Vegetarian, etc.)
3. Menu items can be filtered by category and/or foodType via query parameters
4. Categories and food types defined as database enums or reference tables
5. API validates category/foodType values on menu item create/update

---

#### Story 1.6: Frontend Project Setup & Routing

**As a** developer,  
**I want** the frontend application scaffolded with routing,  
**so that** I can build the Admin interface.

**Acceptance Criteria:**
1. React application created in `packages/web` with TypeScript
2. Vite configured as build tool with hot module replacement
3. React Router configured with routes: `/`, `/admin`, `/admin/menu`
4. Basic layout component with navigation header
5. Shared types imported from `packages/shared`
6. API client utility configured with base URL (environment variable)
7. Application runs on configurable port (default 5173)
8. Proxy configured to forward `/api` requests to backend in development

---

#### Story 1.7: Menu Management Dashboard UI

**As an** Admin user,  
**I want** a dashboard to view all menu items,  
**so that** I can see and manage the restaurant's menu.

**Acceptance Criteria:**
1. Menu Management page (`/admin/menu`) displays all menu items in a table/grid view
2. Each item shows: name, price, category, food type, availability status, image thumbnail
3. Filter controls allow filtering by category and/or food type
4. Availability toggle switch allows quick on/off without opening edit form
5. "Add New Item" button navigates to create form
6. Edit and Delete action buttons on each item row
7. Loading state displayed while fetching data
8. Empty state displayed when no menu items exist
9. Error state displayed if API request fails

---

#### Story 1.8: Menu Item Create/Edit Form

**As an** Admin user,  
**I want** a form to create and edit menu items,  
**so that** I can add new items and update existing ones.

**Acceptance Criteria:**
1. Form accessible at `/admin/menu/new` (create) and `/admin/menu/:id/edit` (edit)
2. Form fields: name (text), price (number), ingredients (multi-input/tags), category (dropdown), food type (dropdown), image upload, availability (checkbox)
3. Image upload shows preview of selected/existing image
4. Form validates required fields before submission (name, price, category)
5. Price field only accepts positive numbers with up to 2 decimal places
6. Submit button disabled while request is in progress
7. Success: redirect to menu dashboard with success toast notification
8. Error: display error message without losing form data
9. Cancel button returns to menu dashboard without saving

---

#### Story 1.9: Menu Item Delete Confirmation

**As an** Admin user,  
**I want** to delete menu items with confirmation,  
**so that** I don't accidentally remove items.

**Acceptance Criteria:**
1. Delete button triggers confirmation modal/dialog
2. Modal displays item name and warns about permanent deletion
3. Confirm button executes delete and closes modal
4. Cancel button closes modal without action
5. On successful delete: item removed from list, success toast displayed
6. On error: modal closes, error toast displayed
7. Deleted items no longer appear in menu item list

---

## Epic 2: Order Management

### Epic Goal

Enable Restaurant Staff to create, edit, and manage customer orders with full menu integration. By the end of this epic, Staff can browse the menu, create orders linked to tables, add/remove items with quantities and special instructions, edit orders after submission, and track order status — delivering the core ordering workflow that feeds into the kitchen display.

### Stories

#### Story 2.1: Order Database Schema

**As a** developer,  
**I want** the database schema for orders and order items,  
**so that** I can persist order data.

**Acceptance Criteria:**
1. Order model created with fields: id, tableNumber, serverName, status, createdAt, updatedAt
2. OrderItem model created with fields: id, orderId, menuItemId, quantity, specialInstructions, createdAt
3. Order status enum defined: PENDING, IN_PROGRESS, COMPLETED, HALTED, CANCELED
4. Foreign key relationship established: OrderItem → Order (cascade delete)
5. Foreign key relationship established: OrderItem → MenuItem
6. Migration script creates orders and order_items tables
7. Seed script creates 2-3 sample orders with items for development

---

#### Story 2.2: Order CRUD API Endpoints

**As a** Restaurant Staff user,  
**I want** API endpoints to create and manage orders,  
**so that** I can take customer orders.

**Acceptance Criteria:**
1. `POST /api/orders` creates new order with tableNumber, serverName (status defaults to PENDING)
2. `GET /api/orders` returns all orders (with optional filters: status, tableNumber)
3. `GET /api/orders/:id` returns single order with all order items and their menu item details
4. `PUT /api/orders/:id` updates order fields (tableNumber, serverName, status)
5. `DELETE /api/orders/:id` deletes order and all associated order items
6. Validation: tableNumber required and must be positive integer, serverName required
7. Response includes full order object with nested orderItems on create/update
8. Appropriate HTTP status codes and error messages for all scenarios

---

#### Story 2.3: Order Item Management API

**As a** Restaurant Staff user,  
**I want** API endpoints to add, update, and remove items from orders,  
**so that** I can build and modify orders.

**Acceptance Criteria:**
1. `POST /api/orders/:orderId/items` adds item to order (menuItemId, quantity, specialInstructions)
2. `PUT /api/orders/:orderId/items/:itemId` updates order item (quantity, specialInstructions)
3. `DELETE /api/orders/:orderId/items/:itemId` removes item from order
4. Validation: quantity must be >= 1, menuItemId must exist and be available
5. Cannot add unavailable (86'd) menu items to orders (400 error)
6. Response returns updated order with all items after modification
7. 404 error if order or item not found

---

#### Story 2.4: Order Status Transitions API

**As a** user (Staff or Kitchen),  
**I want** to update order status with validation,  
**so that** orders follow the correct workflow.

**Acceptance Criteria:**
1. `PATCH /api/orders/:id/status` updates order status with transition validation
2. Valid transitions enforced:
   - PENDING → IN_PROGRESS, CANCELED
   - IN_PROGRESS → COMPLETED, HALTED, CANCELED
   - HALTED → IN_PROGRESS, CANCELED
   - COMPLETED → (no transitions, terminal state)
   - CANCELED → (no transitions, terminal state)
3. Invalid transitions return 400 with descriptive error message
4. Response returns updated order with new status and updatedAt timestamp
5. Status change updates the order's updatedAt field

---

#### Story 2.5: Staff Order Entry UI - Menu Browser

**As a** Restaurant Staff user,  
**I want** to browse available menu items when creating an order,  
**so that** I can quickly find and add items.

**Acceptance Criteria:**
1. Order entry page accessible at `/staff/orders/new` and `/staff/orders/:id/edit`
2. Menu items displayed in a browsable grid/list format
3. Items grouped or filterable by category (Appetizers, Mains, Drinks, Desserts)
4. Secondary filter by food type available
5. Only available (not 86'd) items displayed
6. Each item shows: name, price, image thumbnail
7. Search/filter input for quick item lookup by name
8. Tapping/clicking item adds it to current order (or opens quantity selector)

---

#### Story 2.6: Staff Order Entry UI - Order Builder

**As a** Restaurant Staff user,  
**I want** to build an order with multiple items,  
**so that** I can capture the full customer order.

**Acceptance Criteria:**
1. Order builder panel shows current order summary (table #, server, items)
2. Table number and server name inputs at top of order builder
3. Added items display with: name, quantity, price, subtotal, special instructions
4. Quantity can be adjusted with +/- buttons or direct input
5. "Add Instructions" button opens modal for special instructions per item
6. Remove button (X) removes item from order with confirmation
7. Running total displayed at bottom of order builder
8. Order builder persists state during menu browsing (doesn't reset on filter change)

---

#### Story 2.7: Staff Order Submission

**As a** Restaurant Staff user,  
**I want** to submit completed orders to the kitchen,  
**so that** food preparation can begin.

**Acceptance Criteria:**
1. "Submit Order" button visible when order has table #, server name, and at least one item
2. Button disabled with visual indicator if requirements not met
3. Submit creates order via API and redirects to active orders list
4. Success toast notification: "Order #X submitted to kitchen"
5. Error displays message without losing order data
6. Clear order button resets order builder (with confirmation if items exist)
7. Submitted order status is PENDING

---

#### Story 2.8: Staff Active Orders List

**As a** Restaurant Staff user,  
**I want** to view my active orders and their status,  
**so that** I can track order progress and make edits.

**Acceptance Criteria:**
1. Active orders page at `/staff/orders` displays all non-completed/canceled orders
2. Each order card shows: order ID, table #, server name, status, item count, time since creation
3. Status displayed with color-coded badge (Pending=blue, In Progress=yellow, etc.)
4. Tap/click order opens order detail view
5. "Edit" button on orders in PENDING status opens order editor
6. Filter tabs or dropdown: All, My Orders (by server name), By Status
7. Orders sorted by creation time (newest first) or by status
8. Auto-refresh or manual refresh button to update order list

---

#### Story 2.9: Staff Order Edit Flow

**As a** Restaurant Staff user,  
**I want** to edit submitted orders,  
**so that** I can handle customer changes.

**Acceptance Criteria:**
1. Edit page (`/staff/orders/:id/edit`) loads existing order into order builder
2. Existing items displayed with current quantities and special instructions
3. Staff can add new items, remove items, change quantities, update instructions
4. Table number and server name editable
5. "Save Changes" button updates order via API
6. Success redirects to active orders with confirmation toast
7. "Cancel" returns to active orders without saving changes
8. Warning displayed if editing an IN_PROGRESS order (kitchen already started)
9. Cannot edit COMPLETED or CANCELED orders (redirect to view-only detail)

---

## Epic 3: Kitchen Display & Real-time

### Epic Goal

Deliver a real-time kitchen display system with drag-and-drop status management, priority-based ordering, and instant notifications. By the end of this epic, Kitchen Staff can view all active orders in a kanban-style board, drag orders between status columns, receive alerts for new orders and long wait times — while Staff views also update in real-time without manual refresh, completing the full restaurant order workflow loop.

### Stories

#### Story 3.1: WebSocket Infrastructure Setup

**As a** developer,  
**I want** WebSocket infrastructure integrated with the API,  
**so that** clients can receive real-time updates.

**Acceptance Criteria:**
1. Socket.io server integrated with Express/Fastify app on same port
2. WebSocket connection endpoint available at root path
3. Client can connect, disconnect, and reconnect gracefully
4. Connection events logged for debugging (connect, disconnect, error)
5. Basic room/namespace structure for order updates (e.g., "orders" channel)
6. CORS configured to allow frontend WebSocket connections
7. Connection health check via ping/pong mechanism
8. Shared types for WebSocket events defined in `packages/shared`

---

#### Story 3.2: Real-time Order Events Broadcasting

**As a** developer,  
**I want** order changes to broadcast via WebSocket,  
**so that** all connected clients receive updates instantly.

**Acceptance Criteria:**
1. `order:created` event emitted when new order is created (includes full order data)
2. `order:updated` event emitted when order is modified (includes full order data)
3. `order:status-changed` event emitted when order status changes (includes order ID, old status, new status)
4. `order:deleted` event emitted when order is deleted (includes order ID)
5. `order:item-added` event emitted when item added to order
6. `order:item-updated` event emitted when item modified
7. `order:item-removed` event emitted when item removed
8. Events broadcast to all connected clients in "orders" room
9. API endpoints trigger appropriate events after successful database operations

---

#### Story 3.3: Frontend WebSocket Integration

**As a** developer,  
**I want** the frontend to connect and listen to WebSocket events,  
**so that** UIs can update in real-time.

**Acceptance Criteria:**
1. Socket.io client installed and configured in frontend
2. WebSocket connection established on app load
3. Custom React hook `useOrderEvents()` subscribes to order events
4. Hook provides callbacks for each event type (onCreate, onUpdate, onStatusChange, etc.)
5. Connection status indicator available (connected/disconnected/reconnecting)
6. Automatic reconnection on disconnect with exponential backoff
7. Event listeners properly cleaned up on component unmount
8. TypeScript types for all event payloads from shared package

---

#### Story 3.4: Kitchen Display Board Layout

**As a** Kitchen Staff user,  
**I want** a kanban-style board showing all orders by status,  
**so that** I can see the order queue at a glance.

**Acceptance Criteria:**
1. Kitchen display page at `/kitchen` shows full-screen kanban board
2. Four columns displayed: Pending, In Progress, Halted, Completed
3. Each column header shows status name and order count
4. Columns are visually distinct with status-appropriate colors
5. Board fills available screen space (optimized for large displays)
6. Completed column shows only recent orders (last 30 minutes or configurable)
7. Canceled orders hidden from main view (optional toggle to show)
8. Responsive layout works on tablet (10"+) and desktop screens

---

#### Story 3.5: Kitchen Order Cards

**As a** Kitchen Staff user,  
**I want** order cards showing all relevant details,  
**so that** I can prepare orders correctly.

**Acceptance Criteria:**
1. Each order displayed as a card within its status column
2. Card header shows: Order ID, Table number, time elapsed since creation
3. Card body shows: list of items with quantities and special instructions
4. Special instructions highlighted/emphasized (different background or icon)
5. Server name displayed (for communication if questions arise)
6. Time elapsed updates live (every minute) without page refresh
7. Cards have consistent size with scrollable content if many items
8. Visual indicator for orders with special instructions (icon or badge)

---

#### Story 3.6: Kitchen Drag-and-Drop Status Updates

**As a** Kitchen Staff user,  
**I want** to drag order cards between status columns,  
**so that** I can update order status quickly.

**Acceptance Criteria:**
1. Order cards are draggable within the kanban board
2. Dropping card in new column triggers status update API call
3. Only valid status transitions allowed (invalid drops rejected with visual feedback)
4. Card returns to original column if API call fails
5. Optimistic UI update (card moves immediately, reverts on error)
6. Visual feedback during drag (card opacity, drop zone highlight)
7. Touch-friendly drag support for tablet use
8. Status change triggers WebSocket event for other connected clients

---

#### Story 3.7: Kitchen Real-time Order Updates

**As a** Kitchen Staff user,  
**I want** the board to update automatically when orders change,  
**so that** I always see current information.

**Acceptance Criteria:**
1. New orders appear in Pending column instantly (via WebSocket)
2. Order edits update card content without refresh
3. Status changes from other clients move cards automatically
4. Deleted orders removed from board automatically
5. New order items or removed items reflected on cards
6. No duplicate cards when receiving updates
7. Smooth animations for card additions/removals/moves
8. Board state stays consistent even with rapid updates

---

#### Story 3.8: Kitchen New Order Notifications

**As a** Kitchen Staff user,  
**I want** audio and visual alerts for new orders,  
**so that** I don't miss incoming orders.

**Acceptance Criteria:**
1. Audio notification plays when new order arrives (configurable sound)
2. Visual notification: brief highlight/flash on Pending column
3. New order card has temporary highlight animation (fades after 5 seconds)
4. Browser notification (if permitted) shows "New Order - Table X"
5. Sound can be muted/unmuted via toggle button on kitchen display
6. Sound preference persisted in localStorage
7. Multiple rapid orders don't overlap sounds (queue or debounce)
8. Notification works even when browser tab is in background

---

#### Story 3.9: Kitchen Long Wait Time Alerts

**As a** Kitchen Staff user,  
**I want** visual alerts for orders waiting too long,  
**so that** I can prioritize delayed orders.

**Acceptance Criteria:**
1. Orders in Pending status > 10 minutes show warning indicator (yellow)
2. Orders in Pending status > 20 minutes show critical indicator (red)
3. Orders in In Progress > 30 minutes show warning indicator
4. Warning/critical thresholds configurable (environment variable or settings)
5. Alert indicator: colored border, pulsing animation, or icon badge
6. Time thresholds displayed on hover/tap (e.g., "Waiting 15 minutes")
7. Priority sorting option: orders with alerts float to top of column
8. Alert state updates in real-time as elapsed time increases

---

#### Story 3.10: Staff Views Real-time Updates

**As a** Restaurant Staff user,  
**I want** order status to update in real-time on my screens,  
**so that** I know when orders are ready.

**Acceptance Criteria:**
1. Active orders list (`/staff/orders`) updates via WebSocket
2. Order status badges update without page refresh
3. New orders created by other staff appear in list (if filter allows)
4. Edited orders reflect changes immediately
5. Deleted orders removed from list automatically
6. Optional: subtle notification when order status changes to COMPLETED
7. "Last updated" timestamp or live indicator shown
8. Works alongside manual refresh button (both options available)

---

## Epic 4: Enhancements & Polish

### Epic Goal

Improve the overall quality, performance, and developer experience of RestaurantFlow. This epic addresses technical debt, enhances accessibility, establishes comprehensive testing infrastructure, adds quality-of-life features for both users and developers, and introduces operational capabilities like order deletion and kitchen ticket printing. By the end of this epic, the application will be production-ready with robust testing, documentation, optimized performance, and practical kitchen workflow tools.

### Stories

#### Story 4.1: Performance Optimizations

**As a** Restaurant Staff or Kitchen user,  
**I want** the application to remain fast and responsive even with many active orders,  
**so that** I can efficiently manage high-volume service periods without UI lag.

**Acceptance Criteria:**
1. List components (OrderCard, KitchenOrderCard, MenuItemCard) use React.memo to prevent unnecessary re-renders
2. CSS containment applied to animated components for improved animation performance
3. Menu items API response cached client-side with 5-minute TTL
4. Order list renders smoothly with 100+ active orders
5. WebSocket message batching implemented for high-volume updates (>10 messages/second)
6. Performance metrics logged in development mode for monitoring
7. No visual regressions from optimizations

---

#### Story 4.2: UX Refinements

**As a** Restaurant Staff user,  
**I want** keyboard shortcuts and improved interactions,  
**so that** I can work faster during busy service periods.

**Acceptance Criteria:**
1. Keyboard shortcuts available for common actions (documented in help modal)
2. `Ctrl+N` creates new order from Orders page
3. `Ctrl+R` refreshes current view
4. `Escape` closes modals and cancels edit forms
5. Menu items can be reordered within categories via drag-and-drop (Admin)
6. Dark mode toggle available for Kitchen Display (easier on eyes in low-light)
7. Bulk status update available for multiple orders (Kitchen)
8. Mobile responsiveness improved for Staff order entry on tablets

---

#### Story 4.3: Tech Debt Reduction

**As a** Developer,  
**I want** to reduce accumulated technical debt,  
**so that** the codebase remains maintainable and tests are reliable.

**Acceptance Criteria:**
1. All React act() warnings in test suite suppressed or fixed properly
2. Duplicate validation logic consolidated into shared utilities
3. Error handling follows consistent pattern across all API routes
4. TypeScript strict mode enabled and all errors resolved
5. Unused dependencies removed from all packages
6. Console warnings/errors in test output reduced to zero (non-test-failure warnings)
7. ESLint rules consistent across all packages

---

#### Story 4.4: Accessibility Improvements

**As a** user with accessibility needs,  
**I want** the application to be fully accessible,  
**so that** I can use all features regardless of ability.

**Acceptance Criteria:**
1. Screen reader announcements for real-time order status changes
2. ARIA live regions properly implemented for dynamic content
3. High contrast mode toggle available in all interfaces
4. Focus management correct when modals open/close
5. All interactive elements keyboard accessible
6. Color contrast meets WCAG 2.1 AA standards (4.5:1 minimum)
7. Skip links provided for main content areas
8. Form error messages properly associated with inputs

---

#### Story 4.5: Testing Infrastructure

**As a** Developer,  
**I want** comprehensive testing infrastructure,  
**so that** I can catch regressions and ensure quality with confidence.

**Acceptance Criteria:**
1. End-to-end tests cover critical user flows (order creation, status updates, menu management)
2. Visual regression testing prevents unintended UI changes
3. Load testing validates WebSocket connection stability under stress
4. API contract tests ensure frontend/backend compatibility
5. Test coverage reports generated and tracked
6. CI pipeline runs all test types on PR
7. Test documentation explains testing strategy and how to run tests

---

#### Story 4.6: Developer Experience

**As a** Developer,  
**I want** comprehensive documentation and development tools,  
**so that** I can understand the codebase and develop efficiently.

**Acceptance Criteria:**
1. Storybook configured with all reusable UI components documented
2. OpenAPI/Swagger documentation available at `/api/docs`
3. Component props documented with TypeScript JSDoc comments
4. Development environment setup automated with single command
5. Hot module replacement (HMR) working for all packages
6. Git hooks configured for pre-commit linting and testing
7. README updated with architecture overview and quick start guide

---

#### Story 4.7: Order Deletion

**As a** Restaurant Staff user,  
**I want** the ability to delete orders from the system,  
**so that** I can remove cancelled, mistaken, or test orders that are no longer needed.

**Acceptance Criteria:**
1. Delete button visible on order detail/edit page for PENDING and CANCELED orders only
2. Delete action requires confirmation dialog with order summary
3. Successful deletion redirects to orders list with success toast notification
4. `DELETE /api/orders/:id` endpoint removes order and all associated order items
5. `order:deleted` WebSocket event broadcasts to update all connected clients
6. Cannot delete IN_PROGRESS or COMPLETED orders (button disabled/hidden with tooltip)
7. Deletion is permanent - no soft delete or undo functionality required
8. Orders list updates in real-time when another user deletes an order

---

#### Story 4.8: Print Kitchen Tickets

**As a** Kitchen Staff user,  
**I want** to print kitchen tickets for orders from the Kitchen Display,  
**so that** I have a physical reference during food preparation and can track orders without relying solely on the screen.

**Acceptance Criteria:**
1. Print button visible on each KitchenOrderCard (printer icon)
2. Print button also available in order detail/expanded view
3. Clicking print opens browser print dialog with thermal-receipt-style layout (80mm width)
4. Printed ticket includes: Order ID, Table Number, Server Name, Order Time, Items grouped by category
5. Each item shows: quantity, name, and special instructions (highlighted)
6. Ticket includes item prices and order total at bottom
7. QR code on ticket links to order detail page for quick lookup
8. Print-specific CSS ensures clean output (no UI chrome, optimized for thermal printers)
9. Ticket header shows restaurant name (configurable) and print timestamp
10. Multiple tickets can be printed in sequence without page refresh

---

## Checklist Results Report

*To be completed after PRD review*

---

## Next Steps

### UX Expert Prompt

> Review the RestaurantFlow PRD at `docs/prd.md`. Focus on the User Interface Design Goals section and Core Screens. Create wireframes or design specifications for the three main interfaces (Admin Menu Management, Staff Order Entry, Kitchen Display Board) ensuring touch-friendly interactions and real-time update patterns.

### Architect Prompt

> Review the RestaurantFlow PRD at `docs/prd.md`. Create the technical architecture document covering: monorepo structure, database schema (PostgreSQL with Prisma), REST API design, WebSocket event architecture (Socket.io), and deployment configuration (Docker). Pay special attention to real-time synchronization patterns and concurrent edit handling.

---

*Generated by Mary, Business Analyst — BMAD Framework*  
*January 13, 2026*
