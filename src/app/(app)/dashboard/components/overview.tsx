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

export function Overview() {
  const { language } = useLanguage();

  const content = {
    fr: {
      coursesInProgress: 'Cours en cours',
      startCourse: 'Commencez un cours pour débuter',
      averageScore: 'Score moyen',
      completeQuizzes: 'Terminez des quiz pour voir votre score',
      totalStudyTime: 'Temps d\'étude total',
      thisMonth: 'Ce mois-ci',
      quizzesPassed: 'Quiz réussis',
      passRate: 'taux de réussite',
    },
    en: {
      coursesInProgress: 'Courses in Progress',
      startCourse: 'Start a course to begin',
      averageScore: 'Average Score',
      completeQuizzes: 'Complete quizzes to see your score',
      totalStudyTime: 'Total Study Time',
      thisMonth: 'This month',
      quizzesPassed: 'Quizzes Passed',
      passRate: 'pass rate',
    }
  };

  const t = content[language];

  const stats = [
    {
      icon: <BookCheck className="h-4 w-4 text-muted-foreground" />,
      title: t.coursesInProgress,
      value: '0',
      description: t.startCourse,
    },
    {
      icon: <Medal className="h-4 w-4 text-muted-foreground" />,
      title: t.averageScore,
      value: 'N/A',
      description: t.completeQuizzes,
      progress: 0,
    },
    {
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      title: t.totalStudyTime,
      value: '0h 0m',
      description: t.thisMonth,
    },
    {
      icon: <Brain className="h-4 w-4 text-muted-foreground" />,
      title: t.quizzesPassed,
      value: '0',
      description: `0% ${t.passRate}`,
      progress: 0
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
            {stat.progress !== undefined && <Progress value={stat.progress} className="mt-4 h-2" />}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
