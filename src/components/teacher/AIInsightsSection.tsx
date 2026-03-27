import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, AlertTriangle, TrendingDown, Users, Lightbulb, Target } from 'lucide-react';

interface AIInsightsSectionProps {
  // No props needed for now
}

export const AIInsightsSection: React.FC<AIInsightsSectionProps> = () => {
  // Mock AI-generated insights
  const interventionSuggestions = [
    {
      id: 1,
      student: 'John Doe',
      issue: 'Struggling with Algebra',
      confidence: 92,
      suggestion: 'Recommend additional practice problems focusing on linear equations',
      priority: 'high',
      type: 'academic'
    },
    {
      id: 2,
      student: 'Jane Smith',
      issue: 'Low engagement in History class',
      confidence: 87,
      suggestion: 'Consider incorporating multimedia content and group discussions',
      priority: 'medium',
      type: 'engagement'
    },
    {
      id: 3,
      student: 'Bob Johnson',
      issue: 'Consistent late submissions',
      confidence: 95,
      suggestion: 'Set up a personalized deadline reminder system',
      priority: 'high',
      type: 'behavioral'
    },
  ];

  const performancePatterns = [
    {
      pattern: 'Week 3 performance dip',
      description: 'Students show 15% drop in quiz scores every third week',
      affected: 12,
      recommendation: 'Schedule review sessions before week 3'
    },
    {
      pattern: 'Morning vs Afternoon performance',
      description: 'Students perform 20% better in morning classes',
      affected: 25,
      recommendation: 'Adjust scheduling for important assessments'
    },
    {
      pattern: 'Group work participation',
      description: 'Some students dominate while others remain silent',
      affected: 8,
      recommendation: 'Implement structured participation guidelines'
    },
  ];

  const predictiveAlerts = [
    {
      student: 'Alice Brown',
      risk: 'high',
      prediction: 'Likely to struggle with upcoming Chemistry unit',
      basedOn: 'Previous performance in related topics',
      action: 'Provide additional support materials'
    },
    {
      student: 'Charlie Wilson',
      risk: 'medium',
      prediction: 'May need help with essay writing',
      basedOn: 'Writing assignment patterns',
      action: 'Schedule writing workshop'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Insights</h2>
          <p className="text-muted-foreground">AI-powered intervention suggestions based on student performance patterns</p>
        </div>
        <Button variant="outline">
          <Brain className="mr-2 h-4 w-4" />
          Refresh Insights
        </Button>
      </div>

      {/* Predictive Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Predictive Alerts
          </CardTitle>
          <CardDescription>
            AI predictions for students who may need intervention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictiveAlerts.map((alert, index) => (
              <Alert key={index} className={alert.risk === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.student}</p>
                      <p className="text-sm">{alert.prediction}</p>
                      <p className="text-xs text-muted-foreground">Based on: {alert.basedOn}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={alert.risk === 'high' ? 'destructive' : 'secondary'}>
                        {alert.risk} risk
                      </Badge>
                      <p className="text-xs mt-1">{alert.action}</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intervention Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            AI Intervention Suggestions
          </CardTitle>
          <CardDescription>
            Personalized recommendations for student support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interventionSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{suggestion.student}</p>
                      <p className="text-sm text-muted-foreground">{suggestion.issue}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      suggestion.priority === 'high' ? 'destructive' :
                      suggestion.priority === 'medium' ? 'secondary' : 'default'
                    }>
                      {suggestion.priority}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {suggestion.confidence}% confidence
                    </p>
                  </div>
                </div>
                <p className="text-sm mb-3">{suggestion.suggestion}</p>
                <div className="flex space-x-2">
                  <Button size="sm">Apply Suggestion</Button>
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">Dismiss</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="mr-2 h-5 w-5" />
            Class Performance Patterns
          </CardTitle>
          <CardDescription>
            AI-identified patterns in class performance and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performancePatterns.map((pattern, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{pattern.pattern}</h3>
                  <Badge variant="outline">{pattern.affected} students affected</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm font-medium mb-1">AI Recommendation:</p>
                  <p className="text-sm">{pattern.recommendation}</p>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button size="sm">Implement</Button>
                  <Button size="sm" variant="outline">Learn More</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {interventionSuggestions.filter(s => s.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Students need immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Predictions Made</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {predictiveAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">Future performance insights</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patterns Identified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {performancePatterns.length}
            </div>
            <p className="text-xs text-muted-foreground">Class-wide trends</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">91%</div>
            <p className="text-xs text-muted-foreground">Average prediction accuracy</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};