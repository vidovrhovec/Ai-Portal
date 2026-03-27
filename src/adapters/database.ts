import { PrismaClient } from '@prisma/client';
import { DBConfig } from '../types';

export interface IDatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getClient(): PrismaClient;
  migrate(): Promise<void>;
}

class SQLiteAdapter implements IDatabaseAdapter {
  private client: PrismaClient | null = null;

  constructor(config: DBConfig) {
    void config;
    // Lazy initialization
  }

  async connect(): Promise<void> {
    const client = this.getClient();
    await client.$connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
    }
  }

  getClient(): PrismaClient {
    if (!this.client) {
      this.client = new PrismaClient();
    }
    return this.client;
  }

  async migrate(): Promise<void> {
    // For SQLite, migrations are handled by Prisma CLI
    // In production, run migrations programmatically if needed
  }
}

class PostgreSQLAdapter implements IDatabaseAdapter {
  private client: PrismaClient | null = null;

  constructor(config: DBConfig) {
    void config;
    // Lazy initialization
  }

  async connect(): Promise<void> {
    const client = this.getClient();
    await client.$connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
    }
  }

  getClient(): PrismaClient {
    if (!this.client) {
      this.client = new PrismaClient();
    }
    return this.client;
  }

  async migrate(): Promise<void> {
    // Handle migrations
  }
}

export class DatabaseAdapterFactory {
  static createAdapter(config: DBConfig): IDatabaseAdapter {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteAdapter(config);
      case 'postgresql':
        return new PostgreSQLAdapter(config);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}

// Global instance
let dbAdapter: IDatabaseAdapter | null = null;

export const getDatabaseAdapter = (config: DBConfig): IDatabaseAdapter => {
  if (!dbAdapter) {
    dbAdapter = DatabaseAdapterFactory.createAdapter(config);
  }
  return dbAdapter;
};

export const switchDatabase = async (newConfig: DBConfig): Promise<void> => {
  if (dbAdapter) {
    await dbAdapter.disconnect();
  }
  dbAdapter = new SQLiteAdapter(newConfig);
  await dbAdapter.connect();
  // TODO: Migrate data if needed
};
