/**
 * AI Service React Hook
 *
 * Provides React hooks for AI functionality with automatic Tauri/web environment detection.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { aiService, OllamaMessage, OllamaModel, AIModelStatus, DownloadProgress, StreamChunk } from '@/lib/tauri-ai';

interface UseAIChatOptions {
  model?: string;
  onError?: (error: Error) => void;
}

interface UseAIChatReturn {
  messages: OllamaMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setModel: (model: string) => void;
  currentModel: string;
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const [messages, setMessages] = useState<OllamaMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState(options.model || 'llama2');

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: OllamaMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const response = await aiService.chat(newMessages, currentModel);

      // Add AI response
      const aiMessage: OllamaMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentModel, options.onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const setModel = useCallback((model: string) => {
    setCurrentModel(model);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setModel,
    currentModel,
  };
}

interface UseAIStreamOptions {
  model?: string;
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

interface UseAIStreamReturn {
  messages: OllamaMessage[];
  isStreaming: boolean;
  error: string | null;
  currentResponse: string;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  stopStreaming: () => void;
  setModel: (model: string) => void;
  currentModel: string;
}

export function useAIStream(options: UseAIStreamOptions = {}): UseAIStreamReturn {
  const [messages, setMessages] = useState<OllamaMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentModel, setCurrentModel] = useState(options.model || 'llama2');

  const streamingRef = useRef(false);
  const responseRef = useRef('');

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || streamingRef.current) return;

    setIsStreaming(true);
    setError(null);
    streamingRef.current = true;
    responseRef.current = '';

    // Add user message
    const userMessage: OllamaMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      await aiService.chatStream(
        newMessages,
        currentModel,
        (chunk) => {
          responseRef.current += chunk.content;
          setCurrentResponse(responseRef.current);
          options.onChunk?.(chunk);

          if (chunk.done) {
            // Add completed AI message
            const aiMessage: OllamaMessage = {
              role: 'assistant',
              content: responseRef.current
            };
            setMessages(prev => [...prev, aiMessage]);
            setCurrentResponse('');
            options.onComplete?.(responseRef.current);
          }
        },
        (err) => {
          setError(err.message);
          options.onError?.(err);
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Streaming failed';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsStreaming(false);
      streamingRef.current = false;
    }
  }, [messages, currentModel, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentResponse('');
    responseRef.current = '';
  }, []);

  const stopStreaming = useCallback(() => {
    streamingRef.current = false;
    setIsStreaming(false);
  }, []);

  const setModel = useCallback((model: string) => {
    setCurrentModel(model);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    currentResponse,
    sendMessage,
    clearMessages,
    stopStreaming,
    setModel,
    currentModel,
  };
}

interface UseAIModelsReturn {
  models: OllamaModel[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAIModels(): UseAIModelsReturn {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedModels = await aiService.listModels();
      setModels(fetchedModels);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    models,
    isLoading,
    error,
    refresh,
  };
}

interface UseAIModelStatusReturn {
  status: AIModelStatus | null;
  isLoading: boolean;
  error: string | null;
  checkStatus: (modelName: string) => Promise<void>;
}

export function useAIModelStatus(): UseAIModelStatusReturn {
  const [status, setStatus] = useState<AIModelStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async (modelName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const modelStatus = await aiService.checkModelAvailability(modelName);
      setStatus(modelStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check model status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    isLoading,
    error,
    checkStatus,
  };
}

interface UseAIModelDownloadReturn {
  isDownloading: boolean;
  progress: DownloadProgress | null;
  error: string | null;
  downloadModel: (modelName: string) => Promise<void>;
}

export function useAIModelDownload(): UseAIModelDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadModel = useCallback(async (modelName: string) => {
    setIsDownloading(true);
    setProgress(null);
    setError(null);

    try {
      await aiService.pullModelWithProgress(
        modelName,
        (downloadProgress) => {
          setProgress(downloadProgress);
        },
        (err) => {
          setError(err.message);
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    isDownloading,
    progress,
    error,
    downloadModel,
  };
}

interface UseAIEmbeddingReturn {
  generateEmbedding: (text: string, model?: string) => Promise<number[]>;
  isLoading: boolean;
  error: string | null;
}

export function useAIEmbedding(defaultModel = 'nomic-embed-text'): UseAIEmbeddingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEmbedding = useCallback(async (text: string, model = defaultModel) => {
    setIsLoading(true);
    setError(null);

    try {
      const embedding = await aiService.generateEmbedding(text, model);
      return embedding;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Embedding generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [defaultModel]);

  return {
    generateEmbedding,
    isLoading,
    error,
  };
}