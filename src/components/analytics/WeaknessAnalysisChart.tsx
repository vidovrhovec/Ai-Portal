import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useWeaknessAnalysis } from '@/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function WeaknessAnalysisChart() {
  const { data, isLoading, error } = useWeaknessAnalysis();

  if (isLoading) return <div>Nalaganje analitike...</div>;
  if (error) return <div>Napaka pri analitiki.</div>;
  if (!data || data.length === 0) return <div>Ni dovolj podatkov za analizo.</div>;

  // Prikaži top 5 najslabših tem
  const weakest = data.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Šibke točke (teme z najnižjim povprečjem)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={weakest} outerRadius="80%">
              <PolarGrid />
              <PolarAngleAxis dataKey="topic" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Povprečje (%)" dataKey="average" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Priporočila za izboljšanje:</h3>
          <ul className="list-disc ml-6">
            {weakest.map((t: any) => (
              <li key={t.topic}>
                <span className="font-medium">{t.topic}:</span> Povprečje {t.average}%. Priporočamo dodatno vajo in ponovitev gradiv.
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
