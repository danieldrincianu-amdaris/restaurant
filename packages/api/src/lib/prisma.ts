import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const isDevelopment = process.env['NODE_ENV'] === 'development';

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
  globalForPrisma.pool = pool;
  
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: isDevelopment ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = prisma;

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  // Note: Don't end pool here as it may be reused in tests
}
