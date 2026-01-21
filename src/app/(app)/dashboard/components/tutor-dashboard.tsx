'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Star,
  CalendarClock,
  Users,
  Banknote,
} from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, limit, orderBy, query, where, Timestamp } from 'firebase/firestore'; // Import where and Timestamp
import type { FollowerRecord, TutorRating, Booking } from '@/lib/types'; // Import Booking
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}


export function TutorDashboard() {
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();
  const locale = language === 'fr' ? fr : enUS;

  const content = {
    fr: {
      title: 'Tableau de bord',
      description: 'Gérez vos sessions, vos revenus et votre profil.',
      totalStudents: 'Total Élèves',
      avgRating: 'Note Moyenne',
      upcomingSessions: 'Sessions à Venir',
      totalEarnings: 'Revenus (30 jours)',
      viewAll: 'Voir tout',
      recentActivity: 'Avis Récents',
      noUpcoming: 'Aucune session à venir.',
      noReviews: 'Aucun avis récent.',
      contact: 'Contacter',
      currency: 'FCFA',
      basedOn: 'Basé sur',
      reviews: 'avis',
      inNext7Days: 'Sessions à venir',
      devFeature: 'Fonctionnalité en développement',
      followers: 'abonnés ce mois-ci',
      noFollowers: "Pas encore d'abonnés",
    },
    en: {
      title: 'Dashboard',
      description: 'Manage your sessions, earnings, and profile.',
      totalStudents: 'Total Students',
      avgRating: 'Average Rating',
      upcomingSessions: 'Upcoming Sessions',
      totalEarnings: 'Earnings (30 days)',
      viewAll: 'View all',
      recentActivity: 'Recent Reviews',
      noUpcoming: 'No upcoming sessions.',
      noReviews: 'No recent reviews.',
      contact: 'Contact',
      currency: 'XAF',
      basedOn: 'Based on',
      reviews: 'reviews',
      inNext7Days: 'Upcoming sessions',
      devFeature: 'Feature in development',
      followers: 'followers this month',
      noFollowers: 'No followers yet',
    }
  };

  const t = content[language];
  
  const followersRef = useMemoFirebase(
    () => (user ? collection(firestore, 'tutors', user.uid, 'followers') : null),
    [firestore, user]
  );
  const { data: followers, isLoading: isLoadingFollowers } = useCollection<FollowerRecord>(followersRef);

  const ratingsRef = useMemoFirebase(
    () => (user ? query(collection(firestore, 'tutors', user.uid, 'ratings'), orderBy('createdAt', 'desc'), limit(5)) : null),
    [firestore, user]
  );
  const { data: ratings, isLoading: isLoadingRatings } = useCollection<TutorRating>(ratingsRef);

  // New query for upcoming bookings
  const upcomingBookingsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'tutors', user.uid, 'bookings'), where('startTime', '>=', Timestamp.now()), orderBy('startTime', 'asc'), limit(5)) : null),
    [firestore, user]
  );
  const { data: upcomingBookings, isLoading: isLoadingBookings } = useCollection<Booking>(upcomingBookingsQuery);

  const stats = {
      totalStudents: followers?.length || 0,
      avgRating: ratings && ratings.length > 0 ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length : 0,
      totalRatings: ratings?.length || 0,
      upcomingCount: upcomingBookings?.length || 0,
  }

  const isLoading = isLoadingFollowers || isLoadingRatings || isLoadingBookings;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
      <p className="text-muted-foreground">{t.description}</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalStudents}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  {isLoadingFollowers ? <Skeleton className="h-8 w-1/2" /> : (
                    <>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalStudents > 0 ? `${stats.totalStudents} ${t.followers}` : t.noFollowers}
                        </p>
                    </>
                  )}
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.avgRating}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 {isLoadingRatings ? <Skeleton className="h-8 w-1/2" /> : (
                    <>
                        <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">{t.basedOn} {stats.totalRatings} {t.reviews}</p>
                    </>
                 )}
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.upcomingSessions}</CardTitle>
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingBookings ? <Skeleton className="h-8 w-1/2" /> : (
                  <>
                      <div className="text-2xl font-bold">{stats.upcomingCount}</div>
                      <p className="text-xs text-muted-foreground">{t.inNext7Days}</p>
                  </>
                )}
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalEarnings}</CardTitle>
                  <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">0 <span className="text-sm">{t.currency}</span></div>
                  <p className="text-xs text-muted-foreground">{t.devFeature}</p>
              </CardContent>
          </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
              <CardHeader className="flex flex-row items-center">
                  <CardTitle>{t.upcomingSessions}</CardTitle>
                   <Button asChild size="sm" className="ml-auto">
                        <Link href="/schedule">{t.viewAll}</Link>
                   </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                  {isLoadingBookings ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_,i) => <Skeleton key={i} className="h-14 w-full" />)}
                    </div>
                  ) : upcomingBookings && upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingBookings.map(booking => (
                            <div key={booking.id} className="flex items-center p-3 bg-muted/50 rounded-lg">
                                <div className="flex flex-col">
                                  <span className="font-semibold">{booking.subject}</span>
                                  <span className="text-sm text-muted-foreground">{booking.studentName}</span>
                                </div>
                                <div className="ml-auto text-right">
                                  <div className="font-medium">{format(booking.startTime.toDate(), 'PPP', { locale })}</div>
                                  <div className="text-sm text-muted-foreground">{format(booking.startTime.toDate(), 'p', { locale })}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex h-48 flex-col items-center justify-center text-center p-4">
                      <p className="text-sm text-muted-foreground">{t.noUpcoming}</p>
                    </div>
                  )}
              </CardContent>
          </Card>
          <Card className="lg:col-span-3">
              <CardHeader>
                  <CardTitle>{t.recentActivity}</CardTitle>
                  <CardDescription>{language === 'fr' ? 'Avis récents de vos élèves.' : 'Recent reviews from your students.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  {isLoadingRatings ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                  ) : ratings && ratings.length > 0 ? ratings.map(review => (
                       <div key={review.id} className="flex items-start">
                          <Avatar className="h-9 w-9">
                              <AvatarFallback>{review.studentName ? getInitials(review.studentName) : '?'}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 space-y-1 w-full">
                              <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium leading-none">{review.studentName || 'Anonymous'}</p>
                                  <div className="flex items-center gap-0.5 ml-2">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'fill-muted stroke-muted-foreground'}`} />
                                      ))}
                                  </div>
                              </div>
                              <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                          </div>
                      </div>
                  )) : <p className="text-sm text-muted-foreground">{t.noReviews}</p>}
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
