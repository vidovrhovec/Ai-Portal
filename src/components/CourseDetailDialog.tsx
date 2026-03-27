import type { Course, Material, Quiz, QuizQuestion } from '@prisma/client';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText } from 'lucide-react';
import { useState } from 'react';

interface CourseDetailDialogProps {
  children: ReactNode;
  course: Course & { materials: Material[]; quizzes: (Quiz & { questions?: QuizQuestion[] })[] };
}

export function CourseDetailDialog({ children, course }: CourseDetailDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>{course.title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Course Description */}
          <div>
            <h3 className="font-medium mb-2">Opis</h3>
            <p className="text-muted-foreground">{course.description || 'Ni opisa'}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{course.materials?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Gradiv</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{course.quizzes?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Kvizi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <p className="text-sm text-muted-foreground">Učencev</p>
              </CardContent>
            </Card>
          </div>

          {/* Materials */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Gradiva
            </h3>
            {course.materials?.length > 0 ? (
              <div className="space-y-2">
                {course.materials.map((material: Material) => (
                  <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{material.title}</p>
                      <p className="text-sm text-muted-foreground">{material.type}</p>
                    </div>
                    <Badge variant="outline">{material.type}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Ni gradiv v tem tečaju</p>
            )}
          </div>

          {/* Quizzes */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Kvizi
            </h3>
            {course.quizzes?.length > 0 ? (
              <div className="space-y-2">
                {course.quizzes.map((quiz: Quiz & { questions?: any[] }) => (
                  <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{quiz.title}</p>
                      <p className="text-sm text-muted-foreground">{Array.isArray(quiz.questions) ? quiz.questions.length : 0} vprašanj</p>
                    </div>
                    <Badge variant="outline">Kviz</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Ni kvizov v tem tečaju</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Zapri
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}