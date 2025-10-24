import { PrismaClient } from '@prisma/client';
import { config, isDevelopment } from '../config/env';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDevelopment() ? ['query', 'error', 'warn'] : ['error'],
  });

if (config.env !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown helper
export async function disconnectDatabase() {
  await prisma.$disconnect();
}
