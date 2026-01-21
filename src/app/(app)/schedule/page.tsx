'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import type { Booking, WithId } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleGuard } from '@/components/role-guard';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export default function SchedulePage() {
    const { language } = useLanguage();
    const { user } = useUser();
    const firestore = useFirestore();

    const t = {
        fr: {
            title: "Mon Calendrier",
            description: "Gérez votre emploi du temps et vos sessions à venir.",
            loading: "Chargement du calendrier...",
            student: "Élève",
            subject: "Matière",
            date: "Date",
            time: "Heure",
            status: "Statut",
            noBookings: "Aucune session planifiée.",
            statuses: {
                pending: 'En attente',
                confirmed: 'Confirmée',
                completed: 'Terminée',
                cancelled: 'Annulée'
            }
        },
        en: {
            title: "My Schedule",
            description: "Manage your schedule and upcoming sessions.",
            loading: "Loading schedule...",
            student: "Student",
            subject: "Subject",
            date: "Date",
            time: "Time",
            status: "Status",
            noBookings: "No scheduled sessions.",
            statuses: {
                pending: 'Pending',
                confirmed: 'Confirmed',
                completed: 'Completed',
                cancelled: 'Cancelled'
            }
        }
    }[language];
    
    const locale = language === 'fr' ? fr : enUS;

    const bookingsQuery = useMemoFirebase(
        () => user ? query(collection(firestore, `tutors/${user.uid}/bookings`), orderBy('startTime', 'desc')) : null,
        [firestore, user]
    );
    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    if (isLoading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-9 w-1/3" />
                <Skeleton className="h-5 w-2/3" />
                <Card>
                    <CardContent className="p-0">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {[...Array(3)].map((_, i) => (
                                     <TableRow key={i}>
                                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const getStatusVariant = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return 'default';
            case 'completed': return 'secondary';
            case 'cancelled': return 'destructive';
            case 'pending': return 'outline';
            default: return 'outline';
        }
    }

    return (
        <RoleGuard allowedRoles={['tutor', 'admin']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
                    <p className="text-muted-foreground">{t.description}</p>
                </div>
                 <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.student}</TableHead>
                                    <TableHead>{t.subject}</TableHead>
                                    <TableHead>{t.date}</TableHead>
                                    <TableHead>{t.time}</TableHead>
                                    <TableHead className="text-right">{t.status}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings && bookings.length > 0 ? (
                                    bookings.map(booking => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">{booking.studentName}</TableCell>
                                            <TableCell>{booking.subject}</TableCell>
                                            <TableCell>{format(booking.startTime.toDate(), 'PPP', { locale })}</TableCell>
                                            <TableCell>{format(booking.startTime.toDate(), 'p', { locale })} - {format(booking.endTime.toDate(), 'p', { locale })}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={getStatusVariant(booking.status)}>{t.statuses[booking.status]}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            {t.noBookings}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </RoleGuard>
    );
}
