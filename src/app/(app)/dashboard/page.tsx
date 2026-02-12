
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import type { UserProfile, SavedStudyPlan, QuizResult, WithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Overview } from './components/overview';
import { RecentQuizzes } from './components/recent-activity-chart';
import { RoleGuard } from '@/components/role-guard';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { language } = useLanguage();

  // Data fetching
  const studyPlansRef = useMemo(
    () => (user ? collection(firestore, 'users', user.uid, 'studyPlans') : null),
    [firestore, user]
  );
  const { data: studyPlans, isLoading: arePlansLoading, error: plansError } = useCollection<SavedStudyPlan>(studyPlansRef);

  const quizResultsRef = useMemo(
    () => (user ? query(collection(firestore, 'users', user.uid, 'quizResults'), orderBy('completionDate', 'desc'), limit(10)) : null),
    [firestore, user]
  );
  const { data: quizResults, isLoading: areResultsLoading, error: resultsError } = useCollection<QuizResult>(quizResultsRef);
  
  const content = {
    fr: {
      welcome: "Bon retour",
      dashboard: "Tableau de Bord",
      description: "Voici un aperçu de votre progression et de vos activités récentes.",
      loadingError: "Erreur de chargement",
      loadingErrorDesc: "Nous n'avons pas pu charger les données de votre tableau de bord.",
    },
    en: {
      welcome: "Welcome back",
      dashboard: "Dashboard",
      description: "Here's an overview of your progress and recent activities.",
      loadingError: "Loading Error",
      loadingErrorDesc: "We couldn't load your dashboard data.",
    },
  };

  const t = content[language];
  const isLoading = isUserLoading || arePlansLoading || areResultsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const error = plansError || resultsError;

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t.loadingError}</AlertTitle>
            <AlertDescription>{t.loadingErrorDesc}</AlertDescription>
        </Alert>
    );
  }

  return (
    <RoleGuard allowedRoles={['student', 'admin']}>
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">
                    {t.welcome}, {user?.displayName?.split(' ')[0] || 'Student'}!
                </h1>
                <p className="text-muted-foreground">{t.description}</p>
            </div>
            <Overview studyPlans={studyPlans || []} quizResults={quizResults || []} />
            <RecentQuizzes quizResults={quizResults || []} />
        </div>
    </RoleGuard>
  );
}
