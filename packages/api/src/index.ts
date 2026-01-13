import { createApp } from './app.js';
import { config } from './config/index.js';
import { prisma, connectDatabase, disconnectDatabase } from './lib/prisma.js';

async function bootstrap() {
  // Validate database connection
  console.log('🔌 Connecting to database...');
  const dbConnected = await connectDatabase();
  
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Please ensure PostgreSQL is running.');
    console.error('   Run: docker compose -f docker-compose.dev.yml up -d');
    process.exit(1);
  }
  
  console.log('✅ Database connected');

  const app = createApp(prisma);

  const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down...');
    server.close();
    await disconnectDatabase();
    console.log('👋 Goodbye!');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
