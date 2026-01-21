'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';

export function TutorDashboard() {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: 'Tableau de bord du Répétiteur',
      description: 'Gérez vos sessions, votre profil et vos revenus ici.',
      upcoming: 'Prochaines sessions',
      noUpcoming: 'Aucune session à venir.',
      performance: 'Votre Performance',
      totalEarned: 'Total des gains',
      reviews: 'Avis',
    },
    en: {
      title: 'Tutor Dashboard',
      description: 'Manage your sessions, profile, and earnings here.',
      upcoming: 'Upcoming Sessions',
      noUpcoming: 'No upcoming sessions.',
      performance: 'Your Performance',
      totalEarned: 'Total Earned',
      reviews: 'Reviews',
    }
  };

  const t = content[language];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
      <p className="text-muted-foreground">{t.description}</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t.upcoming}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t.noUpcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.performance}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.totalEarned}</p>
              <p className="text-2xl font-bold">0 FCFA</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.reviews}</p>
              <p className="text-2xl font-bold">0 (0.0)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
