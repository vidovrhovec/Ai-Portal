/**
 * Virtual Scrolling Component for Group Messages
 * Uses TanStack Virtual for efficient rendering of chat messages
 */

'use client';
/* eslint-disable react-hooks/incompatible-library */

import { useRef, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const estimateMessageSize = () => 80;

interface VirtualMessagesProps {
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: Date;
  }>;
  currentUserId?: string;
  autoScroll?: boolean;
}

export function VirtualMessagesList({
  messages,
  currentUserId,
  autoScroll = true,
}: VirtualMessagesProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 80, []);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 3,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1);
    }
  }, [messages.length, autoScroll, virtualizer]);

  return (
    <div className="h-[500px] w-full overflow-auto">
      <div
        ref={parentRef}
        className="px-4 py-2"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const message = messages[virtualRow.index];
            const isOwnMessage = message.senderId === currentUserId;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="mb-2"
              >
                <Card
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <CardContent className="p-3">
                    {!isOwnMessage && (
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {message.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">
                          {message.senderName}
                        </span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString('sl-SI', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
