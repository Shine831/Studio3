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
import { courses } from '@/lib/data';
import { CourseCard } from '@/components/course-card';

export default function Dashboard() {
  const isNewUser = true; // This would be dynamic based on user data

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
            {isNewUser ? (
                <div className="flex flex-col items-center justify-center text-center p-4 h-full">
                    <p className="text-muted-foreground">No upcoming sessions.</p>
                    <p className="text-sm text-muted-foreground">Book a session with a tutor to get started.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-muted text-muted-foreground rounded-md p-2 w-16">
                        <span className="text-xl font-bold">25</span>
                        <span className="text-xs">JUL</span>
                        </div>
                        <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                            Algebra II with John A.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            4:00 PM - 5:00 PM
                        </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto">
                        Join
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-muted text-muted-foreground rounded-md p-2 w-16">
                        <span className="text-xl font-bold">28</span>
                        <span className="text-xs">JUL</span>
                        </div>
                        <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                            Physics Help with Marie D.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            2:00 PM - 3:00 PM
                        </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto">
                        Join
                        </Button>
                    </div>
                </>
            )}
          </CardContent>
        </Card>
      </div>
       {!isNewUser && <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Continue Learning</h2>
        <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>}
    </div>
  );
}
