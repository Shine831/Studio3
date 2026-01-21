'use client';

import { useState, useMemo } from 'react';
import { addDays, format, isSameDay } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import type { Booking, WithId } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleGuard } from '@/components/role-guard';

function BookingList({ bookings, language }: { bookings: WithId<Booking>[], language: 'fr' | 'en' }) {
    if (bookings.length === 0) {
        return <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Aucune session pour cette date.' : 'No sessions for this date.'}</p>;
    }
    const locale = language === 'fr' ? fr : enUS;

    return (
        <ul className="space-y-3">
            {bookings.map(booking => (
                <li key={booking.id} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{booking.subject}</p>
                        <p className="text-sm text-muted-foreground">{booking.studentName}</p>
                    </div>
                     <p className="text-sm font-medium">
                        {format(booking.startTime.toDate(), 'HH:mm', { locale })} - {format(booking.endTime.toDate(), 'HH:mm', { locale })}
                    </p>
                </li>
            ))}
        </ul>
    );
}

export default function SchedulePage() {
    const { language } = useLanguage();
    const { user } = useUser();
    const firestore = useFirestore();

    const [date, setDate] = useState<Date | undefined>(new Date());

    const t = {
        fr: {
            title: "Mon Calendrier",
            description: "Gérez votre emploi du temps et vos sessions à venir.",
            loading: "Chargement du calendrier...",
            selectedDay: "Sessions pour le",
            upcoming: "Prochaines sessions",
            devTitle: "Planification en développement",
            devDescription: "La possibilité de créer et modifier des réservations directement depuis le calendrier sera bientôt disponible.",
        },
        en: {
            title: "My Schedule",
            description: "Manage your schedule and upcoming sessions.",
            loading: "Loading schedule...",
            selectedDay: "Sessions for",
            upcoming: "Upcoming Sessions",
            devTitle: "Scheduling in Development",
            devDescription: "The ability to create and modify bookings directly from the calendar will be available soon.",
        }
    }[language];
    
    const locale = language === 'fr' ? fr : enUS;

    const bookingsRef = useMemoFirebase(
        () => user ? collection(firestore, `tutors/${user.uid}/bookings`) : null,
        [firestore, user]
    );

    const { data: bookings, isLoading } = useCollection<Booking>(bookingsRef);

    const bookingDays = useMemo(() => {
        return bookings?.map(b => b.startTime.toDate()) || [];
    }, [bookings]);

    const selectedDayBookings = useMemo(() => {
        if (!date || !bookings) return [];
        return bookings.filter(booking => isSameDay(booking.startTime.toDate(), date)).sort((a, b) => a.startTime.toDate() - b.startTime.toDate());
    }, [date, bookings]);
    
    const upcomingBookings = useMemo(() => {
        if (!bookings) return [];
        const now = new Date();
        return bookings.filter(b => b.startTime.toDate() >= now).sort((a,b) => a.startTime.toDate() - b.startTime.toDate()).slice(0, 5);
    }, [bookings]);

    if (isLoading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-9 w-1/3" />
                <Skeleton className="h-5 w-2/3" />
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Skeleton className="h-80 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <RoleGuard allowedRoles={['tutor', 'admin']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
                    <p className="text-muted-foreground">{t.description}</p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                     <Card className="md:col-span-2">
                        <CardContent className="p-2">
                             <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="w-full"
                                locale={locale}
                                modifiers={{ booked: bookingDays }}
                                modifiersStyles={{ booked: { border: `2px solid hsl(var(--primary))`, borderRadius: '50%' } }}
                            />
                        </CardContent>
                     </Card>
                     <div className="space-y-4">
                         <h3 className="text-xl font-semibold font-headline">{t.selectedDay} {date ? format(date, 'PPP', { locale }) : '...'}</h3>
                         <Card>
                             <CardContent className="p-4">
                                <BookingList bookings={selectedDayBookings} language={language} />
                             </CardContent>
                         </Card>
                     </div>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t.devTitle}</CardTitle>
                        <CardDescription>{t.devDescription}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </RoleGuard>
    );
}

    