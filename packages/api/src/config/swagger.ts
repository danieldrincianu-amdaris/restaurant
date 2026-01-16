import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RestaurantFlow API',
      version: '1.0.0',
      description: `RESTful API for restaurant order management system

## WebSocket Events

The API also supports real-time updates via WebSocket connections. Connect to the server and listen for these events:

### Order Events

**order:created**
- Emitted when a new order is created
- Payload: Complete order object with items

**order:updated**
- Emitted when order details are updated (table number, server name)
- Payload: Updated order object

**order:status-changed**
- Emitted when order status transitions (PENDING → IN_PROGRESS → COMPLETED)
- Payload: Order object with new status

**order:deleted**
- Emitted when an order is permanently deleted
- Payload: { orderId: string }

### Order Item Events

**order:item-added**
- Emitted when an item is added to an order
- Payload: Updated order object with new item

**order:item-updated**
- Emitted when an order item quantity or instructions are updated
- Payload: Updated order object

**order:item-removed**
- Emitted when an item is removed from an order
- Payload: Updated order object

### Connection

\`\`\`javascript
const socket = io('http://localhost:3001');

socket.on('order:created', (order) => {
  console.log('New order:', order);
});
\`\`\`
`,
      contact: {
        name: 'RestaurantFlow Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Menu Items',
        description: 'Menu item management endpoints',
      },
      {
        name: 'Orders',
        description: 'Order management endpoints',
      },
      {
        name: 'Categories',
        description: 'Menu category endpoints',
      },
      {
        name: 'Food Types',
        description: 'Food type classification endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
    components: {
      schemas: {
        MenuItem: {
          type: 'object',
          required: ['id', 'name', 'price', 'ingredients', 'category', 'foodType', 'available'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier',
            },
            name: {
              type: 'string',
              description: 'Menu item name',
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Price in dollars',
            },
            ingredients: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of ingredients',
            },
            imageUrl: {
              type: 'string',
              nullable: true,
              description: 'URL to item image',
            },
            category: {
              type: 'string',
              enum: ['APPETIZER', 'MAIN', 'DRINK', 'DESSERT'],
              description: 'Menu category',
            },
            foodType: {
              type: 'string',
              enum: ['MEAT', 'PASTA', 'PIZZA', 'SEAFOOD', 'VEGETARIAN', 'SALAD', 'SOUP', 'SANDWICH', 'COFFEE', 'BEVERAGE', 'OTHER'],
              description: 'Type of food',
            },
            available: {
              type: 'boolean',
              description: 'Whether item is currently available',
            },
            sortOrder: {
              type: 'number',
              description: 'Display order position',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Order: {
          type: 'object',
          required: ['id', 'tableNumber', 'serverName', 'status', 'items'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier',
            },
            tableNumber: {
              type: 'number',
              description: 'Table number',
            },
            serverName: {
              type: 'string',
              description: 'Name of server',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'HALTED', 'CANCELED'],
              description: 'Current order status',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        OrderItem: {
          type: 'object',
          required: ['id', 'orderId', 'menuItemId', 'quantity'],
          properties: {
            id: {
              type: 'string',
            },
            orderId: {
              type: 'string',
            },
            menuItemId: {
              type: 'string',
            },
            quantity: {
              type: 'number',
              minimum: 1,
            },
            specialInstructions: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            menuItem: {
              $ref: '#/components/schemas/MenuItem',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
