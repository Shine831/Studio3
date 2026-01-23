'use client';

import { doc, collection, query } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentDashboard } from './components/student-dashboard';
import { TutorDashboard } from './components/tutor-dashboard';
import { useLanguage } from '@/context/language-context';
import type { UserProfile, SavedStudyPlan, QuizResult } from '@/lib/types';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { language } = useLanguage();

  const content = {
    fr: {
      loading: 'Chargement du tableau de bord...',
      errorLoading: 'Impossible de charger le profil utilisateur.',
    },
    en: {
      loading: 'Loading dashboard...',
      errorLoading: 'Failed to load user profile.',
    }
  };
  const t = content[language];

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error,
  } = useDoc<UserProfile>(userProfileRef);

  // Student data
  const studyPlansRef = useMemoFirebase(
    () => (user && userProfile?.role === 'student' ? query(collection(firestore, 'users', user.uid, 'studyPlans')) : null),
    [firestore, user, userProfile?.role]
  );
  const { data: studyPlans, isLoading: arePlansLoading } = useCollection<SavedStudyPlan>(studyPlansRef);

  const quizResultsRef = useMemoFirebase(
    () => (user && userProfile?.role === 'student' ? query(collection(firestore, 'users', user.uid, 'quizResults')) : null),
    [firestore, user, userProfile?.role]
  );
  const { data: quizResults, isLoading: areResultsLoading } = useCollection<QuizResult>(quizResultsRef);

  const isLoading = isUserLoading || isProfileLoading || arePlansLoading || areResultsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <div className="grid gap-4 md:gap-8">
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }
  
  if (error) {
    console.error("Error fetching user profile:", error);
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-destructive">{t.errorLoading}</p>
        </div>
    )
  }

  if (userProfile?.role === 'tutor') {
    return <TutorDashboard />;
  }
  
  return <StudentDashboard studyPlans={studyPlans} quizResults={quizResults} />;
}
