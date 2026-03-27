'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Calendar } from 'lucide-react';

interface ProgressChartProps {
  data: {
    dates: string[];
    points: number[];
    currentStreak: number;
    totalPoints: number;
    averageScore: number;
    period: string;
  };
  isLoading?: boolean;
}

export function ProgressChart({ data, isLoading }: ProgressChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grafikon napredka</CardTitle>
          <CardDescription>Nalaganje podatkov...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data.dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString('sl-SI', { month: 'short', day: 'numeric' }),
    points: data.points[index] || 0,
  }));

  const formatPeriod = (period: string) => {
    switch (period) {
      case '7d': return '7 dni';
      case '30d': return '30 dni';
      case '90d': return '90 dni';
      default: return '30 dni';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{data.totalPoints}</p>
                <p className="text-sm text-muted-foreground">Skupne točke</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{data.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Trenutni niz</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(data.averageScore)}%</p>
                <p className="text-sm text-muted-foreground">Povprečni rezultat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Grafikon točk v času</CardTitle>
              <CardDescription>
                Spreminjanje vaših točk v zadnjih {formatPeriod(data.period)}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {formatPeriod(data.period)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-blue-600">
                            Točke: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}