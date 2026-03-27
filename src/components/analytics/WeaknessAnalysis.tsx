'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Target, BookOpen, TrendingUp } from 'lucide-react';

interface WeakTopic {
  topic: string;
  averageScore: number;
  attempts: number;
}

interface WeaknessAnalysisProps {
  weaknesses: WeakTopic[];
  totalTopicsAnalyzed: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: Array<{
    topic: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  isLoading?: boolean;
}

export function WeaknessAnalysis({
  weaknesses,
  totalTopicsAnalyzed,
  trend,
  recommendations,
  isLoading
}: WeaknessAnalysisProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analiza šibkih področij</CardTitle>
          <CardDescription>Nalaganje analize...</CardDescription>
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Analiza šibkih področij
          </CardTitle>
          <CardDescription>
            Analizirali smo {totalTopicsAnalyzed} področij • Trend: {trend === 'improving' ? 'Izboljševanje' : trend === 'declining' ? 'Poslabševanje' : 'Stabilno'}
            {getTrendIcon(trend)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weaknesses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-900">Odlično delo!</p>
              <p className="text-muted-foreground">
                Nimate identificiranih šibkih področij. Vaši rezultati so nad povprečjem.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {weaknesses.map((weakness, index) => (
                <div key={weakness.topic} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-medium text-red-800">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{weakness.topic}</h4>
                        <p className="text-sm text-muted-foreground">
                          {weakness.attempts} poskusov
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(weakness.averageScore)}`}>
                        {weakness.averageScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">povprečje</div>
                    </div>
                  </div>
                  <Progress value={weakness.averageScore} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Priporočila za izboljšavo</CardTitle>
            <CardDescription>
              Specifični predlogi za delo na šibkih področjih
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{rec.topic}</span>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority === 'high' ? 'Visoka' : rec.priority === 'medium' ? 'Srednja' : 'Nizka'} prioriteta
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.action}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Začni
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Nasveti za izboljšavo</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Redno ponavljajte šibka področja</li>
                <li>• Začnite z osnovami pred naprednimi temami</li>
                <li>• Uporabite različne učne metode (videi, flashcards, kvizi)</li>
                <li>• Sledite svojim rezultatom in praznujte izboljšave</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}