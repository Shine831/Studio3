import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TutorCard } from '@/components/tutor-card';
import { tutors } from '@/lib/data';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function TutorsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Find a Tutor</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="verified-only" />
            <Label htmlFor="verified-only">Verified Only</Label>
          </div>
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
        {tutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
    </div>
  );
}
