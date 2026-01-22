'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { Overview } from './overview';
import { RecentActivityChart } from './recent-activity-chart';
import type { SavedStudyPlan, QuizResult, WithId } from '@/lib/types';
import { BookCopy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface StudentDashboardProps {
  studyPlans: SavedStudyPlan[] | null;
  quizResults: QuizResult[] | null;
}

export function StudentDashboard({ studyPlans, quizResults }: StudentDashboardProps) {
  const { language } = useLanguage();
  
  const content = {
    fr: {
      title: 'Tableau de bord de l\'élève',
      description: "Voici un résumé de votre activité et de votre progression.",
      overview: 'Aperçu',
      recentActivity: 'Activité récente',
      myStudyPlans: 'Mes Plans d\'Étude',
      viewAll: 'Voir tout',
      noPlans: 'Aucun plan d\'étude pour le moment.',
      createOne: 'Créez-en un !'
    },
    en: {
      title: 'Student Dashboard',
      description: "Here's a summary of your activity and progress.",
      overview: 'Overview',
      recentActivity: 'Recent Activity',
      myStudyPlans: 'My Study Plans',
      viewAll: 'View all',
      noPlans: 'No study plans yet.',
      createOne: 'Create one!'
    },
  };
  const t = content[language];
  
  const recentPlans = studyPlans?.slice(0, 3) || [];

  return (
    <div className="flex flex-1 flex-col gap-6">
       <div>
            <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
            <p className="text-muted-foreground">{t.description}</p>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Overview studyPlans={studyPlans} quizResults={quizResults} />
      </div>
       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
              <CardTitle>{t.recentActivity}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RecentActivityChart quizResults={quizResults} />
            </CardContent>
          </Card>
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {t.myStudyPlans}
                <Link href="/study-plan" className="text-sm font-normal text-primary hover:underline">
                    {t.viewAll} <ArrowRight className="inline h-4 w-4" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPlans.length > 0 ? (
                <div className="space-y-4">
                    {recentPlans.map(plan => (
                        <Link href={`/study-plan/${(plan as WithId<SavedStudyPlan>).id}`} key={(plan as WithId<SavedStudyPlan>).id}>
                            <div className="flex items-center p-2 rounded-md hover:bg-muted transition-colors">
                                <BookCopy className="mr-4 h-5 w-5 text-primary" />
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">{plan.subject}</p>
                                    <p className="text-sm text-muted-foreground">{plan.learningGoals}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>{t.noPlans}</p>
                  <Button variant="link" asChild><Link href="/study-plan">{t.createOne}</Link></Button>
                </div>
              )}
            </CardContent>
          </Card>
       </div>
    </div>
  );
}
