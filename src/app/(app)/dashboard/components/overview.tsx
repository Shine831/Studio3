'use client';

import { BookCheck, Brain, Clock, Medal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/language-context';
import type { SavedStudyPlan, QuizResult } from '@/lib/types';
import { useMemo } from 'react';

interface OverviewProps {
  studyPlans: SavedStudyPlan[] | null;
  quizResults: QuizResult[] | null;
}

export function Overview({ studyPlans, quizResults }: OverviewProps) {
  const { language } = useLanguage();

  const t = {
    fr: {
      coursesInProgress: 'Plans d\'étude',
      startCourse: 'Créez un plan pour débuter',
      averageScore: 'Score moyen',
      completeQuizzes: 'Terminez des quiz pour voir votre score',
      totalStudyTime: 'Temps d\'étude estimé',
      thisMonth: 'Ce mois-ci',
      quizzesPassed: 'Quiz réussis',
      passRate: 'taux de réussite',
      hours: 'h',
      minutes: 'm',
    },
    en: {
      coursesInProgress: 'Study Plans',
      startCourse: 'Create a plan to begin',
      averageScore: 'Average Score',
      completeQuizzes: 'Complete quizzes to see your score',
      totalStudyTime: 'Estimated Study Time',
      thisMonth: 'This month',
      quizzesPassed: 'Quizzes Passed',
      passRate: 'pass rate',
      hours: 'h',
      minutes: 'm',
    }
  }[language];

  const calculatedStats = useMemo(() => {
    const coursesInProgress = studyPlans?.length || 0;

    const totalScore = quizResults?.reduce((acc, result) => acc + result.score, 0) || 0;
    const averageScore = quizResults && quizResults.length > 0 ? totalScore / quizResults.length : 0;

    const totalMinutes = studyPlans?.reduce((total, plan) => {
        return total + (plan.lessons?.reduce((planTotal, lesson) => planTotal + (lesson.duration || 0), 0) || 0);
    }, 0) || 0;
    const studyHours = Math.floor(totalMinutes / 60);
    const studyMinutes = totalMinutes % 60;
    const totalStudyTime = `${studyHours}${t.hours} ${studyMinutes}${t.minutes}`;
    
    const passedQuizzes = quizResults?.filter(result => result.score >= 50).length || 0;
    const passRate = quizResults && quizResults.length > 0 ? (passedQuizzes / quizResults.length) * 100 : 0;

    return {
      coursesInProgress,
      averageScore,
      totalStudyTime,
      passedQuizzes,
      passRate
    };
  }, [studyPlans, quizResults, t.hours, t.minutes]);

  const stats = [
    {
      icon: <BookCheck className="h-4 w-4 text-muted-foreground" />,
      title: t.coursesInProgress,
      value: calculatedStats.coursesInProgress.toString(),
      description: calculatedStats.coursesInProgress === 0 ? t.startCourse : '',
    },
    {
      icon: <Medal className="h-4 w-4 text-muted-foreground" />,
      title: t.averageScore,
      value: calculatedStats.averageScore > 0 ? `${calculatedStats.averageScore.toFixed(0)}%` : 'N/A',
      description: calculatedStats.averageScore === 0 ? t.completeQuizzes : '',
      progress: calculatedStats.averageScore,
    },
    {
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      title: t.totalStudyTime,
      value: calculatedStats.totalStudyTime,
      description: '',
    },
    {
      icon: <Brain className="h-4 w-4 text-muted-foreground" />,
      title: t.quizzesPassed,
      value: calculatedStats.passedQuizzes.toString(),
      description: `${calculatedStats.passRate.toFixed(0)}% ${t.passRate}`,
      progress: calculatedStats.passRate
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            {stat.progress !== undefined && stat.progress > 0 && <Progress value={stat.progress} className="mt-4 h-2" />}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
