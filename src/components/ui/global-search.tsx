'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Command, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'material' | 'quiz' | 'group' | 'user';
  url: string;
  tags?: string[];
}

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Search across different content types
      const searchPromises = [
        // Search courses
        fetch(`/api/courses?search=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => data.map((course: any) => ({
            id: course.id,
            title: course.name,
            description: course.description || 'Course',
            type: 'course' as const,
            url: `/dashboard/teacher?course=${course.id}`,
            tags: [course.subject, `Grade ${course.gradeLevel}`]
          }))),
        // Search materials
        fetch(`/api/materials?search=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => data.map((material: any) => ({
            id: material.id,
            title: material.title,
            description: material.content?.substring(0, 100) || 'Learning material',
            type: 'material' as const,
            url: `/dashboard/student?material=${material.id}`,
            tags: [material.type, material.subject]
          }))),
        // Search groups
        fetch(`/api/groups?search=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => data.map((group: any) => ({
            id: group.id,
            title: group.name,
            description: group.description || 'Study group',
            type: 'group' as const,
            url: `/dashboard/student?group=${group.id}`,
            tags: [`${group.members?.length || 0} members`]
          })))
      ];

      const [courses, materials, groups] = await Promise.all(searchPromises);
      const allResults = [...courses, ...materials, ...groups].slice(0, 10); // Limit to 10 results
      setResults(allResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    router.push(result.url);
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'material': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'quiz': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'group': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'user': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <Command className="h-3 w-3" />
          <span>K</span>
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-6 py-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Global Search
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses, materials, groups..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  onClick={() => setQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="max-h-[400px] px-6 pb-6">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Searching...
                </div>
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-accent"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium leading-none">{result.title}</h4>
                        <Badge variant="secondary" className={cn("text-xs", getTypeColor(result.type))}>
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.description}
                      </p>
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex gap-1">
                          {result.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}