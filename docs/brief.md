# Project Brief: Restaurant Order & Menu Management System

---

## Executive Summary

**RestaurantFlow** is a self-hosted web application for managing restaurant menu items and order workflows. The system solves the core operational challenge of getting orders from servers to the kitchen efficiently while maintaining menu accuracy and availability.

**Target Market:** Small to medium restaurants seeking a simple, self-hosted solution for internal order management.

**Key Value Proposition:** A streamlined, staff-focused system that handles the essential restaurant workflow — menu management, order taking, and kitchen display — without the complexity and cost of enterprise POS systems.

---

## Problem Statement

### Current State & Pain Points
Restaurants need to coordinate between front-of-house staff taking orders and kitchen staff preparing them. This communication flow is critical to operations:
- Orders must be accurately captured with all details (items, quantities, special instructions)
- Kitchen needs real-time visibility into incoming orders
- Menu availability must be current to prevent over-selling
- Staff need to modify orders after submission when customers change their minds

### Why Existing Solutions Fall Short
- **Enterprise POS systems:** Overly complex, expensive, require vendor lock-in
- **Paper tickets:** Error-prone, no real-time status updates, hard to track
- **Generic order systems:** Not tailored to restaurant workflows (coursing, kitchen display, 86'd items)

### Urgency
This is a learning/exploration project — urgency is self-directed. The goal is to build a functional system that demonstrates full-stack development capabilities while solving a real operational problem.

---

## Proposed Solution

### Core Concept
A three-module web application that mirrors the natural restaurant workflow:
1. **Menu Management** — Admin maintains menu items, categories, pricing, and availability
2. **Order Management** — Staff creates and manages orders linked to tables
3. **Kitchen Display** — Kitchen staff views incoming orders and updates status in real-time

### Key Differentiators
- **Self-hosted:** Full control over data and infrastructure
- **Staff-focused:** No customer-facing complexity for v1
- **Real-time:** WebSocket-based updates for instant kitchen notification
- **Simple:** Essential features only, no bloat

### Why This Will Succeed
By focusing on the core loop (Menu → Order → Kitchen) and deferring advanced features (modifiers, variants, reporting), the MVP remains achievable while delivering genuine operational value.

---

## Target Users

### Primary User Segment: Restaurant Staff (Servers)

| Attribute | Description |
|-----------|-------------|
| **Role** | Front-of-house servers taking customer orders |
| **Current Behavior** | Takes orders tableside, communicates to kitchen |
| **Key Needs** | View menu, check availability, create/edit orders quickly |
| **Pain Points** | Errors in communication, inability to modify sent orders, unclear item availability |
| **Goals** | Fast, accurate order entry; keep customers happy |

### Secondary User Segment: Kitchen Staff

| Attribute | Description |
|-----------|-------------|
| **Role** | Back-of-house cooks and kitchen managers |
| **Current Behavior** | Receives orders, prepares food, manages workflow |
| **Key Needs** | Clear order queue, status management, priority visibility |
| **Pain Points** | Lost tickets, unclear order priority, no status tracking |
| **Goals** | Efficient order throughput; clear communication with front-of-house |

### Tertiary User Segment: Admin (Manager/Owner)

| Attribute | Description |
|-----------|-------------|
| **Role** | Restaurant manager or owner |
| **Current Behavior** | Manages menu, pricing, monitors operations |
| **Key Needs** | Menu CRUD, availability control, operational visibility |
| **Pain Points** | Outdated menus, manual availability tracking |
| **Goals** | Accurate menu, smooth operations, future analytics |

---

## Goals & Success Metrics

### Business Objectives
- Build a fully functional restaurant order management system as a learning project
- Demonstrate full-stack TypeScript/Node.js capabilities
- Create a portfolio piece showcasing real-time web application development

### User Success Metrics
- Staff can create an order in under 30 seconds
- Kitchen receives orders within 1 second of submission
- Order status updates reflect in real-time across all clients
- Menu changes propagate immediately to order interface

### Key Performance Indicators (KPIs)
- **Order Creation Time:** < 30 seconds from start to submission
- **Real-time Latency:** < 1 second for order/status updates
- **System Uptime:** 99%+ availability during restaurant hours
- **Error Rate:** < 1% failed order submissions

---

## MVP Scope

### Core Features (Must Have)

#### Menu Management
- **Menu Item CRUD:** Create, read, update, delete menu items
- **Item Fields:** Name, price, ingredients, image, category, availability
- **Category Management:** Organize by course (Appetizers, Mains, Drinks, Desserts) and/or type (Meat, Pasta, Pizza)
- **Availability Toggle:** Mark items as available/unavailable (86'd)

#### Order Management
- **Create Order:** New order with table number, server name, timestamp
- **Add Line Items:** Select menu items with quantity and special instructions
- **Edit Orders:** Add, remove, or modify items even after submission
- **Order Status:** Track status (Pending → In Progress → Completed → Halted → Canceled)

#### Kitchen Display
- **Order Queue:** View all active orders in real-time
- **Order Cards:** Display table #, items, time elapsed, special instructions
- **Drag-and-Drop Status:** Move orders between status columns
- **Priority Display:** Oldest orders first with visual alerts for long wait times
- **New Order Notifications:** Audio/visual alert when new orders arrive

### Out of Scope for MVP
- Customer-facing ordering interface
- Payment processing / billing
- Modifiers and add-ons (e.g., "extra cheese +$1")
- Size variants (S/M/L)
- Nutritional information display
- Allergen warnings
- Split bills / multiple tickets per table
- Coursing (fire appetizers before mains)
- Reporting and analytics dashboard
- Inventory management
- User authentication (simplified for MVP)

### MVP Success Criteria
The MVP is successful when:
1. Admin can manage a complete menu with all required fields
2. Staff can create orders, add items, and submit to kitchen
3. Kitchen can view orders in real-time and update status via drag-and-drop
4. All status changes reflect immediately across all connected clients
5. System handles concurrent users without data conflicts

---

## Post-MVP Vision

### Phase 2 Features
- **Modifiers System:** Add-ons with price adjustments
- **Size Variants:** Multiple sizes per item with pricing
- **Special Instructions:** Enhanced notes and customization options
- **User Authentication:** Role-based access (Admin, Staff, Kitchen)

### Phase 3 Features
- **Reporting Dashboard:** Revenue tracking (daily/weekly/monthly)
- **Popular Items Analytics:** Top sellers, least ordered
- **Nutritional Information:** Calories, macros per item
- **Allergen Tracking:** Flag items containing common allergens

### Long-term Vision
- Customer self-ordering via QR code at table
- Inventory integration with automatic availability updates
- Multi-location support
- Third-party delivery platform integration
- Mobile apps for staff and kitchen

### Expansion Opportunities
- White-label solution for other restaurants
- Integration marketplace (accounting, inventory, delivery)
- Table reservation management
- Customer loyalty program

---

## Technical Considerations

### Platform Requirements
- **Target Platform:** Web application (responsive design)
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Performance Requirements:** Real-time updates < 1 second latency

### Technology Preferences
- **Frontend:** React or Vue.js with TypeScript
- **Backend:** Node.js with TypeScript, Express or Fastify
- **Database:** PostgreSQL (relational, good for transactional data)
- **Hosting/Infrastructure:** Self-hosted (Docker recommended)

### Architecture Considerations
- **Repository Structure:** Monorepo with shared types between frontend/backend
- **Service Architecture:** Single service for MVP, potential microservices later
- **Integration Requirements:** WebSocket (Socket.io) for real-time updates
- **Security/Compliance:** Basic auth for MVP, JWT-based auth for Phase 2

---

## Constraints & Assumptions

### Constraints
- **Budget:** $0 (learning project, open-source tools only)
- **Timeline:** Self-paced exploration project
- **Resources:** Solo developer
- **Technical:** Must be self-hostable, no vendor dependencies

### Key Assumptions
- Restaurant has reliable network connectivity
- Staff has access to web-capable devices (tablets, computers)
- Kitchen has a dedicated display screen
- Single restaurant location (no multi-tenancy for MVP)
- Menu items don't require complex pricing rules for MVP
- Orders are placed by staff, not customers directly

---

## Risks & Open Questions

### Key Risks
- **Real-time Complexity:** WebSocket implementation may introduce debugging challenges
- **Concurrent Editing:** Multiple staff editing same order could cause conflicts
- **Kitchen Display UX:** Drag-and-drop may be awkward on touch screens
- **Scope Creep:** Temptation to add "just one more feature"

### Open Questions
- How should authentication work across the three roles?
- What happens to completed orders? Archive? Delete after X days?
- Should there be a "recall" feature for orders sent by mistake?
- How long should order history be retained?
- What's the maximum number of concurrent orders the system should handle?

### Areas Needing Further Research
- WebSocket scaling strategies for busy periods
- Offline resilience (what if network drops mid-order?)
- Kitchen display hardware recommendations
- Touch-friendly drag-and-drop libraries

---

## Appendices

### A. Research Summary

**Source:** Brainstorming session conducted January 13, 2026

**Techniques Used:**
1. Role Playing — Identified 3 user roles and their needs
2. Mind Mapping — Defined 4 system modules and components
3. First Principles Thinking — Prioritized MVP features

**Key Findings:**
- Core workflow is tight: Menu → Order → Kitchen
- Real-time updates are essential, not optional
- Simplicity enables project completion
- Reporting is genuinely optional for MVP

### B. Related Documents
- [Brainstorming Session Results](brainstorming-session-results.md)

---

## Next Steps

### Immediate Actions
1. Review and refine this Project Brief
2. Set up development environment (Node.js, TypeScript, PostgreSQL)
3. Create PRD with detailed user stories and acceptance criteria
4. Design database schema for Menu, Orders, and Users
5. Prototype kitchen display UI for drag-and-drop validation

### PM Handoff
This Project Brief provides the full context for **RestaurantFlow**. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section as the template indicates, asking for any necessary clarification or suggesting improvements.

---

*Generated by Mary, Business Analyst — BMAD Framework*  
*January 13, 2026*
