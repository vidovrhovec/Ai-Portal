'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Brain, FileText, CheckCircle, Users, UserCheck } from 'lucide-react';
import { useStudents } from '@/hooks';
import { getCSRFToken } from '@/lib/utils';

interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

interface FakeTest {
  id: string;
  subject: string;
  topic: string;
  grade: number;
  questions: Question[];
  createdAt: string;
  assignedStudents: string[];
}

interface Student {
  id: string;
  name: string;
  email: string;
}

export function TeacherFakeTestGenerator() {
  const { data: students } = useStudents();
  const [testForm, setTestForm] = useState({
    subject: '',
    topic: '',
    grade: '',
    difficulty: 'medium'
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [generatedTest, setGeneratedTest] = useState<FakeTest | null>(null);

  const generateTest = useMutation({
    mutationFn: async (data: typeof testForm & { studentIds: string[] }) => {
      const csrfToken = await getCSRFToken();
      const response = await fetch('/api/teacher/fake-tests/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to generate test');
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedTest(data.test);
    },
  });

  const assignTest = useMutation({
    mutationFn: async (testId: string) => {
      const csrfToken = await getCSRFToken();
      const response = await fetch('/api/teacher/fake-tests/assign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ testId, studentIds: selectedStudents }),
      });
      if (!response.ok) throw new Error('Failed to assign test');
      return response.json();
    },
    onSuccess: () => {
      setGeneratedTest(null);
      setSelectedStudents([]);
      setTestForm({ subject: '', topic: '', grade: '', difficulty: 'medium' });
    },
  });

  const handleGenerateTest = () => {
    if (!testForm.subject.trim() || !testForm.topic.trim() || !testForm.grade || selectedStudents.length === 0) return;
    generateTest.mutate({ ...testForm, studentIds: selectedStudents });
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignTest = () => {
    if (generatedTest) {
      assignTest.mutate(generatedTest.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Fake Test Generator for Students
          </CardTitle>
          <CardDescription>
            Create personalized practice tests for your students. AI adapts to each student's performance history and curriculum level.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Select Students</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
              {students?.map((student: Student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => handleStudentToggle(student.id)}
                  />
                  <label
                    htmlFor={student.id}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <UserCheck className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{student.name}</span>
                  </label>
                </div>
              ))}
            </div>
            {selectedStudents.length > 0 && (
              <div className="mt-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                </Badge>
              </div>
            )}
          </div>

          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={testForm.subject}
                onChange={(e) => setTestForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., History, Mathematics, Biology"
              />
            </div>
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={testForm.topic}
                onChange={(e) => setTestForm(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g., 19th Century, Algebra, Photosynthesis"
              />
            </div>
            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={testForm.grade} onValueChange={(value) => setTestForm(prev => ({ ...prev, grade: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Grade</SelectItem>
                  <SelectItem value="2">2nd Grade</SelectItem>
                  <SelectItem value="3">3rd Grade</SelectItem>
                  <SelectItem value="4">4th Grade</SelectItem>
                  <SelectItem value="5">5th Grade</SelectItem>
                  <SelectItem value="6">6th Grade</SelectItem>
                  <SelectItem value="7">7th Grade</SelectItem>
                  <SelectItem value="8">8th Grade</SelectItem>
                  <SelectItem value="9">9th Grade</SelectItem>
                  <SelectItem value="10">10th Grade</SelectItem>
                  <SelectItem value="11">11th Grade</SelectItem>
                  <SelectItem value="12">12th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={testForm.difficulty} onValueChange={(value) => setTestForm(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerateTest}
            disabled={generateTest.isPending || selectedStudents.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {generateTest.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Personalized Test...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Generate Test for {selectedStudents.length} Student{selectedStudents.length > 1 ? 's' : ''}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedTest && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Generated Test Preview
            </CardTitle>
            <CardDescription>
              {generatedTest.subject} - {generatedTest.topic} • Grade {generatedTest.grade} • {generatedTest.questions.length} questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {generatedTest.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Type: </span>
                        {question.type === 'multiple-choice' ? 'Multiple Choice' :
                         question.type === 'short-answer' ? 'Short Answer' : 'Essay'}
                      </div>
                      {question.options && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Options: </span>
                          <span className="text-sm text-gray-600">{question.options.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                This test will be assigned to {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setGeneratedTest(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignTest}
                  disabled={assignTest.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {assignTest.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Assigning...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Assign Test
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}