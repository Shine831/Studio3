import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CourseCard } from '@/components/course-card';
import { courses } from '@/lib/data';

export default function CoursesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Courses</h1>
        <div className="flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Filter by Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconde">Seconde</SelectItem>
              <SelectItem value="premiere">Première</SelectItem>
              <SelectItem value="terminale">Terminale</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Filter by Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="biology">Biology</SelectItem>
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
