'use client';

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
import { useLanguage } from '@/context/language-context';

export default function TutorsPage() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: 'Trouver un répétiteur',
      verifiedOnly: 'Vérifié seulement',
      filterSubject: 'Filtrer par matière',
      subjects: {
        math: 'Mathématiques',
        physics: 'Physique',
        chemistry: 'Chimie',
        biology: 'Biologie',
      }
    },
    en: {
      title: 'Find a Tutor',
      verifiedOnly: 'Verified Only',
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
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="verified-only" />
            <Label htmlFor="verified-only">{t.verifiedOnly}</Label>
          </div>
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
        {tutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
    </div>
  );
}
