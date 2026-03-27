import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobalRankWidget({ studentId }: { studentId: string }) {
  const [rank, setRank] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/analytics/comparison?studentId=${studentId}`);
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (!mounted) return;
        setRank(json.rank ?? null);
        setPercentile(json.percentile ?? null);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [studentId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Rank</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold">{rank ?? '-'}</div>
          <div className="text-sm text-muted-foreground">Global percentile: {percentile ? `${percentile}%` : '-'}</div>
        </div>
      </CardContent>
    </Card>
  );
}
