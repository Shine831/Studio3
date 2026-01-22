'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import {
  Star,
  Users,
  Calendar,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { TutorProfile, Booking, FollowerRecord, WithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface TutorDashboardProps {
  bookings: WithId<Booking>[] | null;
  followers: WithId<FollowerRecord>[] | null;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}


export function TutorDashboard({ bookings, followers }: TutorDashboardProps) {
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
      totalFollowers: 'Total des Abonnés',
      upcomingSessions: 'Sessions à Venir',
      viewSchedule: 'Voir le calendrier',
      viewStudents: 'Voir tous les élèves',
      recentFollowers: 'Nouveaux Abonnés',
      noUpcomingSessions: 'Aucune session à venir.',
      noFollowers: 'Aucun élève ne vous suit.',
    },
    en: {
      title: 'Tutor Dashboard',
      description: 'Manage your activity, view your stats and upcoming sessions.',
      avgRating: 'Average Rating',
      basedOn: 'Based on',
      reviews: 'reviews',
      noReviews: 'No reviews yet.',
      totalFollowers: 'Total Followers',
      upcomingSessions: 'Upcoming Sessions',
      viewSchedule: 'View schedule',
      viewStudents: 'View all students',
      recentFollowers: 'New Followers',
      noUpcomingSessions: 'No upcoming sessions.',
      noFollowers: 'No students are following you yet.',
    }
  };

  const t = content[language];
  const locale = language === 'fr' ? fr : enUS;
  
  const tutorProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'tutors', user.uid) : null),
    [firestore, user]
  );
  const { data: tutorProfile, isLoading: isLoadingProfile } = useDoc<TutorProfile>(tutorProfileRef);

  const recentFollowers = followers?.slice(0, 5) || [];
  const upcomingBookings = bookings?.slice(0, 5) || [];

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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.totalFollowers}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoadingProfile ? <Skeleton className="h-8 w-1/4" /> : (
                         <div className="text-2xl font-bold">{tutorProfile?.followersCount || 0}</div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t.upcomingSessions}</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <div className="text-2xl font-bold">{bookings?.length || 0}</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        {t.upcomingSessions}
                        <Link href="/schedule" className="text-sm font-normal text-primary hover:underline">
                            {t.viewSchedule} <ArrowRight className="inline h-4 w-4" />
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingBookings.map(booking => (
                            <div key={booking.id} className="flex items-center p-2 rounded-md hover:bg-muted transition-colors">
                                <Calendar className="mr-4 h-5 w-5 text-primary" />
                                <div className="grid gap-1 flex-1">
                                    <p className="text-sm font-medium leading-none">{booking.subject} with {booking.studentName}</p>
                                    <p className="text-sm text-muted-foreground">{format(booking.startTime.toDate(), 'PPP p', { locale })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>{t.noUpcomingSessions}</p>
                    </div>
                )}
                </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    {t.recentFollowers}
                    <Link href="/students" className="text-sm font-normal text-primary hover:underline">
                        {t.viewStudents} <ArrowRight className="inline h-4 w-4" />
                    </Link>
                </CardTitle>
                </CardHeader>
                <CardContent>
                {recentFollowers.length > 0 ? (
                    <div className="space-y-4">
                        {recentFollowers.map(follower => (
                            <div key={follower.id} className="flex items-center p-2 rounded-md hover:bg-muted transition-colors">
                                <Avatar className="h-9 w-9 mr-4">
                                    <AvatarImage src={follower.studentAvatar} />
                                    <AvatarFallback>{getInitials(follower.studentName)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">{follower.studentName}</p>
                                     <p className="text-sm text-muted-foreground">{format(follower.followedAt.toDate(), 'PPP', { locale })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                    <p>{t.noFollowers}</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
