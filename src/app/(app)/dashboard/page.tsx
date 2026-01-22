'use client';

import { collection, doc, DocumentData, query, where } from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentDashboard } from './components/student-dashboard';
import { TutorDashboard } from './components/tutor-dashboard';
import { useLanguage } from '@/context/language-context';
import type { UserProfile, SavedStudyPlan, QuizResult, FollowingRecord } from '@/lib/types';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { language } = useLanguage();

  const content = {
    fr: {
      loading: 'Chargement du tableau de bord...',
      notStudentOrTutor: 'Rôle utilisateur non défini. Impossible d\'afficher le tableau de bord.',
      errorLoading: 'Impossible de charger le profil utilisateur.',
    },
    en: {
      loading: 'Loading dashboard...',
      notStudentOrTutor: 'User role not set. Cannot display dashboard.',
      errorLoading: 'Failed to load user profile.',
    }
  };
  const t = content[language];

  // Memoize the document reference to prevent re-renders
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const studyPlansRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'studyPlans') : null),
    [firestore, user?.uid]
  );
  
  const quizResultsRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'quizResults') : null),
    [firestore, user?.uid]
  );

  const followedTutorsRef = useMemoFirebase(
    () => user ? collection(firestore, 'users', user.uid, 'following') : null,
    [firestore, user?.uid]
  );

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error,
  } = useDoc<UserProfile>(userProfileRef);

  const { data: studyPlans, isLoading: arePlansLoading } = useCollection<SavedStudyPlan>(studyPlansRef);
  const { data: quizResults, isLoading: areResultsLoading } = useCollection<QuizResult>(quizResultsRef);
  const { data: followedTutors, isLoading: areTutorsLoading } = useCollection<FollowingRecord>(followedTutorsRef);
  
  const isLoading = isUserLoading || isProfileLoading || arePlansLoading || areResultsLoading || areTutorsLoading;

  // Show a loading state while fetching user or profile data
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
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-80 xl:col-span-2" />
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


  // Render the appropriate dashboard based on the user's role
  switch (userProfile?.role) {
    case 'tutor':
      return <TutorDashboard />;
    
    case 'student':
    case 'admin':
      return <StudentDashboard studyPlans={studyPlans} quizResults={quizResults} followedTutors={followedTutors} />;

    default:
      // This handles cases where `userProfile` is null, or `role` is not set.
      // This defaults to the student dashboard as a safe fallback for new users.
      return <StudentDashboard studyPlans={studyPlans} quizResults={quizResults} followedTutors={followedTutors} />;
  }
}
