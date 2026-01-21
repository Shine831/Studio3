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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/language-context';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { TutorProfile, WithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function TutorsPage() {
  const { language } = useLanguage();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const firestore = useFirestore();

  const tutorsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'tutors')) : null),
    [firestore]
  );
  const { data: tutorsData, isLoading } = useCollection<TutorProfile>(tutorsQuery);


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
    if (!tutorsData) return [];
    const subjects = new Set<string>();
    tutorsData.forEach((tutor) => {
      tutor.subjects.forEach((subject) => {
        subjects.add(subject);
      });
    });
    return Array.from(subjects).sort();
  }, [tutorsData]);

  const filteredTutors = useMemo(() => {
    if (!tutorsData) return [];
    return tutorsData.filter((tutor) => {
      const isVerifiedMatch = !verifiedOnly || tutor.adminVerified;
      const isSubjectMatch =
        selectedSubject === 'all' || tutor.subjects.includes(selectedSubject);
      return isVerifiedMatch && isSubjectMatch;
    });
  }, [verifiedOnly, selectedSubject, tutorsData]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
        <div className="flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="verified-only"
              checked={verifiedOnly}
              onCheckedChange={setVerifiedOnly}
            />
            <Label htmlFor="verified-only">{t.verifiedOnly}</Label>
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[220px] bg-card">
              <SelectValue placeholder={t.filterSubject} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allSubjects}</SelectItem>
              {allSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-56 w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );
}
