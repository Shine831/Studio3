'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { useUser } from '@/firebase';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function StudentDashboard() {
  const { language } = useLanguage();
  const { user } = useUser();
  
  const content = {
    fr: {
      welcome: 'Bienvenue',
      description: 'Prêt à trouver le répétiteur parfait ? Parcourez les profils, vérifiez leurs compétences et contactez-les directement sur WhatsApp pour commencer.',
      browseTutors: 'Trouver un répétiteur',
    },
    en: {
      welcome: 'Welcome',
      description: 'Ready to find the perfect tutor? Browse profiles, check their skills, and contact them directly on WhatsApp to get started.',
      browseTutors: 'Browse Tutors',
    },
  };
  const t = content[language];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">{t.welcome}, {user?.displayName?.split(' ')[0]}!</h1>
      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-lg text-center">
            <p className="text-lg text-muted-foreground mb-6">{t.description}</p>
            <Button asChild size="lg">
                <Link href="/tutors">
                    {t.browseTutors}
                    <ArrowRight className="ml-2" />
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}

    