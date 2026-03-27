'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Search,
  Loader2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  tags: string[];
}

interface AIChatHistoryProps {
  className?: string;
}

export function AIChatHistory({
  className = ''
}: AIChatHistoryProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load chat history from API
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch('/api/ai/chat');
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded messages from API:', data.messages);
          const messages: ChatMessage[] = data.messages.map((msg: unknown) => ({
            id: (msg as { id: string }).id,
            role: (msg as { role: string }).role as 'user' | 'assistant',
            content: (msg as { content: string }).content,
            createdAt: new Date((msg as { createdAt: string }).createdAt)
          }));

          // For now, create a single conversation with all messages
          // TODO: Implement proper conversation grouping based on time gaps or explicit conversation IDs
          if (messages.length > 0) {
            const conversation: ChatConversation = {
              id: 'all-messages',
              title: 'Vsi AI pogovori',
              messages,
              createdAt: messages[0].createdAt,
              updatedAt: messages[messages.length - 1].createdAt,
              isFavorite: false,
              tags: []
            };
            setConversations([conversation]);
          } else {
            setConversations([]);
          }
        } else {
          console.error('Failed to load chat history:', response.status);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, []);

  // Delete all chat history
  const deleteAllHistory = async () => {
    if (!confirm('Ali ste prepričani, da želite izbrisati vso zgodovino klepeta? Tega dejanja ni mogoče razveljaviti.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'DELETE',
      });

      if (response.ok) {
        setConversations([]);
        // Also clear localStorage if it exists
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ai-new-conversation');
        }
      } else {
        alert('Napaka pri brisanju zgodovine.');
      }
    } catch (error) {
      console.error('Error deleting chat history:', error);
      alert('Napaka pri brisanju zgodovine.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort conversations (favorites first, then by date)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Nalaganje zgodovine pogovorov...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Delete */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Iščite pogovore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {conversations.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteAllHistory}
            disabled={deleting}
            className="gap-2"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Izbriši vse
          </Button>
        )}
      </div>

      {/* Conversations List */}
      <ScrollArea className="h-96">
        <div className="space-y-2">
          {sortedConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Še nimate shranjenih pogovorov</p>
              <p className="text-sm">Začnite klepetati z AI v zavihku &quot;AI Klepet&quot;</p>
            </div>
          ) : (
            sortedConversations.map((conversation) => (
              <Card key={conversation.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">{conversation.title}</h4>
                  <div className="text-sm text-gray-500">
                    {conversation.messages.length} sporočil
                  </div>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {conversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.role === 'user'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="font-medium mb-1">
                          {message.role === 'user' ? 'Vi' : 'AI Pomočnik'}
                        </div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(message.createdAt, 'dd.MM.yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}