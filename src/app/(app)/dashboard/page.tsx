import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Overview } from './components/overview';
import { RecentActivityChart } from './components/recent-activity-chart';

export default function Dashboard() {

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Overview />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your study time over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RecentActivityChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>
                Your next tutoring sessions.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/tutors">
                Book Now
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col items-center justify-center text-center p-4 h-full">
                <p className="text-muted-foreground">No upcoming sessions.</p>
                <p className="text-sm text-muted-foreground">Book a session with a tutor to get started.</p>
            </div>
          </CardContent>
        </Card>
      </div>
       {/* "Continue Learning" section is removed to ensure a clean slate for new users, as requested.
           It can be added back later when course progress data is available. */}
    </div>
  );
}
