import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Checks connectivity to the Neon PostgreSQL database.
 * @returns {Promise<{ isConnected: boolean, latencyMs?: number, error?: string }>}
 */
export async function checkDatabaseConnection() {
  const start = Date.now();
  try {
    // Run a lightweight raw query to test connection
    await prisma.$queryRaw`SELECT 1 as health_check`;
    const latencyMs = Date.now() - start;
    return { isConnected: true, latencyMs };
  } catch (error) {
    return {
      isConnected: false,
      error: error.message || 'Unable to connect to database',
    };
  }
}

export default prisma;
