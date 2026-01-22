'use client';

import Link from 'next/link';
import {
  Home,
  Settings,
  Users,
  BookCopy,
} from 'lucide-react';
import { Icons } from './icons';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { usePathname } from 'next/navigation';

export function AppSidebar({ className }: { className?: string }) {
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const content = {
    fr: {
      dashboard: 'Tableau de bord',
      tutors: 'Répétiteurs',
      settings: 'Paramètres',
      studyPlan: "Plans d'étude",
    },
    en: {
      dashboard: 'Dashboard',
      tutors: 'Tutors',
      settings: 'Settings',
      studyPlan: "Study Plans",
    },
  };

  const t = content[language];
  
  const navItems = [
    { href: '/dashboard', icon: Home, label: t.dashboard, roles: ['student', 'tutor', 'admin'] },
    { href: '/study-plan', icon: BookCopy, label: t.studyPlan, roles: ['student'] },
    { href: '/tutors', icon: Users, label: t.tutors, roles: ['student', 'admin'] },
    { href: '/settings', icon: Settings, label: t.settings, roles: ['student', 'tutor', 'admin'] },
  ];
  
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
                </div>
            ) : (
                navItems
                .filter(item => userProfile && item.roles.includes(userProfile.role))
                .map(({ href, icon: Icon, label }) => (
                  <Link
                      key={label}
                      href={href}
                      className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted", {
                          "bg-muted text-primary": pathname.startsWith(href) && (href !== '/dashboard' || pathname === href)
                      })}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
