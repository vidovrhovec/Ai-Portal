import { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function ObserverLink({ studentId }: { studentId: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createLink = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/parent/observer/create', { studentId });
      setLink(res.data.link);
    } catch (e) {
      console.error(e);
      alert('Napaka pri ustvarjanju povezave.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={createLink} disabled={loading}>{loading ? 'Ustvarjam...' : 'Generiraj Observer Link'}</Button>
      {link && (
        <div className="mt-2 text-sm">
          <div>Povezava (velja omejen čas):</div>
          <a className="text-blue-600 break-all" href={link} target="_blank" rel="noreferrer">{link}</a>
        </div>
      )}
    </div>
  );
}
