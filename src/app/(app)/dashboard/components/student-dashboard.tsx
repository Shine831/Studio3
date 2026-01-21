'use client';

import Link from 'next/link';
import { ArrowUpRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Overview } from './overview';
import { RecentActivityChart } from './recent-activity-chart';
import { useLanguage } from '@/context/language-context';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { SavedStudyPlan, QuizResult, FollowingRecord } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}


interface StudentDashboardProps {
  studyPlans: SavedStudyPlan[] | null;
  quizResults: QuizResult[] | null;
}

export function StudentDashboard({ studyPlans, quizResults }: StudentDashboardProps) {
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();

  const followedTutorsRef = useMemoFirebase(
    () => user ? collection(firestore, 'users', user.uid, 'following') : null,
    [firestore, user]
  );
  const { data: followedTutors, isLoading: areTutorsLoading } = useCollection<FollowingRecord>(followedTutorsRef);


  const content = {
    fr: {
      dashboard: 'Tableau de bord',
      recentActivity: 'Activité récente',
      activityDescription: 'Vos quiz terminés des 7 derniers jours.',
      myTutors: 'Mes Répétiteurs',
      tutorsDescription: 'Les répétiteurs que vous suivez.',
      viewAll: 'Voir tout',
      noTutors: 'Vous ne suivez aucun répétiteur.',
      browseTutors: 'Trouver des répétiteurs',
    },
    en: {
      dashboard: 'Dashboard',
      recentActivity: 'Recent Activity',
      activityDescription: 'Your completed quizzes over the last 7 days.',
      myTutors: 'My Tutors',
      tutorsDescription: 'The tutors you are following.',
      viewAll: 'View all',
      noTutors: 'You are not following any tutors.',
      browseTutors: 'Browse Tutors',
    }
  };
  const t = content[language];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">{t.dashboard}</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Overview studyPlans={studyPlans} quizResults={quizResults} />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t.recentActivity}</CardTitle>
            <CardDescription>
              {t.activityDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RecentActivityChart quizResults={quizResults} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>{t.myTutors}</CardTitle>
              <CardDescription>
                {t.tutorsDescription}
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/tutors">
                {t.viewAll}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            {areTutorsLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : followedTutors && followedTutors.length > 0 ? (
                followedTutors.map(tutor => (
                    <Link href={`/tutors/${tutor.tutorId}`} key={tutor.tutorId} className="flex items-center gap-4 hover:bg-accent p-2 rounded-md transition-colors">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={tutor.tutorAvatar} />
                            <AvatarFallback>{getInitials(tutor.tutorName)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{tutor.tutorName}</p>
                        </div>
                    </Link>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-4 h-full">
                    <Users className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">{t.noTutors}</p>
                    <Button variant="link" asChild className="mt-1">
                      <Link href="/tutors">{t.browseTutors}</Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    