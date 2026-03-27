/**
 * Tauri AI Service Integration
 *
 * Provides TypeScript wrappers for Tauri AI commands with automatic fallback
 * to HTTP API when not running in Tauri desktop environment.
 */

import { invoke } from '@tauri-apps/api/core';
import { shouldUseTauriIPC, getApiUrl } from './tauri-detect';

// Extend Window interface for Tauri
declare global {
  interface Window {
    __TAURI__?: {
      event: {
        listen: (event: string, handler: (event: { payload: unknown }) => void) => Promise<() => void>;
      };
    };
  }
}

// Type definitions matching Rust structs
export interface OllamaMessage {
  role: string;
  content: string;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families?: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface AIModelStatus {
  available: boolean;
  source: string; // "ollama" or "openai"
  model_name: string;
  error_message?: string;
}

export interface DownloadProgress {
  model_name: string;
  status: string; // "downloading", "completed", "error"
  progress?: number; // 0.0 to 1.0
  total_size?: number;
  downloaded_size?: number;
  error_message?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * AI Service class for handling AI operations in both Tauri and web environments
 */
export class TauriAIService {
  private ollamaBaseUrl: string;

  constructor(ollamaBaseUrl: string = 'http://localhost:11434') {
    this.ollamaBaseUrl = ollamaBaseUrl;
  }

  /**
   * Chat with AI using the best available provider
   */
  async chat(messages: OllamaMessage[], model: string): Promise<string> {
    // Always use HTTP fallback in web environment to avoid Tauri timeouts
    return this.chatHttp(messages, model);
  }

  /**
   * Generate content using AI
   */
  async generateContent(prompt: string, model: string): Promise<string> {
    // Always use HTTP fallback in web environment to avoid Tauri timeouts
    return this.generateContentHttp(prompt, model);
  }

  /**
   * Check AI availability
   */
  async checkAvailability(): Promise<boolean> {
    // Always use HTTP fallback in web environment to avoid Tauri timeouts
    return this.checkAvailabilityHttp();
  }

  /**
   * List available AI models
   */
  async listModels(): Promise<OllamaModel[]> {
    // Always use HTTP fallback in web environment to avoid Tauri timeouts
    return this.listModelsHttp();
  }

  /**
   * Check if a specific model is available
   */
  async checkModelAvailability(modelName: string): Promise<AIModelStatus> {
    // Always use HTTP fallback in web environment to avoid Tauri timeouts
    return this.checkModelAvailabilityHttp(modelName);
  }

  /**
   * Stream chat with AI
   */
  async chatStream(
    messages: OllamaMessage[],
    model: string,
    onChunk: (chunk: StreamChunk) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    // Always use HTTP fallback in web environment to avoid Tauri timeouts
    return this.chatStreamHttp(messages, model, onChunk, onError);
  }

  /**
   * Pull/download a model with progress tracking
   */
  async pullModelWithProgress(
    modelName: string,
    onProgress: (progress: DownloadProgress) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    // Always use HTTP fallback in web environment to avoid Tauri timeouts
    return this.pullModelWithProgressHttp(modelName, onProgress, onError);
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string, model: string): Promise<number[]> {
    // Always use HTTP fallback in web environment to avoid Tauri timeouts
    return this.generateEmbeddingHttp(text, model);
  }

  // HTTP fallback implementations

  private async chatHttp(messages: OllamaMessage[], model: string): Promise<string> {
    const response = await fetch(getApiUrl('/api/ai/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model }),
    });

    if (!response.ok) {
      throw new Error(`AI chat failed: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  private async generateContentHttp(prompt: string, model: string): Promise<string> {
    const response = await fetch(getApiUrl('/api/ai/generate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model }),
    });

    if (!response.ok) {
      throw new Error(`Content generation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  private async checkAvailabilityHttp(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.ollamaBaseUrl}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async listModelsHttp(): Promise<OllamaModel[]> {
    const response = await fetch(`${this.ollamaBaseUrl}/api/tags`);

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.status}`);
    }

    const data = await response.json();
    return data.models || [];
  }

  private async checkModelAvailabilityHttp(modelName: string): Promise<AIModelStatus> {
    try {
      const models = await this.listModelsHttp();
      const available = models.some(model => model.name === modelName);

      if (available) {
        return {
          available: true,
          source: 'ollama',
          model_name: modelName,
        };
      }

      // Check common OpenAI models as fallback
      const commonModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'];
      if (commonModels.includes(modelName)) {
        return {
          available: true,
          source: 'openai',
          model_name: modelName,
        };
      }

      return {
        available: false,
        source: 'none',
        model_name: modelName,
        error_message: 'Model not available',
      };
    } catch (error) {
      return {
        available: false,
        source: 'none',
        model_name: modelName,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async chatStreamHttp(
    messages: OllamaMessage[],
    model: string,
    onChunk: (chunk: StreamChunk) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Streaming failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              onChunk({
                content: data.message?.content || '',
                done: data.done || false,
              });

              if (data.done) {
                return;
              }
            } catch (e) {
              console.warn('Failed to parse streaming response:', e);
            }
          }
        }
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Streaming failed'));
      }
    }
  }

  private async pullModelWithProgressHttp(
    modelName: string,
    onProgress: (progress: DownloadProgress) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Model pull failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        try {
          const data = JSON.parse(chunk);
          onProgress({
            model_name: modelName,
            status: data.status || 'unknown',
            progress: data.completed && data.total ? data.completed / data.total : undefined,
            total_size: data.total,
            downloaded_size: data.completed,
          });
        } catch (e) {
          console.warn('Failed to parse progress response:', e);
        }
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Model pull failed'));
      }
    }
  }

  private async generateEmbeddingHttp(text: string, model: string): Promise<number[]> {
    const response = await fetch(`${this.ollamaBaseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding generation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding || [];
  }
}

// Export singleton instance
export const aiService = new TauriAIService();