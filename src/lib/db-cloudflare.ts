import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

export interface CloudflareEnv {
  DB?: any; // D1Database
  KV?: any; // KVNamespace
  R2?: any; // R2Bucket
}

export function getPrismaClient(env?: CloudflareEnv) {
  if (!prisma) {
    // Using PostgreSQL database
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma;
  }

  return prisma;
}

// Helper function za cleanup
export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

// Health check za database
export async function checkDatabaseHealth(env?: CloudflareEnv): Promise<boolean> {
  try {
    const client = getPrismaClient(env);
    await client.$queryRaw`SELECT 1 as health_check`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}