import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CourseAnalytics({ courseId }: { courseId: string }) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      console.log('CourseAnalytics: Component mounted for course:', courseId);
      // TODO: Course analytics API doesn't exist yet
      // const res = await axios.get(`/api/course-analytics?courseId=${courseId}`);
      // setAnalytics(res.data);
      setAnalytics(null); // No analytics for now
      setLoading(false);
    };

    loadAnalytics();
  }, [courseId]);

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">Analitika tečaja</h3>
      {loading ? (
        <div>Nalaganje ...</div>
      ) : analytics ? (
        <div>
          <div className="mb-2">Število članov: <span className="font-bold">{analytics.memberCount}</span></div>
          <div className="mb-2">Povprečno opravljenih nalog: <span className="font-bold">{analytics.avgCompletedTasks}</span></div>
          <div className="mb-2">Povprečna ocena: <span className="font-bold">{analytics.avgScore}</span></div>
          <div className="mb-2">Najbolj aktiven član: <span className="font-bold">{analytics.topMember || '-'}</span></div>
        </div>
      ) : (
        <div>Ni podatkov za analitiko.</div>
      )}
    </div>
  );
}
