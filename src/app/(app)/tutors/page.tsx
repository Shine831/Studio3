'use client';

import { useState, useMemo } from 'react';
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
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');

  const content = {
    fr: {
      title: 'Trouver un répétiteur',
      verifiedOnly: 'Vérifié seulement',
      filterSubject: 'Filtrer par matière',
      allSubjects: 'Toutes les matières',
    },
    en: {
      title: 'Find a Tutor',
      verifiedOnly: 'Verified Only',
      filterSubject: 'Filter by Subject',
      allSubjects: 'All Subjects',
    },
  };

  const t = content[language];

  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    tutors.forEach((tutor) => {
      tutor.subjects.forEach((subject) => {
        subjects.add(subject);
      });
    });
    return Array.from(subjects).sort();
  }, []);

  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      const isVerifiedMatch = !verifiedOnly || tutor.verified;
      const isSubjectMatch =
        !selectedSubject || tutor.subjects.includes(selectedSubject);
      return isVerifiedMatch && isSubjectMatch;
    });
  }, [verifiedOnly, selectedSubject]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="verified-only"
              checked={verifiedOnly}
              onCheckedChange={setVerifiedOnly}
            />
            <Label htmlFor="verified-only">{t.verifiedOnly}</Label>
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder={t.filterSubject} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t.allSubjects}</SelectItem>
              {allSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
    </div>
  );
}
