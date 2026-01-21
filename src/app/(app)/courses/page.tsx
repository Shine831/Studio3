'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CourseCard } from '@/components/course-card';
import { courses } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

export default function CoursesPage() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: 'Cours',
      filterLevel: 'Filtrer par niveau',
      filterSubject: 'Filtrer par matière',
      subjects: {
        math: 'Mathématiques',
        physics: 'Physique',
        chemistry: 'Chimie',
        biology: 'Biologie',
      }
    },
    en: {
      title: 'Courses',
      filterLevel: 'Filter by Level',
      filterSubject: 'Filter by Subject',
      subjects: {
        math: 'Mathematics',
        physics: 'Physics',
        chemistry: 'Chemistry',
        biology: 'Biology',
      }
    }
  };

  const t = content[language];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <div className="flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder={t.filterLevel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconde">Seconde</SelectItem>
              <SelectItem value="premiere">Première</SelectItem>
              <SelectItem value="terminale">Terminale</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder={t.filterSubject} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="math">{t.subjects.math}</SelectItem>
              <SelectItem value="physics">{t.subjects.physics}</SelectItem>
              <SelectItem value="chemistry">{t.subjects.chemistry}</SelectItem>
              <SelectItem value="biology">{t.subjects.biology}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
