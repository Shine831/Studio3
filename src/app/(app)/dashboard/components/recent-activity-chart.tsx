
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { ArrowRight, ListChecks, Book, Calendar, Percent } from 'lucide-react';

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
  
  if (quizResults.length === 0) {
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
                 <p className="text-sm text-muted-foreground text-center py-8">{t.noResults}</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 md:p-6 md:pt-0">
        {/* Desktop Table View */}
        <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>{t.subject}</TableHead>
                <TableHead>{t.lesson}</TableHead>
                <TableHead>{t.score}</TableHead>
                <TableHead>{t.date}</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.planSubject}</TableCell>
                  <TableCell>{result.lessonTitle}</TableCell>
                  <TableCell>{result.score.toFixed(0)}%</TableCell>
                  <TableCell>
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

        {/* Mobile Card View */}
        <div className="grid gap-4 p-4 md:hidden">
            {quizResults.map((result) => (
                <Card key={result.id} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                             <CardTitle className="text-base">{result.lessonTitle}</CardTitle>
                             <div className="flex items-center gap-1 font-bold text-lg text-primary">
                                <span>{result.score.toFixed(0)}</span><Percent className="h-4 w-4" />
                             </div>
                        </div>
                        <CardDescription className="flex items-center gap-2 pt-1">
                             <Book className="h-3 w-3" /> {result.planSubject}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                             <Calendar className="h-3 w-3" />
                             {result.completionDate?.toDate ? format(result.completionDate.toDate(), 'PP', { locale: language === 'fr' ? fr : enUS }) : 'N/A'}
                        </p>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="secondary" size="sm" className="w-full">
                            <Link href={`/study-plan/${result.planId}`}>
                                {t.viewPlan} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
