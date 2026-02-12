
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { QuizResult, WithId } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { ArrowRight, ListChecks } from 'lucide-react';

export function RecentQuizzes({ quizResults }: { quizResults: WithId<QuizResult>[] }) {
  const { language } = useLanguage();

  const t = {
    fr: {
      title: "Quiz Récents",
      description: "Vos derniers résultats de quiz. Continuez comme ça !",
      noResults: "Vous n'avez pas encore terminé de quiz.",
      subject: "Matière",
      lesson: "Leçon",
      score: "Score",
      date: "Date",
      viewPlan: "Voir le Plan",
    },
    en: {
      title: "Recent Quizzes",
      description: "Your latest quiz results. Keep up the great work!",
      noResults: "You haven't completed any quizzes yet.",
      subject: "Subject",
      lesson: "Lesson",
      score: "Score",
      date: "Date",
      viewPlan: "View Plan",
    }
  }[language];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {quizResults.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.subject}</TableHead>
                <TableHead>{t.lesson}</TableHead>
                <TableHead className="text-right">{t.score}</TableHead>
                <TableHead className="text-right">{t.date}</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.planSubject}</TableCell>
                  <TableCell>{result.lessonTitle}</TableCell>
                  <TableCell className="text-right">{result.score.toFixed(0)}%</TableCell>
                  <TableCell className="text-right">
                    {result.completionDate?.toDate ? format(result.completionDate.toDate(), 'PP', { locale: language === 'fr' ? fr : enUS }) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                          <Link href={`/study-plan/${result.planId}`}>
                              {t.viewPlan} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">{t.noResults}</p>
        )}
      </CardContent>
    </Card>
  );
}
