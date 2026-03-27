'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Clock, Target, ChevronRight } from 'lucide-react';

interface LearningSuggestion {
  topicId: string;
  topicName: string;
  reason: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites: string[];
}

interface LearningSuggestionsProps {
  suggestions: LearningSuggestion[];
  isLoading?: boolean;
}

export function LearningSuggestions({ suggestions, isLoading }: LearningSuggestionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI predlogi za učenje</CardTitle>
          <CardDescription>Nalaganje predlogov...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI predlogi za učenje</CardTitle>
          <CardDescription>Nemate specifičnih predlogov</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Ko boste reševali več kvizov, vam bomo lahko podali personalizirane predloge za učenje.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI predlogi za učenje
        </CardTitle>
        <CardDescription>
          Personalizirani predlogi temelječi na vaši učni zgodovini
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.topicId}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{suggestion.topicName}</h4>
                    <Badge className={getDifficultyColor(suggestion.difficulty)}>
                      {suggestion.difficulty === 'beginner' ? 'Začetnik' :
                       suggestion.difficulty === 'intermediate' ? 'Srednja' : 'Napredna'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {suggestion.reason}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {suggestion.estimatedTime} min
                    </div>
                    {suggestion.prerequisites.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {suggestion.prerequisites.length} predpogojev
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Začni učenje
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Kako delujejo predlogi?</p>
              <p className="text-sm text-blue-700 mt-1">
                Naši AI algoritmi analizirajo vaše rezultate in identificirajo področja,
                kjer lahko izboljšate svoje znanje. Predlogi se posodabljajo z vsakim kvizom.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}