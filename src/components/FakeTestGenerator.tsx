'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Brain, FileText, CheckCircle, XCircle, Award } from 'lucide-react';

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
}

interface TestResult {
  testId: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: string; answer: string; isCorrect: boolean }[];
  feedback: string;
  grade: string;
}

interface TestSummary {
  id: string;
  subject: string;
  topic: string;
  grade: number;
  difficulty: string;
  questionsCount: number;
  createdAt: string;
  hasResult: boolean;
  latestScore?: number;
  latestGrade?: string;
}

export function FakeTestGenerator() {
  const queryClient = useQueryClient();

  const [testForm, setTestForm] = useState({
    subject: '',
    topic: '',
    grade: '',
    difficulty: 'medium'
  });

  const [currentTest, setCurrentTest] = useState<FakeTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showTestList, setShowTestList] = useState(true);

  // Query for user's fake tests
  const { data: userTests, isLoading: testsLoading, error: testsError } = useQuery({
    queryKey: ['user-fake-tests'],
    queryFn: async () => {
      const response = await fetch('/api/students/fake-tests');
      if (!response.ok) throw new Error('Failed to fetch tests');
      return response.json();
    },
  });

  const generateTest = useMutation({
    mutationFn: async (data: typeof testForm) => {
      const controller = new AbortController();
      const TIMEOUT_MS = 120000; // 2 minutes
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const response = await fetch('/api/students/fake-tests/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!response.ok) {
          let errMsg = 'Failed to generate test';
          try {
            const body = await response.json();
            if (body?.error) errMsg = body.error;
          } catch (e) {
            // ignore JSON parse errors
          }
          throw new Error(errMsg);
        }
        return response.json();
      } catch (err: any) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
          throw new Error('Generation timed out. Try again later.');
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      // Parse questions if it's a string
      const test = data.test;
      if (test && typeof test.questions === 'string') {
        try {
          test.questions = JSON.parse(test.questions);
        } catch (e) {
          console.error('Failed to parse test questions:', e);
          test.questions = [];
        }
      }
      setCurrentTest(test);
      setAnswers({});
      setTestResult(null);
      setShowResults(false);
      setShowTestList(false);
      queryClient.invalidateQueries({ queryKey: ['user-fake-tests'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-tests'] });
    },
    onError: (err: any) => {
      console.error('Generate test error:', err);
      alert(err?.message || 'Failed to generate test');
    },
  });

  const submitTest = useMutation({
    mutationFn: async () => {
      if (!currentTest) return;

      const response = await fetch('/api/students/fake-tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: currentTest.id,
          answers,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit test');
      return response.json();
    },
    onSuccess: (data) => {
      setTestResult(data.result);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['user-fake-tests'] });
    },
  });

  const handleGenerateTest = () => {
    if (!testForm.subject.trim() || !testForm.topic.trim() || !testForm.grade) return;
    generateTest.mutate(testForm);
  };

  const handleSubmitTest = () => {
    submitTest.mutate();
  };

  const handleLoadTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/students/fake-tests/${testId}`);
      if (!response.ok) throw new Error('Failed to load test');
      const testData = await response.json();

      // Parse questions if it's a string
      if (testData && typeof testData.questions === 'string') {
        try {
          testData.questions = JSON.parse(testData.questions);
        } catch (e) {
          console.error('Failed to parse test questions:', e);
          testData.questions = [];
        }
      }

      setCurrentTest(testData);
      setAnswers({});
      setTestResult(null);
      setShowResults(false);
      setShowTestList(false);
    } catch (error) {
      console.error('Error loading test:', error);
      alert('Failed to load test. Please try again.');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case '5': return 'text-green-600 bg-green-100';
      case '4': return 'text-blue-600 bg-blue-100';
      case '3': return 'text-yellow-600 bg-yellow-100';
      case '2': return 'text-orange-600 bg-orange-100';
      case '1': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Test History Section */}
      {showTestList && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Your Practice Tests
            </CardTitle>
            <CardDescription>
              View and retake your previously generated practice tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testsError ? (
              <div className="text-center py-8 text-destructive">
                <XCircle className="w-12 h-12 mx-auto mb-4" />
                <p>Error loading tests: {testsError.message}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : testsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-2">Loading tests...</span>
              </div>
            ) : userTests && userTests.length > 0 ? (
              <div className="space-y-3">
                {userTests.map((test: TestSummary) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{test.subject} - {test.topic}</h4>
                        <Badge variant="outline">Grade {test.grade}</Badge>
                        <Badge variant="secondary">{test.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {test.questionsCount} questions • Created {new Date(test.createdAt).toLocaleDateString('sl-SI')}
                      </p>
                      {test.hasResult && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm">Latest score:</span>
                          <Badge className={getGradeColor(test.latestGrade || '1')}>
                            {test.latestScore}/{test.questionsCount} ({test.latestGrade})
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleLoadTest(test.id)}
                      variant="outline"
                      size="sm"
                    >
                      {test.hasResult ? 'Retake' : 'Take Test'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No practice tests yet. Generate your first test below!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Fake Test Generator
          </CardTitle>
          <CardDescription>
            Generate realistic practice tests based on your materials and curriculum.
            Reduce test anxiety by practicing with school-like exams.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Select value={testForm.grade || undefined} onValueChange={(value) => setTestForm(prev => ({ ...prev, grade: value }))}>
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
              <Select value={testForm.difficulty || undefined} onValueChange={(value) => setTestForm(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
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
            disabled={generateTest.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {generateTest.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Test...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Generate Practice Test
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {currentTest && !showResults && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Practice Test: {currentTest.subject} - {currentTest.topic}
                </CardTitle>
                <CardDescription>
                  Grade {currentTest.grade} • {currentTest.questions.length} questions
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setCurrentTest(null);
                  setAnswers({});
                  setTestResult(null);
                  setShowResults(false);
                  setShowTestList(true);
                }}
                variant="outline"
                size="sm"
              >
                Back to Tests
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.isArray(currentTest.questions) && currentTest.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-3">{question.question}</p>

                    {question.type === 'multiple-choice' && question.options && (
                      <div className="space-y-2">
                        {(Array.isArray(question.options) ? question.options : []).map((option, optionIndex) => (
                          <label key={`${question.id}-option-${optionIndex}`} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="text-blue-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'short-answer' && (
                      <Input
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Your answer..."
                        className="max-w-md"
                      />
                    )}

                    {question.type === 'essay' && (
                      <Textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Write your essay answer here..."
                        rows={4}
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmitTest}
                disabled={submitTest.isPending || Object.keys(answers).length < currentTest.questions.length}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitTest.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Grading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Submit Test
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && testResult && currentTest && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Test Results
            </CardTitle>
            <CardDescription>
              Your performance analysis and feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{testResult.score}/{testResult.totalQuestions}</div>
                  <div className="text-sm opacity-90">Correct Answers</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round((testResult.score / testResult.totalQuestions) * 100)}%</div>
                  <div className="text-sm opacity-90">Score</div>
                </CardContent>
              </Card>

              <Card className={`border-0 ${getGradeColor(testResult.grade)}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">Grade {testResult.grade}</div>
                  <div className="text-sm opacity-75">Final Grade</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Detailed Feedback</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{testResult.feedback}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Question Review</h3>
              {currentTest.questions.map((question, index) => {
                const userAnswer = testResult.answers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.isCorrect;

                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          {index + 1}. {question.question}
                        </p>

                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Your answer: </span>
                            <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              {userAnswer?.answer || 'Not answered'}
                            </span>
                          </div>

                          {!isCorrect && question.correctAnswer && (
                            <div>
                              <span className="font-medium text-gray-700">Correct answer: </span>
                              <span className="text-green-700">{question.correctAnswer}</span>
                            </div>
                          )}

                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <span className="font-medium text-blue-700">Explanation: </span>
                              <span className="text-blue-800">{question.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={() => {
                  setCurrentTest(null);
                  setAnswers({});
                  setTestResult(null);
                  setShowResults(false);
                }}
                variant="outline"
              >
                Take Another Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}