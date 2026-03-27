'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, BookOpen, Brain, MessageSquare } from 'lucide-react';
import { useEnrollments } from '@/hooks';

export default function CoursePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();

  const courseId = params?.id as string;
  
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();

  if (!params || !courseId) {
    return <div className="p-8 text-center">Nalaganje...</div>;
  }

  if (status === 'loading' || enrollmentsLoading) {
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
        <h1 className="text-2xl font-bold">Predmet ni bil najden</h1>
        <Button onClick={() => router.push('/dashboard/student')} className="mt-4">
          Nazaj na nadzorno ploščo
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/student')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{enrollment.course.title}</h1>
          <p className="text-muted-foreground">{enrollment.course.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push(`/dashboard/student/courses/${courseId}/materials`)}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span>Učna gradiva</span>
            </CardTitle>
            <CardDescription>Preglejte vsa gradiva za ta predmet</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span>AI Tutor</span>
            </CardTitle>
            <CardDescription>Interaktivno učenje z AI pomočnikom</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <span>Vprašanja</span>
            </CardTitle>
            <CardDescription>Postavite vprašanje o snovi</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Zadnje aktivnosti</h2>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Tukaj bodo prikazane vaše zadnje aktivnosti pri tem predmetu.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
