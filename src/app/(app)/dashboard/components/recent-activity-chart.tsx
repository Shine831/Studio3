'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';
import { CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';

const data = [
  { name: 'Mon', total: 0 },
  { name: 'Tue', total: 0 },
  { name: 'Wed', total: 0 },
  { name: 'Thu', total: 0 },
  { name: 'Fri', total: 0 },
  { name: 'Sat', total: 0 },
  { name: 'Sun', total: 0 },
];

const chartConfig = {
  total: {
    label: "Minutes",
    color: "hsl(var(--primary))",
  },
};

export function RecentActivityChart() {
  const { language } = useLanguage();

  const content = {
    fr: {
      noActivity: 'Aucune activité pour le moment.',
      studyTimeAppear: 'Votre temps d\'étude apparaîtra ici.',
      days: { Mon: 'Lun', Tue: 'Mar', Wed: 'Mer', Thu: 'Jeu', Fri: 'Ven', Sat: 'Sam', Sun: 'Dim' },
      minutes: 'Minutes'
    },
    en: {
      noActivity: 'No activity yet.',
      studyTimeAppear: 'Your study time will appear here.',
      days: { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun' },
      minutes: 'Minutes'
    }
  };

  const t = content[language];
  const translatedData = data.map(d => ({ ...d, name: t.days[d.name as keyof typeof t.days] }));
  chartConfig.total.label = t.minutes;

  const totalMinutes = translatedData.reduce((acc, item) => acc + item.total, 0);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      {totalMinutes > 0 ? (
        <BarChart accessibilityLayer data={translatedData}>
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
            tickFormatter={(value) => `${value}m`}
          />
          <ChartTooltip 
            cursor={false} 
            content={<ChartTooltipContent indicator="dot" />} 
          />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} />
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
