/**
 * Streaming response component for AI queries
 * Shows text as it's being generated
 */

'use client';

import { useState } from 'react';
import { useStreamingAI } from '@/hooks/use-streaming-ai';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface AIQueryStreamingProps {
  onQuery: (query: string) => Promise<Response>;
  placeholder?: string;
}

export function AIQueryStreaming({
  onQuery,
  placeholder = 'Vnesite vprašanje...',
}: AIQueryStreamingProps) {
  const [query, setQuery] = useState('');
  const { response, isStreaming, error, streamResponse } = useStreamingAI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim() || isStreaming) {
      return;
    }

    await streamResponse(() => onQuery(query));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="min-h-[120px] flex-1"
              readOnly={isStreaming}
            />
            <Button
              type="submit"
              disabled={!query.trim() || isStreaming}
              className="h-full"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded">
              <strong>Napaka:</strong> {error}
            </div>
          )}

          {response && (
            <div className="mt-4 p-4 bg-muted rounded">
              <h3 className="font-semibold mb-2">AI Odgovor:</h3>
              <div className="prose prose-sm max-w-none">
                {response}
              </div>
            </div>
          )}

          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI generira odgovor...</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
