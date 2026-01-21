import Image from 'next/image';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={{
        pathname: `/courses/${course.id}`,
        query: {
          title: course.title,
          subject: course.subject,
          level: course.level,
          language: course.language,
          description: course.description,
          lessonsCount: course.lessonsCount,
        },
      }}
    >
      <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
              data-ai-hint={course.imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Badge variant="secondary" className="mb-2">{course.subject}</Badge>
          <CardTitle className="text-lg font-headline mb-2 leading-tight">
            {course.title}
          </CardTitle>
          <CardDescription className="text-sm">
            {course.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessonsCount} lessons</span>
          </div>
          <div className="flex gap-1">
            <Badge variant="outline">{course.level}</Badge>
            <Badge variant="outline">{course.language.toUpperCase()}</Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
