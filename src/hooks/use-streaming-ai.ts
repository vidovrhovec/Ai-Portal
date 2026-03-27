/**
 * Client-side streaming hook for AI responses
 * Updates UI as AI generates text token by token
 */

'use client';

import { useState, useCallback } from 'react';

export function useStreamingAI() {
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

        // If the server sends SSE-style lines like "data: {...}\n\n",
        // parse them and extract the delta content. Otherwise, treat
        // the chunk as plain text and append it directly.
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
                // ignore JSON parse errors for non-JSON lines
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        } else {
          // Plain-text streaming fallback (server sends raw text chunks)
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

