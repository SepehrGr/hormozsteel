// بهبود یافته: lib/prisma.ts با Performance Monitoring
import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// تنظیمات Log بر اساس محیط
const logConfig: Prisma.LogLevel[] | Prisma.LogDefinition[] =
  process.env.NODE_ENV === 'development'
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ]
    : [{ emit: 'stdout', level: 'error' }];

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logConfig,
    // کانفیگ connection pool (برای production)
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Performance Monitoring در development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    // هشدار برای query های کند (بیش از 1 ثانیه)
    if (e.duration > 1000) {
      console.warn('🐢 Slow Query Detected:', {
        query: e.query.substring(0, 100) + '...',
        duration: `${e.duration}ms`,
        params: e.params,
        timestamp: new Date().toISOString(),
      });
    }

    // لاگ query های خیلی کند (بیش از 3 ثانیه)
    if (e.duration > 3000) {
      console.error('🚨 Very Slow Query:', {
        query: e.query,
        duration: `${e.duration}ms`,
        params: e.params,
      });
    }
  });
}

// Singleton pattern برای development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
const cleanup = async () => {
  await prisma.$disconnect();
  console.log('✅ Prisma Client disconnected');
};

process.on('beforeExit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Helper function برای transaction با retry
export async function withRetry<T>(
  fn: (prisma: PrismaClient) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn(prisma);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Retry ${i + 1}/${maxRetries} after error:`, error);

      // exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100));
    }
  }

  throw lastError;
}

// Helper برای پیدا کردن یا ایجاد
export async function findOrCreate<T>(
  model: any,
  where: any,
  create: any
): Promise<T> {
  const existing = await model.findUnique({ where });
  if (existing) return existing;

  return await model.create({ data: create });
}
