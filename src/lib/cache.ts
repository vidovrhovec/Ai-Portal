import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedisClient() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn('Upstash Redis credentials not configured, caching disabled');
      return null;
    }

    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;

    const data = await client.get(key);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) return false;

    await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

export async function cacheDelete(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) return false;

    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

export async function cacheDeletePattern(pattern: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) return false;

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Cache delete pattern error:', error);
    return false;
  }
}

export function generateCacheKey(prefix: string, ...params: (string | number)[]): string {
  const cleanParams = params.map(p => String(p).replace(/[^a-zA-Z0-9-_]/g, ''));
  return `${prefix}:${cleanParams.join(':')}`;
}

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const result = await queryFn();
  await cacheSet(key, result, ttl);
  return result;
}
