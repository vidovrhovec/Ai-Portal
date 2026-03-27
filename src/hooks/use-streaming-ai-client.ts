/**
 * Client-side streaming hook for AI responses
 * Updates UI as AI generates text token by token
 */

'use client';

import { useState, useCallback } from 'react';

export function useStreamingAIClient() {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamResponse = useCallback(async (
    queryFn: () => Promise<Response>
  ) => {
    setIsStreaming(true);
    setResponse('');
    setError(null);

    try {
      const res = await queryFn();

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || 'AI query failed');
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsStreaming(false);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        if (chunk.includes('data: ')) {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line) continue;
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                setIsStreaming(false);
                break;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullText += content;
                  setResponse(fullText);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        } else {
          fullText += chunk;
          setResponse(fullText);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsStreaming(false);
    }
  }, []);

  const clearResponse = useCallback(() => {
    setResponse('');
    setError(null);
  }, []);

  return {
    response,
    isStreaming,
    error,
    streamResponse,
    clearResponse,
  };
}
