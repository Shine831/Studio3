'use client';

import Link from 'next/link';
import { Bell, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LanguageSwitcher } from './language-switcher';
import { UserNav } from './user-nav';
import { AppSidebar } from './app-sidebar';
import { useLanguage } from '@/context/language-context';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export function AppHeader() {
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsRef = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'notifications'),
            orderBy('sentAt', 'desc'),
            limit(10)
          )
        : null,
    [firestore, user]
  );
  const { data: notifications } = useCollection<Notification>(notificationsRef);

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;
    const notifDocRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
    try {
        await deleteDoc(notifDocRef);
    } catch(e) {
        console.error("Error deleting notification:", e)
    }
  }

  const content = {
    fr: {
      toggleNav: 'Basculer le menu de navigation',
      navMenu: 'Menu de navigation',
      navDescription:
        "La navigation principale de l'application, avec des liens vers le tableau de bord, les cours, les répétiteurs, le plan d'étude et les paramètres.",
      searchPlaceholder: 'Rechercher...',
      toggleNotifications: 'Basculer les notifications',
      notifications: 'Notifications',
      noNotifications: 'Aucune nouvelle notification.',
    },
    en: {
      toggleNav: 'Toggle navigation menu',
      navMenu: 'Navigation Menu',
      navDescription:
        'The main navigation for the application, with links to dashboard, tutors, study plan, and settings.',
      searchPlaceholder: 'Search...',
      toggleNotifications: 'Toggle notifications',
      notifications: 'Notifications',
      noNotifications: 'No new notifications.',
    },
  };

  const t = content[language];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {/* Desktop nav can have some items, but most are in sidebar */}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t.toggleNav}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">{t.navMenu}</SheetTitle>
          <SheetDescription className="sr-only">
            {t.navDescription}
          </SheetDescription>
          <AppSidebar className="block" />
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              className="bg-background pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <LanguageSwitcher />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {notifications && notifications.length > 0 && (
                <span className="absolute top-0 right-0 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
              <span className="sr-only">{t.toggleNotifications}</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{t.notifications}</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              {notifications && notifications.length > 0 ? (
                <ul className="space-y-4">
                    {notifications.map(notif => (
                        <li key={notif.id} className="border-l-4 border-primary pl-4 relative group">
                             <Link href={notif.targetURL || '#'} className="block">
                                <p className="font-semibold">{language === 'fr' ? notif.messageFr : notif.messageEn}</p>
                                <p className="text-xs text-muted-foreground">
                                    {notif.sentAt?.toDate ? formatDistanceToNow(notif.sentAt.toDate(), { addSuffix: true, locale: language === 'fr' ? fr : enUS }) : ''}
                                </p>
                             </Link>
                             <Button variant="ghost" size="icon" className="absolute top-1/2 right-0 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteNotification(notif.id)}>
                                <X className="h-4 w-4" />
                             </Button>
                        </li>
                    ))}
                </ul>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  {t.noNotifications}
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <UserNav />
      </div>
    </header>
  );
}
