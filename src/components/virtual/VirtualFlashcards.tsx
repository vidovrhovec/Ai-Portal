/**
 * Virtual Scrolling Component for Flashcards
 * Uses TanStack Virtual for efficient rendering of large lists
 */

'use client';
/* eslint-disable react-hooks/incompatible-library */

import { useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const estimateFlashcardSize = () => 200;

interface VirtualFlashcardsProps {
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
    difficulty: string;
  }>;
  onCardClick: (cardId: string) => void;
  onDeleteCard?: (cardId: string) => void;
}

export function VirtualFlashcardsList({
  flashcards,
  onCardClick,
  onDeleteCard,
}: VirtualFlashcardsProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 200, []);

  const virtualizer = useVirtualizer({
    count: flashcards.length,
    getScrollElement: () => parentRef.current,
    estimateSize, // Estimated height of each card in pixels
    overscan: 5, // Number of extra items to render outside viewport
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto border rounded-lg"
      style={{
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const card = flashcards[virtualRow.index];
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
            >
              <Card className="mx-4 mb-4 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="mb-2 text-sm text-muted-foreground">
                        <span className="inline-block px-2 py-1 bg-secondary rounded text-xs font-medium">
                          {card.difficulty}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{card.front}</h3>
                      <p className="text-muted-foreground">{card.back}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCardClick(card.id)}
                      >
                        Uredi
                      </Button>
                      {onDeleteCard && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteCard(card.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Izbriši
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
