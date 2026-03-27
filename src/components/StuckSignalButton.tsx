import { Button } from '@/components/ui/button';
import axios from 'axios';

export function StuckSignalButton({ materialId }: { materialId: string }) {
  const handleSignal = async () => {
    try {
      await axios.post('/api/stuck', { materialId });
      alert('Signal poslan. Hvala!');
    } catch (e) {
      console.error('Failed to send stuck signal', e);
      alert('Napaka pri pošiljanju signala.');
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleSignal}>
      Zataknil sem se
    </Button>
  );
}
