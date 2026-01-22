
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
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { TutorProfile, WithId, UserProfile, FollowingRecord } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function TutorsPage() {
  const { language } = useLanguage();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [followingOnly, setFollowingOnly] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const firestore = useFirestore();
  const { user } = useUser();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const tutorsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'tutors')) : null),
    [firestore]
  );
  const { data: tutorsData, isLoading: isLoadingTutors } = useCollection<TutorProfile>(tutorsQuery);

  const followingQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'following') : null),
    [firestore, user]
  );
  const { data: following, isLoading: isLoadingFollowing } = useCollection<FollowingRecord>(followingQuery);

  const isLoading = isLoadingTutors || isLoadingFollowing;


  const content = {
    fr: {
      title: 'Trouver un répétiteur',
      verifiedOnly: 'Vérifié seulement',
      followingOnly: 'Suivis seulement',
      filterSubject: 'Filtrer par matière',
      allSubjects: 'Toutes les matières',
    },
    en: {
      title: 'Find a Tutor',
      verifiedOnly: 'Verified Only',
      followingOnly: 'Following Only',
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

    const followedTutorIds = new Set(following?.map(f => f.id) || []);

    return tutorsData.filter((tutor) => {
      const isVerifiedMatch = !verifiedOnly || tutor.adminVerified || (tutor.followersCount && tutor.followersCount >= 20);
      const isSubjectMatch =
        selectedSubject === 'all' || tutor.subjects.includes(selectedSubject);
      
      const isFollowingMatch = !followingOnly || followedTutorIds.has(tutor.id);
      
      let isSystemMatch = true;
      if (userProfile?.system) {
        if (userProfile.system === 'francophone') {
            isSystemMatch = tutor.system === 'francophone' || tutor.system === 'both';
        } else if (userProfile.system === 'anglophone') {
            isSystemMatch = tutor.system === 'anglophone' || tutor.system === 'both';
        }
      }
      
      return isVerifiedMatch && isSubjectMatch && isSystemMatch && isFollowingMatch;
    });
  }, [verifiedOnly, selectedSubject, tutorsData, userProfile, followingOnly, following]);

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
           {userProfile?.role !== 'tutor' && (
             <div className="flex items-center space-x-2">
                <Switch
                  id="following-only"
                  checked={followingOnly}
                  onCheckedChange={setFollowingOnly}
                />
                <Label htmlFor="following-only">{t.followingOnly}</Label>
             </div>
            )}
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
