'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import {
  Star,
} from 'lucide-react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { TutorProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';

export function TutorDashboard() {
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();

  const content = {
    fr: {
      title: 'Tableau de bord du Répétiteur',
      description: 'Gérez votre activité, consultez vos statistiques et sessions à venir.',
      avgRating: 'Note Moyenne',
      basedOn: 'Basé sur',
      reviews: 'avis',
      noReviews: 'Aucun avis pour le moment.',
    },
    en: {
      title: 'Tutor Dashboard',
      description: 'Manage your activity, view your stats and upcoming sessions.',
      avgRating: 'Average Rating',
      basedOn: 'Based on',
      reviews: 'reviews',
      noReviews: 'No reviews yet.',
    }
  };

  const t = content[language];
  
  const tutorProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'tutors', user.uid) : null),
    [firestore, user]
  );
  const { data: tutorProfile, isLoading: isLoadingProfile } = useDoc<TutorProfile>(tutorProfileRef);

  return (
    <div className="flex flex-1 flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
            <p className="text-muted-foreground">{t.description}</p>
        </div>
      
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.avgRating}</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoadingProfile ? <Skeleton className="h-8 w-1/2" /> : (
                        tutorProfile ? (
                        <>
                            <div className="text-2xl font-bold">{tutorProfile.rating?.toFixed(1) || '0.0'}</div>
                            <p className="text-xs text-muted-foreground">{t.basedOn} {tutorProfile.reviewsCount || 0} {t.reviews}</p>
                        </>
                        ) : (
                        <p className="text-sm text-muted-foreground">{t.noReviews}</p>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
