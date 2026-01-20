'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';

const data = [
  { name: 'Mon', total: Math.floor(Math.random() * 120) + 30 },
  { name: 'Tue', total: Math.floor(Math.random() * 120) + 30 },
  { name: 'Wed', total: Math.floor(Math.random() * 120) + 30 },
  { name: 'Thu', total: Math.floor(Math.random() * 120) + 30 },
  { name: 'Fri', total: Math.floor(Math.random() * 120) + 30 },
  { name: 'Sat', total: Math.floor(Math.random() * 120) + 30 },
  { name: 'Sun', total: Math.floor(Math.random() * 120) + 30 },
];

const chartConfig = {
  total: {
    label: "Minutes",
    color: "hsl(var(--primary))",
  },
};

export function RecentActivityChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
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
    </ChartContainer>
  );
}
