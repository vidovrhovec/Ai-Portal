'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, FileText, CheckCircle } from 'lucide-react';
import { useMaterials, useEnrollments } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import type { Material } from '@prisma/client';

export default function CourseMaterialsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();

  const courseId = params?.id as string;
  
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: materials, isLoading: materialsLoading } = useMaterials(courseId || '');
  
  const enrollment = enrollments?.find((e: { course: { id: string } }) => e.course.id === courseId);

  if (!params || !courseId) {
    return <div className="p-8 text-center">Nalaganje...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || enrollmentsLoading || materialsLoading) {
    return <div className="p-8 text-center">Nalaganje...</div>;
  }

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/student/courses/${courseId}`)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Gradiva: {enrollment.course.title}</h1>
          <p className="text-muted-foreground">Seznam vseh učnih gradiv</p>
        </div>
      </div>

      {materials && materials.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {materials.map((material: Material) => (
            <Card key={material.id} className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{material.title}</h3>
                    <p className="text-sm text-muted-foreground">{material.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button size="sm">Odpri</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Za ta predmet še ni naloženih gradiv.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
