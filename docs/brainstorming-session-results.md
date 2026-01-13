# Brainstorming Session Results

**Session Date:** January 13, 2026  
**Facilitator:** Business Analyst Mary  
**Participant:** User

---

## Executive Summary

**Topic:** Restaurant Order & Menu Management System

**Session Goals:** Broad exploration of a web-based restaurant management system for learning/exploration purposes, keeping scope simple and focused.

**Techniques Used:**
1. Role Playing (~15 min) - User identification and needs discovery
2. Mind Mapping (~20 min) - System component visualization
3. First Principles Thinking (~10 min) - MVP prioritization

**Total Ideas Generated:** 4 modules, 3 user roles, 25+ feature decisions

**Key Themes Identified:**
- Staff-only system (no customer-facing features for v1)
- Core loop: Menu → Orders → Kitchen
- Simplicity over feature-richness for exploration project
- Clear separation of concerns between user roles

---

## Technique Sessions

### 1. Role Playing — User Discovery

**Description:** Identified key system users by exploring who interacts with the restaurant order & menu management system and what actions they need to perform.

**Users Identified:**

| Role | Key Actions | Notes |
|------|-------------|-------|
| **Restaurant Staff** (servers) | View menu, create orders (with table #), add food/drink items, modify items, edit orders after submission, check availability | Can modify orders even after sent to kitchen |
| **Kitchen Staff** | View orders, mark status (In Progress / Completed / Halted / Canceled) | Single unified dashboard, no station splits |
| **Admin** | Modify menu (add/edit/remove items), set pricing, manage availability (86'd items), view reports & stats | Full control + visibility |

**Insights Discovered:**
- Customer-facing features explicitly out of scope for v1
- Kitchen needs unified view (no station-based splitting)
- Orders need table number association from creation
- Staff needs ability to edit orders post-submission

**Notable Connections:**
- Admin role bridges Menu Management and Reporting modules
- Restaurant Staff and Kitchen Staff connected via Order status flow

---

### 2. Mind Mapping — System Components

**Description:** Visualized the major modules of the system and their sub-features, building out from the central concept.

**Modules Mapped:**

#### Module 1: Menu Management
| Component | Details |
|-----------|---------|
| **Item Fields** | Name, Price, Ingredients, Image, Category, Nutritional Value, Allergens |
| **Categories** | By Course (Appetizers, Mains, Drinks, Desserts) AND/OR By Type (Meat, Pasta, Pizza, etc.) |
| **Modifiers** | Add-ons with price adjustments (e.g., "Extra cheese +$1") |
| **Variants/Sizes** | Size options affecting price (S/M/L, 10"/14") |
| **Availability** | Toggle on/off (86'd) |
| **Specials** | ~~Skipped~~ — keeping it simple |

#### Module 2: Order Management
| Component | Details |
|-----------|---------|
| **Order Info** | Table number, server name, timestamp, order status |
| **Line Items** | Menu items, quantity, selected modifiers/variants, special instructions |
| **Editing** | Add items, remove items, change items (even after sent to kitchen) |
| **Split Bills** | ~~Skipped~~ |
| **Multiple Tickets** | ~~Skipped~~ |
| **Coursing** | ~~Skipped~~ |

**Order Statuses:** Pending → In Progress → Completed → Halted → Canceled

#### Module 3: Kitchen Display
| Component | Details |
|-----------|---------|
| **Order Cards** | Table #, items, modifiers, time elapsed, special instructions |
| **Status Updates** | Drag-and-drop to columns |
| **Prioritization** | Oldest first ordering + alerts for long wait times |
| **Notifications** | Sound/alert on new order arrival |

#### Module 4: Reporting/Analytics
| Component | Details |
|-----------|---------|
| **Revenue** | Daily/weekly/monthly sales |
| **Popular Items** | Top selling items |
| **Format** | Simple dashboard |

**Insights Discovered:**
- Core system loop: Menu exists → Staff creates orders → Kitchen receives orders
- Reporting is supplementary, not essential to core flow
- Real-time features (notifications, alerts) important for kitchen efficiency

**Notable Connections:**
- Menu items flow into Order line items
- Order status updates flow from Kitchen back to Staff visibility
- All modules feed data into Reporting

---

### 3. First Principles Thinking — MVP Prioritization

**Description:** Stripped away complexity to identify the essential core features needed for a functional v1 exploration project.

**Core Dependencies Identified:**
```
Menu Management (foundation) → Order Management → Kitchen Display → Reporting (optional)
```

**MVP Scope Decisions:**

#### Menu Management MVP
| Must-Have (MVP) | Add Later |
|-----------------|-----------|
| Name | Nutritional Value |
| Price | Allergens |
| Ingredients | Modifiers |
| Image | Variants/Sizes |
| Category | |
| Availability | |

#### Order Management MVP
| Must-Have (MVP) | Add Later |
|-----------------|-----------|
| Table # | Modifiers (line item) |
| Server name | Variants (line item) |
| Timestamp | |
| Status | |
| Line items (item + qty) | |
| Special instructions | |
| Add/remove/edit orders | |

#### Kitchen Display MVP
| Must-Have (MVP) | Add Later |
|-----------------|-----------|
| Order cards (table #, items, time elapsed, special instructions) | *(nothing deferred)* |
| Drag-and-drop status columns | |
| Oldest-first ordering | |
| Alerts for long wait times | |
| New order notifications | |

#### Reporting
| Must-Have (MVP) | Add Later |
|-----------------|-----------|
| *(entire module deferred)* | Revenue (daily/weekly/monthly) |
| | Popular items |

**Insights Discovered:**
- Menu Management is the true foundation — can't order what doesn't exist
- Kitchen Display kept full-featured despite being "later" in the chain
- Reporting provides value but isn't essential for core functionality

---

## Idea Categorization

### Immediate Opportunities
*Ideas ready to implement now*

1. **Core Menu CRUD**
   - Description: Basic menu item management with essential fields
   - Why immediate: Foundation for everything else
   - Resources needed: Database schema, Admin UI

2. **Order Creation Flow**
   - Description: Staff can create orders with table #, add items, submit to kitchen
   - Why immediate: Primary user workflow
   - Resources needed: Order UI, real-time updates

3. **Kitchen Display Board**
   - Description: Real-time view of orders with drag-and-drop status management
   - Why immediate: Completes the core loop
   - Resources needed: WebSocket/real-time infrastructure, notification system

### Future Innovations
*Ideas requiring development/research*

1. **Modifiers & Variants System**
   - Description: Add-ons and size options for menu items
   - Development needed: Complex pricing logic, UI for selection
   - Timeline estimate: Post-MVP enhancement

2. **Nutritional & Allergen Information**
   - Description: Health and dietary information per item
   - Development needed: Data entry workflow, display integration
   - Timeline estimate: Post-MVP enhancement

3. **Analytics Dashboard**
   - Description: Revenue tracking and popular item insights
   - Development needed: Data aggregation, charting library
   - Timeline estimate: Post-MVP enhancement

### Moonshots
*Ambitious, transformative concepts (not in current scope)*

1. **Customer Self-Ordering**
   - Description: Customer-facing ordering interface (QR code at table)
   - Transformative potential: Reduce staff workload, faster ordering
   - Challenges to overcome: UX complexity, payment integration

2. **Inventory Integration**
   - Description: Auto-update availability based on ingredient stock
   - Transformative potential: Prevent over-selling, reduce waste
   - Challenges to overcome: Inventory tracking system, supplier integration

### Insights & Learnings
*Key realizations from the session*

- **Simplicity enables exploration**: By deferring advanced features, the MVP remains achievable for a learning project
- **User roles drive architecture**: Clear role separation (Staff/Kitchen/Admin) naturally maps to distinct system modules
- **Real-time is essential**: Kitchen operations require immediate updates — this is a core architectural consideration, not a nice-to-have
- **The core loop is tight**: Menu → Order → Kitchen forms an inseparable unit; Reporting is truly optional

---

## Action Planning

### Top 3 Priority Ideas

1. **Menu Management Module**
   - Rationale: Foundation that all other modules depend on
   - Next steps: Design database schema, build Admin CRUD interface
   - Resources needed: Node.js/TypeScript setup, database selection (PostgreSQL recommended)

2. **Order Management Module**
   - Rationale: Primary workflow for restaurant staff
   - Next steps: Design order data model, build staff ordering UI
   - Resources needed: Real-time framework (Socket.io), state management

3. **Kitchen Display Module**
   - Rationale: Completes the core operational loop
   - Next steps: Design kanban-style board UI, implement drag-and-drop
   - Resources needed: Real-time subscriptions, notification/alert system

### Timeline Considerations
- **Phase 1 (MVP):** Menu + Orders + Kitchen Display
- **Phase 2:** Modifiers, Variants, Special Instructions enhancements
- **Phase 3:** Reporting & Analytics
- **Phase 4:** Advanced features (allergens, nutrition, etc.)

---

## Technical Context

| Aspect | Decision |
|--------|----------|
| **Platform** | Web application |
| **Tech Stack** | Node.js + TypeScript |
| **Hosting** | Self-hosted |
| **Architecture** | Real-time required (WebSockets) |

---

## Reflection & Follow-up

### What Worked Well
- Role Playing effectively identified all key users and their needs
- Mind Mapping created clear module boundaries
- First Principles stripped away scope creep before it started

### Areas for Further Exploration
- Authentication & authorization (who can access what?)
- Database schema design
- Real-time architecture patterns
- UI/UX design for touch-friendly kitchen displays

### Recommended Follow-up
- Create formal Project Brief document
- Design system architecture
- Build technical specification for MVP modules

### Questions for Future Sessions
- How should authentication work across the three roles?
- What happens to completed orders? Archive? Delete?
- Should there be a "recall" feature for orders sent to kitchen by mistake?
- How long should order history be retained?

---

*Generated by Mary, Business Analyst — BMAD Framework*
