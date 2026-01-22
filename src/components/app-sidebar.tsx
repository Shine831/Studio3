'use client';

import Link from 'next/link';
import {
  Home,
  Settings,
  Users,
  BookCopy,
  LayoutGrid,
  CalendarClock,
  UserCheck,
} from 'lucide-react';
import { Icons } from './icons';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

export function AppSidebar({ className }: { className?: string }) {
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const content = {
    fr: {
      dashboard: 'Tableau de bord',
      tutors: 'Répétiteurs',
      studyPlans: "Plans d'étude",
      settings: 'Paramètres',
      students: 'Mes Élèves',
      schedule: 'Mon Calendrier',
      mySchedule: 'Mon Emploi du Temps',
      myTutors: 'Mes Répétiteurs',
    },
    en: {
      dashboard: 'Dashboard',
      tutors: 'Tutors',
      studyPlans: 'Study Plans',
      settings: 'Settings',
      students: 'My Students',
      schedule: 'My Schedule',
      mySchedule: 'My Schedule',
      myTutors: 'My Tutors',
    },
  };

  const t = content[language];
  
  const studentNavItems = [
    { href: '/dashboard', icon: Home, label: t.dashboard },
    { href: '/tutors', icon: Users, label: t.tutors },
    { href: '/study-plan', icon: BookCopy, label: t.studyPlans },
    { href: '/my-schedule', icon: CalendarClock, label: t.mySchedule },
    { href: '/my-tutors', icon: UserCheck, label: t.myTutors },
  ];
  
  const tutorNavItems = [
    { href: '/dashboard', icon: LayoutGrid, label: t.dashboard },
    { href: '/students', icon: Users, label: t.students },
    { href: '/schedule', icon: CalendarClock, label: t.schedule },
  ]
  
  const commonNavItems = [
     { href: '/settings', icon: Settings, label: t.settings },
  ]
  
  const getNavItems = () => {
    if (userProfile?.role === 'tutor') {
      return [...tutorNavItems, ...commonNavItems];
    }
    // Default to student nav for 'student', 'admin', or null/undefined roles
    return [...studentNavItems, ...commonNavItems];
  }
  
  const navItems = getNavItems();
  const isLoading = isProfileLoading;


  return (
    <div className={cn('hidden border-r bg-card md:block', className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-4 lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold font-headline"
          >
            <Icons.logo className="h-6 w-6 text-primary" />
            <span>RéviseCamer</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {isLoading ? (
                <div className="space-y-2 py-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ) : (
                navItems.map(({ href, icon: Icon, label, badge }) => (
                <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {badge && (
                  <Badge className="ml-auto flex h-6 w-12 items-center justify-center rounded-md">
                      {badge}
                  </Badge>
                  )}
                </Link>
                ))
            )}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          {/* This could be a user profile section */}
        </div>
      </div>
    </div>
  );
}
