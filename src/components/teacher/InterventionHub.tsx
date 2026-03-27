import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InterventionHub({ courseId }: { courseId: string }) {
  const [riskList, setRiskList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    axios.get(`/api/teacher/interventions/risk-radar?courseId=${courseId}`)
      .then(res => setRiskList(res.data || []))
      .catch(() => setRiskList([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleAssignRemedial = async (studentId?: string) => {
    setAssigning(true);
    try {
      const payload: any = { courseId };
      if (studentId) payload.studentId = studentId;
      // Let the server decide topic based on weak competencies or allow teacher to pass one
      await axios.post('/api/teacher/interventions/remedial', payload);
      // Refresh list
      const res = await axios.get(`/api/teacher/interventions/risk-radar?courseId=${courseId}`);
      setRiskList(res.data || []);
    } catch (e) {
      console.error('Failed to assign remedial', e);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Center za intervencijo — Risk Radar</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Nalaganje...</div>
        ) : (
          <div className="space-y-3">
            {riskList.length === 0 && <div>Ni zaznanih tveganih učencev.</div>}
            {riskList.map((r) => (
              <div key={r.studentId} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{r.name || r.studentId}</div>
                  <div className="text-sm text-muted-foreground">Avg score: {r.avgScore ?? '-'} — Activity drop: {r.activityDrop ? 'yes' : 'no'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleAssignRemedial(r.studentId)} disabled={assigning}>Dodeli remedial</Button>
                </div>
              </div>
            ))}
            {riskList.length > 0 && (
              <div className="mt-2">
                <Button onClick={() => handleAssignRemedial()} disabled={assigning}>Dodeli remedial vsem tveganim</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
