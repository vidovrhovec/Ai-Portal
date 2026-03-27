import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Cell = { competency: string; coverage: number };

export default function CurriculumHeatmap({ data }: { data?: Cell[] }) {
  const cells = data || [
    { competency: 'Algebra', coverage: 0.6 },
    { competency: 'Geometry', coverage: 0.4 },
    { competency: 'Trigonometry', coverage: 0.8 },
    { competency: 'Statistics', coverage: 0.3 },
    { competency: 'Calculus', coverage: 0.2 },
  ];

  const getColor = (v: number) => {
    if (v >= 0.75) return 'bg-green-500';
    if (v >= 0.5) return 'bg-yellow-400';
    if (v >= 0.25) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Curriculum Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cells.map((c) => (
            <div key={c.competency} className="p-3 sm:p-4 border rounded-lg flex flex-col items-start touch-manipulation hover:shadow-sm transition-shadow">
              <div className={`w-full h-3 sm:h-4 rounded ${getColor(c.coverage)}`} />
              <div className="mt-2 font-medium text-sm sm:text-base leading-tight">{c.competency}</div>
              <div className="text-xs text-muted-foreground mt-1">{Math.round(c.coverage * 100)}% coverage</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
