
'use client';

import Link from 'next/link';
import {
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
  Bug,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useState, useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useAuth, useFirestore, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { ReportBugDialog } from '@/components/report-bug-dialog';
import { getInitials } from '@/lib/utils';


export function UserNav() {
  const { setTheme } = useTheme();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [reportBugOpen, setReportBugOpen] = useState(false);

  const userProfileRef = useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const content = {
    fr: {
      profile: 'Profil',
      toggleTheme: 'Changer de thème',
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système',
      logOut: 'Se déconnecter',
      loggedOutTitle: 'Déconnecté',
      loggedOutDesc: 'Vous avez été déconnecté avec succès.',
      noEmail: 'Pas d\'email',
      reportBug: 'Signaler un bug',
    },
    en: {
      profile: 'Profile',
      toggleTheme: 'Toggle theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      logOut: 'Log out',
      loggedOutTitle: 'Logged Out',
      loggedOutDesc: 'You have been successfully logged out.',
      noEmail: 'No email',
      reportBug: 'Report a bug',
    }
  };
  const t = content[language];

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({
      title: t.loggedOutTitle,
      description: t.loggedOutDesc,
    });
    router.push('/');
  };

  const avatarName = useMemo(() => {
    if (userProfile?.firstName) {
        return `${userProfile.firstName} ${userProfile.lastName || ''}`;
    }
    return user?.displayName;
  }, [userProfile, user]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={userProfile?.profilePicture} alt="User avatar" />
              <AvatarFallback>{getInitials(avatarName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{avatarName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || t.noEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{t.profile}</span>
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => setReportBugOpen(true)}>
              <Bug className="mr-2 h-4 w-4" />
              <span>{t.reportBug}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="pl-2">{t.toggleTheme}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                {t.light}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                {t.dark}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                {t.system}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t.logOut}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportBugDialog open={reportBugOpen} onOpenChange={setReportBugOpen} />
    </>
  );
}
