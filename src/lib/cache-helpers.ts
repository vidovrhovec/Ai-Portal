import { cacheGet, cacheSet, generateCacheKey } from './cache';

export interface AIQueryCacheEntry {
  userId: string;
  query: string;
  response: string;
  timestamp: number;
}

export async function getCachedAIResponse(userId: string, query: string): Promise<string | null> {
  const key = generateCacheKey('ai:query', userId, Buffer.from(query).toString('base64').substring(0, 50));
  const cached = await cacheGet<AIQueryCacheEntry>(key);

  if (!cached) return null;

  const ageSeconds = (Date.now() - cached.timestamp) / 1000;

  if (ageSeconds > 86400) {
    return null;
  }

  return cached.response;
}

export async function setCachedAIResponse(userId: string, query: string, response: string): Promise<void> {
  const key = generateCacheKey('ai:query', userId, Buffer.from(query).toString('base64').substring(0, 50));
  const entry: AIQueryCacheEntry = {
    userId,
    query,
    response,
    timestamp: Date.now(),
  };
  await cacheSet(key, entry, 86400);
}

import type { CurriculumTopicWithRelations } from '@/types';

export interface CurriculumCacheEntry {
  userId: string;
  gradeLevel: number;
  topics: CurriculumTopicWithRelations[];
  timestamp: number;
}

export async function getCachedCurriculum(userId: string, gradeLevel: number): Promise<CurriculumTopicWithRelations[] | null> {
  const key = generateCacheKey('curriculum', userId, gradeLevel);
  const cached = await cacheGet<CurriculumCacheEntry>(key);

  if (!cached) return null;

  const ageSeconds = (Date.now() - cached.timestamp) / 1000;
  if (ageSeconds > 3600) {
    return null;
  }

  return cached.topics;
}

export async function setCachedCurriculum(userId: string, gradeLevel: number, topics: CurriculumTopicWithRelations[]): Promise<void> {
  const key = generateCacheKey('curriculum', userId, gradeLevel);
  const entry: CurriculumCacheEntry = {
    userId,
    gradeLevel,
    topics,
    timestamp: Date.now(),
  };
  await cacheSet(key, entry, 3600);
}

export interface ELI5CacheEntry {
  text: string;
  persona: string;
  explanation: string;
  timestamp: number;
}

export async function getCachedELI5(text: string, persona: string): Promise<string | null> {
  const key = generateCacheKey('eli5', persona, Buffer.from(text).toString('base64').substring(0, 50));
  const cached = await cacheGet<ELI5CacheEntry>(key);

  if (!cached) return null;

  const ageSeconds = (Date.now() - cached.timestamp) / 1000;
  if (ageSeconds > 604800) {
    return null;
  }

  return cached.explanation;
}

export async function setCachedELI5(text: string, persona: string, explanation: string): Promise<void> {
  const key = generateCacheKey('eli5', persona, Buffer.from(text).toString('base64').substring(0, 50));
  const entry: ELI5CacheEntry = {
    text,
    persona,
    explanation,
    timestamp: Date.now(),
  };
  await cacheSet(key, entry, 604800);
}

export interface ContentGenerationCacheEntry {
  type: string;
  topic: string;
  difficulty: string;
  content: string;
  timestamp: number;
}

export async function getCachedGeneratedContent(
  type: string,
  topic: string,
  difficulty: string
): Promise<string | null> {
  const key = generateCacheKey('ai:generate', type, difficulty, Buffer.from(topic).toString('base64').substring(0, 50));
  const cached = await cacheGet<ContentGenerationCacheEntry>(key);

  if (!cached) return null;

  const ageSeconds = (Date.now() - cached.timestamp) / 1000;
  if (ageSeconds > 604800) {
    return null;
  }

  return cached.content;
}

export async function setCachedGeneratedContent(
  type: string,
  topic: string,
  difficulty: string,
  content: string
): Promise<void> {
  const key = generateCacheKey('ai:generate', type, difficulty, Buffer.from(topic).toString('base64').substring(0, 50));
  const entry: ContentGenerationCacheEntry = {
    type,
    topic,
    difficulty,
    content,
    timestamp: Date.now(),
  };
  await cacheSet(key, entry, 604800);
}

export async function invalidateUserCache(userId: string): Promise<void> {
  const { cacheDeletePattern } = await import('./cache');
  await cacheDeletePattern(`*:${userId}:*`);
}
