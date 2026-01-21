'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';
import { CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import type { QuizResult } from '@/lib/types';
import { useMemo } from 'react';
import { subDays, format, isWithinInterval } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';


const chartConfig = {
  quizzes: {
    label: "Quizzes",
    color: "hsl(var(--primary))",
  },
};

interface RecentActivityChartProps {
    quizResults: QuizResult[] | null;
}

export function RecentActivityChart({ quizResults }: RecentActivityChartProps) {
  const { language } = useLanguage();

  const t = {
    fr: {
      noActivity: 'Aucune activité récente.',
      studyTimeAppear: 'Vos quiz terminés apparaîtront ici.',
      quizzes: 'Quiz terminés',
    },
    en: {
      noActivity: 'No recent activity.',
      studyTimeAppear: 'Your completed quizzes will appear here.',
      quizzes: 'Quizzes Completed',
    }
  }[language];
  
  chartConfig.quizzes.label = t.quizzes;
  
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    const locale = language === 'fr' ? fr : enUS;

    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dayName = format(date, 'eee', { locale });
        
        const quizzesOnDay = quizResults?.filter(result => {
            const completionDate = result.completionDate?.toDate();
            return completionDate && isWithinInterval(completionDate, { start: date, end: date });
        }).length || 0;

        data.push({ name: dayName, quizzes: quizzesOnDay });
    }
    return data;
  }, [quizResults, language]);

  const totalQuizzes = useMemo(() => chartData.reduce((acc, item) => acc + item.quizzes, 0), [chartData]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      {totalQuizzes > 0 ? (
        <BarChart accessibilityLayer data={chartData}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={(value) => `${value}`}
          />
          <ChartTooltip 
            cursor={false} 
            content={<ChartTooltipContent indicator="dot" />} 
          />
          <Bar dataKey="quizzes" fill="var(--color-quizzes)" radius={4} />
        </BarChart>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <p className="text-muted-foreground">{t.noActivity}</p>
            <CardDescription>{t.studyTimeAppear}</CardDescription>
        </div>
      )}
    </ChartContainer>
  );
}
