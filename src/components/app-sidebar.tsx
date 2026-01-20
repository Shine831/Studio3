import Link from 'next/link';
import {
  BookCopy,
  Home,
  Settings,
  Target,
  Users,
} from 'lucide-react';
import { Icons } from './icons';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/courses', icon: BookCopy, label: 'Courses' },
  { href: '/tutors', icon: Users, label: 'Tutors' },
  { href: '/study-plan', icon: Target, label: 'Study Plan', badge: 'Pro' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar({ className }: { className?: string }) {
  return (
    <div className={cn("hidden border-r bg-card md:block", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-4 lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span>RéviseCamer</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(({ href, icon: Icon, label, badge }) => (
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
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          {/* This could be a user profile section */}
          {/* For now, just a placeholder or could be the UserNav itself */}
        </div>
      </div>
    </div>
  );
}
