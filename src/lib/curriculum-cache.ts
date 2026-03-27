/**
 * In-memory LRU cache for curriculum context
 * Caches curriculum queries in memory to reduce database calls
 */

import type { CurriculumTopicWithRelations } from '@/types';

interface CurriculumCacheEntry {
  userId: string;
  gradeLevel: number;
  topics: CurriculumTopicWithRelations[];
  timestamp: number;
}

interface PromptCacheEntry {
  userId: string;
  query: string;
  persona?: string;
  curriculumContext: string;
  timestamp: number;
}

// Cache configuration
const CURRICULUM_CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const PROMPT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_CACHE_SIZE = 1000; // Max items in cache

// Simple LRU cache implementation
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  del(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.cache.forEach((value, key) => callback(value, key));
  }
}

// Curriculum cache by user and grade level
const curriculumCache = new LRUCache<string, CurriculumCacheEntry>(MAX_CACHE_SIZE);

// Prompt cache (full prompt with curriculum context)
const promptCache = new LRUCache<string, PromptCacheEntry>(MAX_CACHE_SIZE);

/**
 * Generate cache key for curriculum
 */
export function generateCurriculumCacheKey(userId: string, gradeLevel: number): string {
  return `curriculum:${userId}:${gradeLevel}`;
}

/**
 * Generate cache key for prompt
 */
export function generatePromptCacheKey(userId: string, query: string, persona?: string): string {
  const personaPart = persona ? `:${persona}` : '';
  return `prompt:${userId}:${Buffer.from(query).toString('base64').substring(0, 50)}${personaPart}`;
}

/**
 * Get curriculum from cache
 */
export function getCachedCurriculum(userId: string, gradeLevel: number): CurriculumTopicWithRelations[] | null {
  const key = generateCurriculumCacheKey(userId, gradeLevel);
  const entry = curriculumCache.get(key);

  if (!entry) {
    return null;
  }

  const age = Date.now() - entry.timestamp;

  if (age > CURRICULUM_CACHE_TTL) {
    curriculumCache.del(key);
    return null;
  }

  return entry.topics;
}

/**
 * Set curriculum in cache
 */
export function setCachedCurriculum(
  userId: string,
  gradeLevel: number,
  topics: CurriculumTopicWithRelations[]
): void {
  const key = generateCurriculumCacheKey(userId, gradeLevel);

  const entry: CurriculumCacheEntry = {
    userId,
    gradeLevel,
    topics,
    timestamp: Date.now(),
  };

  curriculumCache.set(key, entry);
}

/**
 * Get full prompt with curriculum context from cache
 */
export function getCachedPrompt(
  userId: string,
  query: string,
  persona?: string
): string | null {
  const key = generatePromptCacheKey(userId, query, persona);
  const entry = promptCache.get(key);

  if (!entry) {
    return null;
  }

  const age = Date.now() - entry.timestamp;

  if (age > PROMPT_CACHE_TTL) {
    promptCache.del(key);
    return null;
  }

  return entry.curriculumContext;
}

/**
 * Set full prompt with curriculum context in cache
 */
export function setCachedPrompt(
  userId: string,
  query: string,
  curriculumContext: string,
  persona?: string
): void {
  const key = generatePromptCacheKey(userId, query, persona);

  const entry: PromptCacheEntry = {
    userId,
    query,
    persona,
    curriculumContext,
    timestamp: Date.now(),
  };

  promptCache.set(key, entry);
}

/**
 * Clear all curriculum cache for a user
 */
export function clearUserCurriculumCache(userId: string): void {
  const keys: string[] = [];
  curriculumCache.forEach((value, key) => {
    if (value.userId === userId) {
      keys.push(key);
    }
  });
  keys.forEach(key => curriculumCache.del(key));
}

/**
 * Clear all prompt cache for a user
 */
export function clearUserPromptCache(userId: string): void {
  const keys: string[] = [];
  promptCache.forEach((value, key) => {
    if (value.userId === userId) {
      keys.push(key);
    }
  });
  keys.forEach(key => promptCache.del(key));
}

/**
 * Clear all cache for a user
 */
export function clearUserCache(userId: string): void {
  clearUserCurriculumCache(userId);
  clearUserPromptCache(userId);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    curriculum: {
      size: curriculumCache.size,
      max: MAX_CACHE_SIZE,
      itemCount: curriculumCache.size,
    },
    prompt: {
      size: promptCache.size,
      max: MAX_CACHE_SIZE,
      itemCount: promptCache.size,
    },
  };
}

/**
 * Clear all caches (for testing/admin)
 */
export function clearAllCaches(): void {
  curriculumCache.clear();
  promptCache.clear();
}
