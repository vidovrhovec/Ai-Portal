'use client';

import { useState, useEffect } from 'react';
import { useStreamingAIClient } from '@/hooks/use-streaming-ai-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface AIQueryStreamingProps {
  onQuery: (query: string) => Promise<Response>;
  placeholder?: string;
}

export function AIQueryStreamingClient({
  onQuery,
  placeholder = 'Vnesite vprašanje...',
}: AIQueryStreamingProps) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isNewConversation, setIsNewConversation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai-new-conversation') === 'true';
    }
    return false;
  });
  const { response, isStreaming, error, streamResponse, clearResponse } = useStreamingAIClient();

  // Update localStorage when isNewConversation changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-new-conversation', isNewConversation.toString());
    }
  }, [isNewConversation]);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        console.log('Loading chat history...');
        const res = await fetch('/api/ai/chat');
        if (res.ok) {
          const data = await res.json();
          console.log('Loaded chat history:', data.messages);
          // If it's a new conversation, don't load history
          if (!isNewConversation) {
            setChatHistory(data.messages || []);
          }
        } else {
          console.error('Failed to load chat history:', res.status);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [isNewConversation]);

  // Save message to database
  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    try {
      console.log('Saving message:', { role, content });
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content }),
      });
      if (response.ok) {
        console.log('Message saved successfully');
      } else {
        console.error('Failed to save message:', response.status);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Add response to chat history when streaming completes
  useEffect(() => {
    if (response && !isStreaming) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        createdAt: new Date().toISOString(),
      };
      setChatHistory(prev => [...prev, newMessage]);
      saveMessage('assistant', response);
      clearResponse(); // Clear the response after saving
    }
  }, [response, isStreaming, clearResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim() || isStreaming) {
      return;
    }

    // Reset new conversation flag when user sends first message
    if (isNewConversation) {
      setIsNewConversation(false);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add user message to history
    setChatHistory(prev => [...prev, userMessage]);
    await saveMessage('user', query.trim());

    // Clear input
    const currentQuery = query;
    setQuery('');

    // Start streaming response
    await streamResponse(() => onQuery(currentQuery));
  };

  if (isLoadingHistory) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Nalaganje zgodovine klepeta...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Input Form - Always visible at top */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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

          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI generira odgovor...</span>
            </div>
          )}
        </form>

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <>
            <div className="border-t pt-4 mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Zgodovina sporočil</h4>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'Vi' : 'AI Pomočnik'}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
