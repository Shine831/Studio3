'use client';

import Link from 'next/link';
import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LanguageSwitcher } from './language-switcher';
import { UserNav } from './user-nav';
import { AppSidebar } from './app-sidebar';
import { useLanguage } from '@/context/language-context';

export function AppHeader() {
  const { language } = useLanguage();

  const content = {
    fr: {
      toggleNav: 'Basculer le menu de navigation',
      navMenu: 'Menu de navigation',
      navDescription: 'La navigation principale de l\'application, avec des liens vers le tableau de bord, les cours, les répétiteurs, le plan d\'étude et les paramètres.',
      searchPlaceholder: 'Rechercher des cours...',
      toggleNotifications: 'Basculer les notifications',
    },
    en: {
      toggleNav: 'Toggle navigation menu',
      navMenu: 'Navigation Menu',
      navDescription: 'The main navigation for the application, with links to dashboard, courses, tutors, study plan, and settings.',
      searchPlaceholder: 'Search courses...',
      toggleNotifications: 'Toggle notifications',
    }
  };

  const t = content[language];

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
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
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
            />
          </div>
        </form>
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">{t.toggleNotifications}</span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}
