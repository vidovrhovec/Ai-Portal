'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, Trophy, TrendingUp, Target, Shield } from 'lucide-react';

interface PeerComparisonProps {
  data: {
    percentile?: number;
    classAverage?: number;
    totalStudents?: number;
    distribution?: {
      excellent: number;
      good: number;
      average: number;
      needsImprovement: number;
    };
    userScore?: number;
    rank?: number;
    message?: string;
    error?: string;
  } | null;
  isLoading?: boolean;
}

export function PeerComparison({ data, isLoading }: PeerComparisonProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Primerjava s sošolci</CardTitle>
          <CardDescription>Nalaganje podatkov...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Primerjava s sošolci</CardTitle>
          <CardDescription>Podatki niso na voljo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {data?.error || 'Za primerjavo potrebujete vsaj nekaj sošolcev v vašem razredu.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPercentileColor = (percentile: number | undefined) => {
    if (!percentile) return 'text-gray-600 bg-gray-100';
    if (percentile >= 80) return 'text-green-600 bg-green-100';
    if (percentile >= 60) return 'text-blue-600 bg-blue-100';
    if (percentile >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPercentileBadge = (percentile: number | undefined) => {
    if (!percentile) return { text: 'Ni podatkov', color: 'bg-gray-100 text-gray-800' };
    if (percentile >= 90) return { text: 'Odlično', color: 'bg-green-100 text-green-800' };
    if (percentile >= 75) return { text: 'Zelo dobro', color: 'bg-blue-100 text-blue-800' };
    if (percentile >= 50) return { text: 'Dobro', color: 'bg-yellow-100 text-yellow-800' };
    if (percentile >= 25) return { text: 'Potrebno izboljšati', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Potrebna pomoč', color: 'bg-red-100 text-red-800' };
  };

  const badge = getPercentileBadge(data.percentile);

  return (
    <div className="space-y-6">
      {/* Main Comparison Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Primerjava s sošolci
          </CardTitle>
          <CardDescription>
            Anonimna primerjava vašega napredka z razredom ({data.totalStudents} študentov)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            {/* Percentile Display */}
            <div>
              <div className="text-6xl font-bold mb-2">
                <span className={getPercentileColor(data.percentile)}>
                  {data.percentile || 'N/A'}
                </span>
                {data.percentile && <span className="text-2xl text-muted-foreground">. percentile</span>}
              </div>
              <Badge className={`text-lg px-4 py-2 ${badge.color}`}>
                {badge.text}
              </Badge>
            </div>

            {/* Personal Stats */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">#{data.rank || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Vaš rang</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{data.userScore || 'N/A'}%</div>
                <div className="text-sm text-muted-foreground">Vaš rezultat</div>
              </div>
            </div>

            {/* Class Average */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-lg font-medium">Razredno povprečje</div>
                <div className="text-3xl font-bold text-gray-700">{data.classAverage || 'N/A'}%</div>
              </div>
            </div>

            {/* Message */}
            {data.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">{data.message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Razporeditev rezultatov v razredu</CardTitle>
          <CardDescription>Kako se vaši sošolci uvrščajo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Odlično (90-100%)</span>
              </div>
              <span className="font-medium">{data.distribution?.excellent || 0}</span>
            </div>
            <Progress value={((data.distribution?.excellent || 0) / (data.totalStudents || 1)) * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Zelo dobro (70-89%)</span>
              </div>
              <span className="font-medium">{data.distribution?.good || 0}</span>
            </div>
            <Progress value={((data.distribution?.good || 0) / (data.totalStudents || 1)) * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">Dobro (50-69%)</span>
              </div>
              <span className="font-medium">{data.distribution?.average || 0}</span>
            </div>
            <Progress value={((data.distribution?.average || 0) / (data.totalStudents || 1)) * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Potrebno izboljšati (&lt;50%)</span>
              </div>
              <span className="font-medium">{data.distribution?.needsImprovement || 0}</span>
            </div>
            <Progress value={((data.distribution?.needsImprovement || 0) / (data.totalStudents || 1)) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Vaša zasebnost je zaščitena</p>
              <p className="text-sm text-green-700 mt-1">
                Vsi podatki so anonimizirani. Ne delimo individualnih rezultatov z drugimi študenti ali učitelji.
                Primerjava temelji na agregiranih statistikah vašega razreda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivation Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="font-medium">Nastavite cilje in sledite napredku!</p>
              <p className="text-sm text-muted-foreground">
                Uporabite te podatke kot motivacijo za izboljšavo vaših rezultatov.
              </p>
            </div>
            <Button className="ml-auto">
              <Target className="h-4 w-4 mr-2" />
              Nastavi cilj
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}