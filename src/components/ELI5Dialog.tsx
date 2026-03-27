'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Lightbulb } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

interface ELI5DialogProps {
  selectedText?: string;
  context?: string;
}

export function ELI5Dialog({ selectedText: initialSelectedText, context: initialContext }: ELI5DialogProps) {
  const [text, setText] = useState(initialSelectedText || '');
  const [context, setContext] = useState(initialContext || '');
  const [explanation, setExplanation] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Listen for text selection on the page
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString().trim();
        setText(selectedText);

        // Try to get context from surrounding elements
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const contextElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;

        // Look for material content or course context
        let materialContext = '';
        if (contextElement && contextElement instanceof Element) {
          // Check if we're in a material card
          const materialCard = contextElement.closest('[data-material-id]');
          if (materialCard) {
            const title = materialCard.querySelector('h3')?.textContent || '';
            materialContext = `Iz gradiva: ${title}`;
          }
        }

        setContext(materialContext);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const eli5Mutation = useMutation({
    mutationFn: async (data: { text: string; context?: string }) => {
      const response = await fetch('/api/ai/eli5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to get explanation');
      return response.json();
    },
    onSuccess: (data) => {
      setExplanation(data.explanation);
    },
  });

  const handleExplain = () => {
    if (!text.trim()) return;
    eli5Mutation.mutate({ text, context: context || undefined });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setText(initialSelectedText || '');
      setContext(initialContext || '');
      setExplanation('');
    } else {
      // When opening, check for current selection
      const selection = window.getSelection();
      if (selection && selection.toString().trim() && !initialSelectedText) {
        setText(selection.toString().trim());
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg bg-yellow-50 hover:bg-yellow-100 border-yellow-200 animate-pulse"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          ELI5
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Razloži mi kot 5-letniku
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="text">Besedilo za razložiti</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Označi besedilo na strani ali ga kopiraj tukaj..."
              className="min-h-[100px]"
            />
            {context && (
              <p className="text-xs text-gray-500 mt-1">
                Kontekst: {context}
              </p>
            )}
          </div>

          {eli5Mutation.isPending && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Razmišljam o razlagi...</span>
            </div>
          )}

          {explanation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Razlaga:</h4>
              <p className="text-blue-800 whitespace-pre-wrap">{explanation}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleExplain}
              disabled={!text.trim() || eli5Mutation.isPending}
              className="flex-1"
            >
              {eli5Mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Razlagam...
                </>
              ) : (
                'Razloži!'
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Zapri
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Kako uporabljati:</strong><br />
            1. Označi težek odstavek v gradivu<br />
            2. Klikni gumb ELI5<br />
            3. AI ti razloži v 3 preprostih stavkih z analogijo
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}