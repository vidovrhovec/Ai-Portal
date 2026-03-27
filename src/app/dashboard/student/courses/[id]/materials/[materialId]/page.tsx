'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Sparkles, User } from 'lucide-react';
import { useMaterials, useEnrollments } from '@/hooks';
import { VoiceInputOutput } from '@/components/VoiceInputOutput';
import type { Material } from '@prisma/client';

const PERSONAS = [
  { value: 'friendly-grandma', label: 'Prijazna babica' },
  { value: 'strict-coach', label: 'Strogi trener' },
  { value: 'scientist', label: 'Znanstvenik' },
];

export default function InteractiveLearningPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();

  const courseId = params?.id as string;
  const materialId = params?.materialId as string;

  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: materials, isLoading: materialsLoading } = useMaterials(courseId || '');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiMode, setAIMode] = useState<'eli5' | 'summary' | 'keypoints'>('eli5');
  const [persona, setPersona] = useState('friendly-grandma');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

  if (!params || !courseId || !materialId) {
    return <div className="p-8 text-center">Nalaganje...</div>;
  }

  if (status === 'loading' || enrollmentsLoading || materialsLoading) {
    return <div className="p-8 text-center">Nalaganje...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const enrollment = enrollments?.find((e: { course: { id: string } }) => e.course.id === courseId);
  if (!enrollment) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Niste vpisani v ta predmet</h1>
        <Button onClick={() => router.push('/dashboard/student')} className="mt-4">
          Nazaj na nadzorno ploščo
        </Button>
      </div>
    );
  }

  const material = materials?.find((m: Material) => m.id === materialId) || selectedMaterial;

  const handleAIQuery = async (query: string) => {
    if (!query.trim()) return;

    const personaPrompt =
      persona === 'friendly-grandma'
        ? 'Odgovarjaj kot prijazna babica, ki spodbuja in razlaga preprosto.'
        : persona === 'strict-coach'
        ? 'Odgovarjaj kot strogi trener, ki spodbuja disciplino in motivira.'
        : 'Odgovarjaj kot znanstvenik, ki uporablja natančne in strokovne razlage.';
    let prompt = '';
    if (aiMode === 'eli5') prompt = `(${personaPrompt}) Razloži kot 5-letniku: ${material?.content || query}`;
    if (aiMode === 'summary') prompt = `(${personaPrompt}) Naredi povzetek: ${material?.content || query}`;
    if (aiMode === 'keypoints') prompt = `(${personaPrompt}) Izpiši ključne točke: ${material?.content || query}`;
    setChatHistory((h) => [...h, { role: 'user', text: query }]);
    setAIPrompt(''); // Clear input

    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt }),
      });
      const data = await response.json();
      setChatHistory((h) => [...h, { role: 'ai', text: data.result || data.response || 'Napaka pri pridobivanju odgovora' }]);
    } catch (error) {
      setChatHistory((h) => [...h, { role: 'ai', text: 'Napaka pri komunikaciji z AI' }]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/student/courses/${courseId}/materials`)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{material?.title || 'Izberite gradivo'}</h1>
        </div>
      </div>

      {/* Material Content */}
      {material ? (
        <Card>
          <CardHeader>
            <CardTitle>Vsebina gradiva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-4">
              {material.content || 'Ni vsebine.'}
            </div>
            <div className="flex gap-2 mb-2">
              <Button variant={aiMode === 'eli5' ? 'default' : 'outline'} onClick={() => setAIMode('eli5')}><Sparkles className="h-4 w-4 mr-1" /> ELI5</Button>
              <Button variant={aiMode === 'summary' ? 'default' : 'outline'} onClick={() => setAIMode('summary')}>Povzetek</Button>
              <Button variant={aiMode === 'keypoints' ? 'default' : 'outline'} onClick={() => setAIMode('keypoints')}>Ključne točke</Button>
            </div>

            {/* Persona selection */}
            <div className="flex gap-2 items-center mb-2">
              <User className="h-4 w-4" />
              <span>AI mentor:</span>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {PERSONAS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Chat history */}
            <div className="mb-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}> 
                  <span className={`inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Simple AI Query Input */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAIPrompt(e.target.value)}
                  placeholder="Vprašajte AI o tem gradivu..."
                  className="flex-1 px-3 py-2 border rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleAIQuery(aiPrompt)}
                />
                <Button onClick={() => handleAIQuery(aiPrompt)} disabled={!aiPrompt.trim()}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Vprašaj
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <VoiceInputOutput
                onVoiceQuery={async (voiceQuery) => {
                  await handleAIQuery(voiceQuery);
                }}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Izberite gradivo za učenje:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {materials?.map((m: Material) => (
              <Card key={m.id} className="cursor-pointer hover:bg-accent" onClick={() => setSelectedMaterial(m)}>
                <CardContent className="p-3">{m.title}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
