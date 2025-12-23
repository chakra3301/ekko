// Prisma Client singleton
// Prevents multiple instances of Prisma Client in development
// Use this import instead of creating new PrismaClient instances
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.error('⚠️  DATABASE_URL environment variable is not set!');
  // eslint-disable-next-line no-console
  console.error('   Please set DATABASE_URL in your Vercel environment variables.');
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

