'use client';

import { doc, DocumentData } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentDashboard } from './components/student-dashboard';
import { TutorDashboard } from './components/tutor-dashboard';
import { useLanguage } from '@/context/language-context';

// Define a type for the user profile for better type safety
interface UserProfile {
  role?: 'student' | 'tutor' | 'admin';
  // Add other profile fields as needed
}

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

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error,
  } = useDoc<UserProfile & DocumentData>(userProfileRef);

  // Show a loading state while fetching user or profile data
  if (isUserLoading || isProfileLoading) {
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
      return <StudentDashboard />;

    default:
      // This handles cases where `userProfile` is null, or `role` is not set.
      // This defaults to the student dashboard as a safe fallback for new users.
      return <StudentDashboard />;
  }
}
