import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Bell, Send, User, TrendingDown, Clock, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface StudentStruggling {
  id: string;
  name: string;
  course: string;
  issue: string;
  performance: number;
  lastActivity: string;
  suggestedAction: string;
  priority: 'high' | 'medium' | 'low';
}

interface NudgeTemplate {
  id: string;
  title: string;
  message: string;
  type: 'encouragement' | 'reminder' | 'intervention';
}

interface AutomatedNudgesSectionProps {
  // No props needed for now
}

export const AutomatedNudgesSection: React.FC<AutomatedNudgesSectionProps> = () => {
  const [selectedStudent, setSelectedStudent] = useState<StudentStruggling | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  const queryClient = useQueryClient();

  // Fetch struggling students
  const { data: strugglingStudents, isLoading } = useQuery({
    queryKey: ['struggling-students'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/struggling-students');
      if (!res.ok) throw new Error('Failed to fetch struggling students');
      return res.json();
    },
  });

  // Fetch nudge templates
  const { data: nudgeTemplates } = useQuery({
    queryKey: ['nudge-templates'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/nudge-templates');
      if (!res.ok) throw new Error('Failed to fetch nudge templates');
      return res.json();
    },
  });

  // Send nudge mutation
  const sendNudgeMutation = useMutation({
    mutationFn: async (data: { studentId: string; message: string; type: string }) => {
      const res = await fetch('/api/teacher/send-nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send nudge');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['struggling-students'] });
      setSelectedStudent(null);
      setSelectedTemplate('');
      setCustomMessage('');
    },
  });

  const handleSendNudge = async () => {
    if (!selectedStudent || !customMessage.trim()) return;

    setIsSending(true);
    try {
      await sendNudgeMutation.mutateAsync({
        studentId: selectedStudent.id,
        message: customMessage,
        type: selectedTemplate,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = nudgeTemplates?.find((t: NudgeTemplate) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomMessage(template.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Avtomatizirani Nudges
        </CardTitle>
        <CardDescription>
          AI predlogi za personalizirane povratne informacije učencem, ki zaostajajo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : strugglingStudents?.length > 0 ? (
          <div className="space-y-4">
            {strugglingStudents.map((student: StudentStruggling) => (
              <Card key={student.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{student.name}</span>
                        <Badge variant={getPriorityColor(student.priority)}>
                          {getPriorityIcon(student.priority)}
                          {student.priority === 'high' ? 'Visoka' :
                           student.priority === 'medium' ? 'Srednja' : 'Nizka'} prioriteta
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{student.course}</span>
                          <TrendingDown className="h-3 w-3" />
                          <span>{student.issue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>Zadnja aktivnost: {student.lastActivity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" />
                          <span>Predlog: {student.suggestedAction}</span>
                        </div>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Pošlji Nudge
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Pošlji Nudge - {student.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="template">Izberi predlogo</Label>
                            <Select onValueChange={handleTemplateSelect}>
                              <SelectTrigger>
                                <SelectValue placeholder="Izberi predlogo za nudge" />
                              </SelectTrigger>
                              <SelectContent>
                                {nudgeTemplates?.map((template: NudgeTemplate) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="message">Sporočilo</Label>
                            <Textarea
                              id="message"
                              placeholder="Vnesite personalizirano sporočilo..."
                              value={customMessage}
                              onChange={(e) => setCustomMessage(e.target.value)}
                              rows={6}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                              Prekliči
                            </Button>
                            <Button
                              onClick={handleSendNudge}
                              disabled={!customMessage.trim() || isSending}
                            >
                              {isSending ? 'Pošiljanje...' : 'Pošlji Nudge'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Vsi učenci dobro napredujejo! Ni potrebe po nudges.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};