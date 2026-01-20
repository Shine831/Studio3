import { BookCheck, Brain, Clock, Medal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function Overview() {
  const stats = [
    {
      icon: <BookCheck className="h-4 w-4 text-muted-foreground" />,
      title: 'Courses in Progress',
      value: '4',
      description: '2 completed this month',
    },
    {
      icon: <Medal className="h-4 w-4 text-muted-foreground" />,
      title: 'Average Score',
      value: '82%',
      description: '+5% from last month',
      progress: 82,
    },
    {
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      title: 'Total Study Time',
      value: '18h 45m',
      description: 'This month',
    },
    {
      icon: <Brain className="h-4 w-4 text-muted-foreground" />,
      title: 'Quizzes Passed',
      value: '25',
      description: '92% pass rate',
      progress: 92
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
            {stat.progress && <Progress value={stat.progress} className="mt-4 h-2" />}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
