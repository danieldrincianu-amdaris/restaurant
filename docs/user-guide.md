# RestaurantFlow User Guide

Welcome to RestaurantFlow — a modern restaurant order management system designed to streamline communication between front-of-house staff and the kitchen.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Home Page](#home-page)
3. [Staff Interface](#staff-interface)
   - [Orders List](#orders-list)
   - [Creating a New Order](#creating-a-new-order)
   - [Editing an Order](#editing-an-order)
   - [Deleting an Order](#deleting-an-order)
4. [Kitchen Display](#kitchen-display)
   - [Order Queue](#order-queue)
   - [Drag-and-Drop Status Updates](#drag-and-drop-status-updates)
   - [Printing Kitchen Tickets](#printing-kitchen-tickets)
   - [Wait Time Alerts](#wait-time-alerts)
   - [Bulk Actions](#bulk-actions)
5. [Menu Management (Admin)](#menu-management-admin)
   - [Viewing Menu Items](#viewing-menu-items)
   - [Adding a Menu Item](#adding-a-menu-item)
   - [Editing a Menu Item](#editing-a-menu-item)
   - [Managing Availability](#managing-availability)
6. [Real-Time Updates](#real-time-updates)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

RestaurantFlow runs in your web browser. No installation is required — simply navigate to the application URL provided by your administrator.

### Supported Browsers

- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

### Display Modes

The application supports both **light** and **dark** modes. The display mode follows your system preferences automatically.

---

## Home Page

When you first open RestaurantFlow, you'll see the home page with quick access options:

| Button | Description |
|--------|-------------|
| **Staff Portal** | For servers and front-of-house staff to manage orders |
| **Kitchen Display** | For kitchen staff to view and process orders |

The header navigation bar provides quick access to all areas:
- **+ New Order** (green button) — Quickly start a new order
- **Orders** — View and manage all orders
- **Menu** — Manage menu items (admin)
- **👨‍🍳 Kitchen** — Access kitchen display

Click the appropriate button based on your role.

---

## Staff Interface

The Staff Portal is where servers create and manage customer orders.

### Orders List

**URL:** `/staff/orders`

The Orders List shows all current orders with their status, table number, server name, and time elapsed.

#### Order Status Colors

| Status | Color | Description |
|--------|-------|-------------|
| **Pending** | Blue | Order submitted, waiting for kitchen |
| **In Progress** | Yellow | Kitchen is preparing the order |
| **Completed** | Green | Order is ready for pickup |
| **Halted** | Red | Order preparation paused |
| **Canceled** | Gray | Order has been canceled |

#### Filtering Orders

Use the filter tabs at the top to view:
- **All** — All orders
- **Pending** — Orders waiting for kitchen
- **In Progress** — Orders being prepared
- **Completed** — Finished orders
- **My Orders** — Orders you created (by server name)

#### Sorting Orders

Click the sort dropdown to arrange orders by:
- Newest first
- Oldest first
- Table number

### Creating a New Order

1. Click the **+ New Order** button in the top right
2. Enter the **Table Number** (required)
3. Enter your **Server Name** (required)
4. Browse the menu on the left side:
   - Use category tabs (All, Appetizer, Main, Drink, Dessert) to filter
   - Use the food type dropdown for more specific filtering
   - Use the search bar to find items by name
5. Click a menu item to add it to the order
6. In the order builder (right side):
   - Adjust quantity using **+** and **-** buttons
   - Click **+ Instructions** to add special instructions (e.g., "no onions")
   - Click the **×** button to remove an item
7. Review the order total
8. Click **Submit Order** to send to kitchen

> **Tip:** Only available menu items are shown. If an item is grayed out or missing, it may be marked as unavailable (86'd) by the admin.

### Editing an Order

1. Click on any order card in the Orders List
2. You'll see the Edit Order page with the same menu browser
3. Make your changes:
   - Add new items by clicking menu items
   - Remove items by clicking the **×** button
   - Adjust quantities with **+** and **-** buttons
   - Edit special instructions as needed
4. Click **Save Changes** to update the order

> **Warning:** If an order is already **In Progress**, you'll see a warning that changes may affect kitchen preparation. Proceed with caution.

> **Note:** **Completed** and **Canceled** orders cannot be edited.

### Deleting an Order

Orders can be deleted if they are in **Pending** or **Canceled** status.

1. Open the order by clicking on it in the Orders List
2. Click the **Delete Order** button (top right, shown in red)
3. Review the order summary in the confirmation dialog
4. Click **Delete Order** to confirm

> **Important:** Deletion is permanent and cannot be undone.

> **Note:** Orders that are **In Progress** or **Completed** cannot be deleted. The delete button will be disabled with an explanation tooltip.

---

## Kitchen Display

The Kitchen Display provides a real-time view of all orders for kitchen staff.

**URL:** `/kitchen`

### Order Queue

Orders are organized into columns by status:

| Column | Description |
|--------|-------------|
| **Pending** | New orders waiting to be started |
| **In Progress** | Orders currently being prepared |
| **Completed** | Finished orders ready for pickup |

Each order card shows:
- **Order ID** (last 6 characters)
- **Table Number**
- **Time Elapsed** since order creation
- **Order Items** with quantities
- **Special Instructions** (highlighted with 🗒️ icon)
- **Server Name**

### Drag-and-Drop Status Updates

To update an order's status:

1. Click and hold an order card
2. Drag it to the appropriate column
3. Release to drop

Valid status transitions:
- **Pending** → **In Progress** (start cooking)
- **In Progress** → **Completed** (order ready)
- **In Progress** → **Halted** (pause order)
- **Halted** → **In Progress** (resume order)

> **Keyboard Users:** Select an order card with Tab, press Enter or Space to pick it up, use arrow keys to move, and press Enter or Space to drop.

### Printing Kitchen Tickets

Each order card includes a printer icon button that allows you to print a physical kitchen ticket.

#### How to Print a Ticket

1. Locate the order card you want to print
2. Click the **🖨️ printer icon** in the top-right corner of the card
3. Your browser's print dialog will open
4. Select your printer (thermal or standard)
5. Click **Print**

#### Ticket Content

The printed ticket includes:
- **Restaurant Name** (configurable in settings)
- **Order ID** (short format, last 6 characters)
- **Table Number**
- **Server Name**
- **Order Time**
- **Items grouped by category** (Appetizers, Mains, Drinks, Desserts)
- **Item quantities and prices**
- **Special instructions** (highlighted with arrow indicator)
- **Order Total**
- **QR Code** (scan to view order details)
- **Print timestamp**

#### Printer Recommendations

**Thermal Printers (Recommended):**
- The ticket is optimized for 80mm thermal receipt printers
- No ink or toner required
- Fast printing
- Common models: Star TSP100, Epson TM-T20, Bixolon SRP-350

**Standard Printers:**
- Can also print on standard letter/A4 paper
- May require manual paper trimming
- Recommended: Print in portrait mode

#### Reprint Capability

You can print tickets multiple times without any restrictions:
- Print during order creation for immediate kitchen reference
- Print again if the original ticket is lost or damaged
- Print for multiple kitchen stations

> **Tip:** Configure your restaurant name by setting the `VITE_RESTAURANT_NAME` environment variable before starting the application.

### Wait Time Alerts

Orders that have been waiting too long will display visual alerts:

| Alert Level | Border Color | Trigger |
|-------------|--------------|---------|
| **Warning** | Yellow (pulsing) | Pending >10 min, In Progress >30 min |
| **Critical** | Red (pulsing) | Pending >20 min |

A ⚠️ icon appears next to the time display for orders with alerts.

### Bulk Actions

For high-volume periods, you can update multiple orders at once:

1. Click **Select Orders** to enable selection mode
2. Check the boxes on orders you want to update
3. Use the toolbar buttons:
   - **Mark In Progress** — Move all selected to In Progress
   - **Mark Completed** — Move all selected to Completed
4. Click **Cancel** to exit selection mode

---

## Menu Management

The Menu page allows managers to manage the restaurant's menu items.

**URL:** `/admin/menu`

### Viewing Menu Items

The Menu Management page displays all menu items in a grid or list view.

#### Filtering Options

- **Category Filter:** Appetizer, Main, Drink, Dessert
- **Food Type Filter:** Meat, Pasta, Pizza, Seafood, Vegetarian, etc.
- **Availability Filter:** Available, Unavailable, All
- **Search:** Find items by name

### Adding a Menu Item

1. Click **+ Add Item** button
2. Fill in the form:
   - **Name** (required) — Item name as it appears on menu
   - **Price** (required) — Price in dollars (e.g., 12.99)
   - **Category** (required) — Appetizer, Main, Drink, or Dessert
   - **Food Type** — More specific classification
   - **Ingredients** — List of ingredients (press Enter to add each)
   - **Image** — Upload a photo (optional)
   - **Available** — Toggle on/off
3. Click **Save** to create the item

### Editing a Menu Item

1. Click on a menu item card, or click the **Edit** button
2. Modify any fields in the form
3. Click **Save** to update

### Managing Availability

To quickly mark an item as unavailable (86'd):

1. Find the item in the menu list
2. Click the availability toggle switch
3. The item will immediately become unavailable across all staff views

> **Note:** Unavailable items are hidden from the order entry menu browser. Staff cannot add unavailable items to orders.

---

## Real-Time Updates

RestaurantFlow uses WebSocket technology to provide instant updates across all connected devices.

### What Updates in Real-Time?

| Event | What Happens |
|-------|--------------|
| **New Order Created** | Order appears in Kitchen Display and Orders List |
| **Order Status Changed** | Status badge updates, order moves to correct column |
| **Order Items Modified** | Item list updates on all views |
| **Order Deleted** | Order disappears from all views |
| **Menu Item Availability Changed** | Item shows/hides in order entry menu |

### Connection Status

Look for the connection indicator in the navigation bar:
- **🟢 Green dot** — Connected, receiving live updates
- **🔴 Red dot** — Disconnected, updates may be delayed

If disconnected, the application will automatically attempt to reconnect.

---

## Keyboard Shortcuts

RestaurantFlow supports keyboard navigation for accessibility and power users.

### Global Shortcuts

| Key | Action |
|-----|--------|
| **?** | Show keyboard shortcuts help |
| **Esc** | Close modal or cancel action |

### Kitchen Display

| Key | Action |
|-----|--------|
| **Tab** | Navigate between order cards |
| **Enter / Space** | Pick up or drop order (drag-and-drop) |
| **Arrow Keys** | Move picked-up order between columns |

### Forms

| Key | Action |
|-----|--------|
| **Tab** | Move to next field |
| **Shift + Tab** | Move to previous field |
| **Enter** | Submit form (when on button) |

---

## Troubleshooting

### Orders Not Appearing in Kitchen Display

1. Check the connection status indicator (should be green)
2. Try refreshing the page (F5 or Ctrl+R)
3. Verify the order was submitted (check Orders List)

### Cannot Edit an Order

- **Completed orders** cannot be edited (final state)
- **Canceled orders** cannot be edited
- If the edit page shows a warning, the order may be In Progress

### Cannot Delete an Order

- Only **Pending** and **Canceled** orders can be deleted
- **In Progress** and **Completed** orders cannot be deleted
- The delete button shows a tooltip explaining why it's disabled

### Menu Item Not Showing in Order Entry

- The item may be marked as **unavailable** (86'd)
- Check with admin to restore availability
- Try refreshing the page

### Dark Mode Issues

The application follows your system theme. To change:
- **Windows:** Settings → Personalization → Colors → Choose your mode
- **macOS:** System Preferences → General → Appearance
- **Browser:** Some browsers have a dark mode override in settings

### Page Not Loading

1. Check your internet connection
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try a different browser
4. Contact your system administrator

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check with your shift supervisor or manager
2. Contact the restaurant's IT support
3. Report bugs to the development team with:
   - What you were trying to do
   - What happened instead
   - Screenshot if possible
   - Browser and device information

---

*RestaurantFlow v1.0 — Built with ❤️ for restaurant teams*
