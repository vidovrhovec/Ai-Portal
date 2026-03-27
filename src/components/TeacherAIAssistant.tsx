
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useTeacherAI } from '@/hooks';

export function TeacherAIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [tab, setTab] = useState<'chat' | 'generate-task' | 'analyze-class'>('chat');
  const [taskTopic, setTaskTopic] = useState('');
  const [taskDifficulty, setTaskDifficulty] = useState('intermediate');
  const [taskType, setTaskType] = useState('multiple-choice');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const aiMutation = useTeacherAI();

  // Chat
  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: 'user', text: input }]);
    setInput('');
    try {
      const res = await aiMutation.mutateAsync({ type: 'chat', message: input });
      setMessages((msgs) => [...msgs, { role: 'ai', text: res.reply }]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { role: 'ai', text: 'Napaka pri AI odgovoru.' }]);
    }
  };

  // Generate Task/Quiz
  const handleGenerateTask = async () => {
    if (!taskTopic.trim()) return;
    try {
      const res = await aiMutation.mutateAsync({
        type: 'generate-task',
        topic: taskTopic,
        difficulty: taskDifficulty,
        questionType: taskType,
      });
      setMessages((msgs) => [
        ...msgs,
        { role: 'user', text: `Generiraj nalogo za temo: ${taskTopic}` },
        { role: 'ai', text: JSON.stringify(res.task, null, 2) },
      ]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { role: 'ai', text: 'Napaka pri generiranju naloge.' }]);
    }
  };

  // Analyze Class
  const handleAnalyzeClass = async () => {
    try {
      const res = await aiMutation.mutateAsync({ type: 'analyze-class' });
      setAnalysisResult(res.summary || 'Ni podatkov.');
    } catch (e) {
      setAnalysisResult('Napaka pri analizi razreda.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Pomočnik za učitelje</CardTitle>
        <div className="flex gap-2 mt-2">
          <Button variant={tab === 'chat' ? 'default' : 'outline'} size="sm" onClick={() => setTab('chat')}>Chat</Button>
          <Button variant={tab === 'generate-task' ? 'default' : 'outline'} size="sm" onClick={() => setTab('generate-task')}>Generiraj nalogo/kviz</Button>
          <Button variant={tab === 'analyze-class' ? 'default' : 'outline'} size="sm" onClick={() => setTab('analyze-class')}>Analiza razreda</Button>
        </div>
      </CardHeader>
      <CardContent>
        {tab === 'chat' && (
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto border rounded p-2 bg-gray-50">
              {messages.length === 0 && <div className="text-muted-foreground">Začnite pogovor z AI pomočnikom...</div>}
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === 'ai' ? 'text-blue-700' : 'text-black'}>
                  <b>{msg.role === 'ai' ? 'AI:' : 'Vi:'}</b> {msg.text}
                </div>
              ))}
            </div>
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Vpišite vprašanje za AI..."
              rows={2}
            />
            <Button onClick={handleSend} disabled={aiMutation.isPending || !input.trim()}>
              Pošlji
            </Button>
          </div>
        )}
        {tab === 'generate-task' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={taskTopic} onChange={e => setTaskTopic(e.target.value)} placeholder="Tema (npr. Algebra)" />
              <Select value={taskDifficulty} onValueChange={setTaskDifficulty}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Začetni</SelectItem>
                  <SelectItem value="intermediate">Srednji</SelectItem>
                  <SelectItem value="advanced">Napredni</SelectItem>
                </SelectContent>
              </Select>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Izbirni</SelectItem>
                  <SelectItem value="short-answer">Kratki odgovor</SelectItem>
                  <SelectItem value="essay">Esej</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateTask} disabled={aiMutation.isPending || !taskTopic.trim()}>
              Generiraj nalogo/kviz
            </Button>
          </div>
        )}
        {tab === 'analyze-class' && (
          <div className="space-y-4">
            <Button onClick={handleAnalyzeClass} disabled={aiMutation.isPending}>
              Analiziraj razred
            </Button>
            {analysisResult && (
              <div className="border rounded p-3 bg-gray-50 mt-2">
                {analysisResult}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
