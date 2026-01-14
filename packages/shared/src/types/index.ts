// Shared TypeScript types for RestaurantFlow

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

// Re-export menu types
export * from './menu.js';

// Re-export order types
export * from './order.js';

// Re-export socket event types
export * from './socket-events.js';
