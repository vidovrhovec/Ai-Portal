import OpenAI from 'openai';
import { getAPIKeyManager } from './api-key-manager';

export async function getOpenAIClient(overrideApiKey?: string | null, overrideBaseUrl?: string | null) {
  // If caller provides an API key explicitly, use it (per-user or per-request)
  if (overrideApiKey) {
    return new OpenAI({ apiKey: overrideApiKey, baseURL: overrideBaseUrl || undefined });
  }

  let apiKey: string | undefined;
  try {
    const manager = getAPIKeyManager();
    apiKey = await manager.getCurrentKey();
  } catch (err) {
    // Fallback to environment variable if APIKeyManager is not configured
    apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  }

  if (!apiKey) {
    throw new Error('No OpenAI API key configured');
  }

  const baseURL = process.env.OPENAI_API_BASE_URL || process.env.OPENAI_API_URL || process.env.OPENAI_BASE_URL || undefined;

  const client = new OpenAI({ apiKey, baseURL });
  return client;
}
