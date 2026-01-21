'use client';

import { useState, useEffect } from 'react';
import {
  generateCourseList,
} from '@/ai/flows/generate-course-list';
import { useLanguage } from '@/context/language-context';
import type { Course } from '@/lib/types';
import { placeholderImages } from '@/lib/data';
import { CourseCard } from '@/components/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const subjectImageMap: { [key: string]: (typeof placeholderImages)[0] } = {
  Mathematics: placeholderImages.find(p => p.id === 'math-course')!,
  Mathématiques: placeholderImages.find(p => p.id === 'math-course')!,
  Physics: placeholderImages.find(p => p.id === 'physics-course')!,
  Physique: placeholderImages.find(p => p.id === 'physics-course')!,
  Chemistry: placeholderImages.find(p => p.id === 'chemistry-course')!,
  Chimie: placeholderImages.find(p => p.id === 'chemistry-course')!,
  Biology: placeholderImages.find(p => p.id === 'biology-course')!,
  Biologie: placeholderImages.find(p => p.id === 'biology-course')!,
};
const defaultImage = placeholderImages[0];


export default function CoursesPage() {
  const { language } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const content = {
    fr: {
      title: 'Explorer les Cours',
      description: 'Découvrez une sélection de cours uniques, actualisée à chaque visite.',
      loading: 'Génération de nouveaux cours...',
      errorTitle: 'Oups ! Quelque chose s\'est mal passé',
      errorDescription: 'Nous n\'avons pas pu générer de nouveaux cours pour le moment. Veuillez réessayer.',
      retry: 'Réessayer',
    },
    en: {
      title: 'Explore Courses',
      description: 'Discover a unique selection of courses, refreshed on every visit.',
      loading: 'Generating new courses...',
      errorTitle: 'Oops! Something went wrong',
      errorDescription: 'We couldn\'t generate new courses right now. Please try again.',
      retry: 'Retry',
    },
  };

  const t = content[language];

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateCourseList({ language, count: 6 });
      if (result && result.courses) {
        const coursesWithImages: Course[] = result.courses.map(course => {
          const imageInfo = subjectImageMap[course.subject] || defaultImage;
          return {
            ...course,
            imageUrl: imageInfo.imageUrl,
            imageHint: imageInfo.imageHint,
          };
        });
        setCourses(coursesWithImages);
      } else {
        throw new Error('Failed to generate courses.');
      }
    } catch (e) {
      console.error(e);
      setError(t.errorDescription);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]); // Fetch new courses if language changes

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
            <p className="text-muted-foreground">{t.description}</p>
        </div>
      </div>
      
      {isLoading && (
        <>
            <p className="text-center text-muted-foreground">{t.loading}</p>
            <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[192px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </>
      )}

      {error && !isLoading && (
        <Alert variant="destructive" className="max-w-md mx-auto">
            <Frown className="h-4 w-4" />
            <AlertTitle>{t.errorTitle}</AlertTitle>
            <AlertDescription>
                {error}
                <Button onClick={fetchCourses} variant="link" className="p-0 h-auto mt-2">
                    {t.retry}
                </Button>
            </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
