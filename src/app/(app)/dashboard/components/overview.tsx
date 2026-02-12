
'use client';

import { BarChart, Book, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { WithId, SavedStudyPlan, QuizResult } from "@/lib/types";
import { useLanguage } from "@/context/language-context";

export function Overview({ studyPlans, quizResults }: { studyPlans: WithId<SavedStudyPlan>[], quizResults: WithId<QuizResult>[] }) {
  const { language } = useLanguage();

  const totalPlans = studyPlans.length;
  const averageScore = quizResults.length > 0
    ? quizResults.reduce((acc, result) => acc + result.score, 0) / quizResults.length
    : 0;

  const chartData = quizResults
    .slice(0, 7) // Get the last 7 quizzes
    .reverse() // so the latest is on the right
    .map((result, index) => ({
      name: `${language === 'fr' ? 'Quiz' : 'Quiz'} ${index + 1}`,
      score: result.score,
      subject: result.planSubject,
    }));
    
  const t = {
    fr: {
      totalPlans: "Plans d'Étude",
      avgScore: "Score Moyen",
      recentScores: "Scores Récents",
      noQuizData: "Aucune donnée de quiz disponible pour afficher le graphique.",
      score: "Score"
    },
    en: {
      totalPlans: "Study Plans",
      avgScore: "Average Score",
      recentScores: "Recent Scores",
      noQuizData: "No quiz data available to display chart.",
      score: "Score"
    }
  }[language];
  
  const chartConfig = {
    score: {
      label: t.score,
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.totalPlans}</CardTitle>
          <Book className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPlans}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.avgScore}</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageScore.toFixed(0)}%</div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-md">
            <BarChart className="h-5 w-5" />
            {t.recentScores}
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[150px] w-full">
              <RechartsBarChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                  className="text-xs"
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    labelKey="subject"
                    indicator="dot"
                  />}
                />
                <Bar
                  dataKey="score"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ChartContainer>
          ) : (
             <div className="h-[150px] flex items-center justify-center text-sm text-muted-foreground">
                {t.noQuizData}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
