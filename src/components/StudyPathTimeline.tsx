import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AdaptiveStep = {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  estimatedTime?: number; // minutes
  completed?: boolean;
  current?: boolean;
};

export default function StudyPathTimeline({ goal }: { goal: string }) {
  const [steps, setSteps] = useState<AdaptiveStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch('/api/adaptive-learning/path', { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load study path');
        const json = await res.json();
        if (!mounted) return;
        const fetchedSteps: AdaptiveStep[] = (json.steps || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          difficulty: s.difficulty,
          estimatedTime: s.estimatedTime,
          completed: !!s.completed,
          current: !!s.current,
        }));
        setSteps(fetchedSteps);
      } catch (e: any) {
        console.error('StudyPathTimeline error', e);
        if (mounted) setError(String(e?.message || 'Unknown error'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [goal]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Path{goal ? `: ${goal}` : ''}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Nalaganje načrta...</div>
        ) : error ? (
          <div className="text-destructive">Napaka: {error}</div>
        ) : (
          <div className="space-y-4">
            {steps.length === 0 && <div className="text-sm text-muted-foreground">Ni korakov v načrtu.</div>}
            {steps.map((s) => (
              <div key={s.id} className={`border rounded p-3 ${s.current ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.title}</div>
                    {s.description && <div className="text-xs text-muted-foreground">{s.description}</div>}
                  </div>
                  <div className="text-sm font-semibold">{s.estimatedTime ? `${s.estimatedTime} min` : '-'}</div>
                </div>
                <div className="mt-2 bg-gray-100 rounded h-2 overflow-hidden">
                  <div className={`h-2 ${s.completed ? 'bg-green-500' : 'bg-primary'}`} style={{ width: s.completed ? '100%' : (s.current ? '40%' : '10%') }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
