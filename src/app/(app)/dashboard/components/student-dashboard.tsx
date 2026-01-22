'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Overview } from './overview';
import { RecentActivityChart } from './recent-activity-chart';
import { useLanguage } from '@/context/language-context';
import type {
  SavedStudyPlan,
  QuizResult,
} from '@/lib/types';


interface StudentDashboardProps {
  studyPlans: SavedStudyPlan[] | null;
  quizResults: QuizResult[] | null;
}

export function StudentDashboard({
  studyPlans,
  quizResults,
}: StudentDashboardProps) {
  const { language } = useLanguage();
  
  const content = {
    fr: {
      dashboard: 'Tableau de bord',
      recentActivity: 'Activité récente',
      activityDescription: 'Vos quiz terminés des 7 derniers jours.',
    },
    en: {
      dashboard: 'Dashboard',
      recentActivity: 'Recent Activity',
      activityDescription: 'Your completed quizzes over the last 7 days.',
    },
  };
  const t = content[language];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">{t.dashboard}</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Overview studyPlans={studyPlans} quizResults={quizResults} />
      </div>
      <div className="grid gap-4 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t.recentActivity}</CardTitle>
            <CardDescription>{t.activityDescription}</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RecentActivityChart quizResults={quizResults} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
