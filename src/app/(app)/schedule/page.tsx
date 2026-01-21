'use client';

import { useState, useMemo } from 'react';
import { addDays, format, isSameDay, setHours, setMinutes, parse } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { collection, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import type { Booking, WithId, FollowerRecord } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleGuard } from '@/components/role-guard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';


function BookingList({ bookings, language }: { bookings: WithId<Booking>[], language: 'fr' | 'en' }) {
    if (bookings.length === 0) {
        return <p className="text-sm text-muted-foreground p-4 text-center">{language === 'fr' ? 'Aucune session pour cette date.' : 'No sessions for this date.'}</p>;
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
    const { toast } = useToast();

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const t = {
        fr: {
            title: "Mon Calendrier",
            description: "Gérez votre emploi du temps et vos sessions à venir.",
            loading: "Chargement du calendrier...",
            selectedDay: "Sessions pour le",
            upcoming: "Prochaines sessions",
            newSession: "Nouvelle Session",
            dialogTitle: "Planifier une nouvelle session",
            studentLabel: "Élève",
            studentPlaceholder: "Sélectionnez un élève",
            subjectLabel: "Matière",
            startTimeLabel: "Heure de début",
            endTimeLabel: "Heure de fin",
            notesLabel: "Notes (optionnel)",
            submit: "Créer la session",
            cancel: "Annuler",
            bookingSuccessTitle: "Session créée !",
            bookingSuccessDesc: "La session a été ajoutée à votre calendrier.",
            bookingErrorTitle: "Erreur",
            bookingErrorDesc: "Impossible de créer la session.",
            formErrors: {
                studentRequired: "Veuillez sélectionner un élève.",
                subjectRequired: "Veuillez entrer une matière.",
                invalidTime: "Format invalide (HH:mm).",
                endTimeAfterStart: "L'heure de fin doit être après l'heure de début."
            }
        },
        en: {
            title: "My Schedule",
            description: "Manage your schedule and upcoming sessions.",
            loading: "Loading schedule...",
            selectedDay: "Sessions for",
            upcoming: "Upcoming Sessions",
            newSession: "New Session",
            dialogTitle: "Schedule a New Session",
            studentLabel: "Student",
            studentPlaceholder: "Select a student",
            subjectLabel: "Subject",
            startTimeLabel: "Start Time",
            endTimeLabel: "End Time",
            notesLabel: "Notes (optional)",
            submit: "Create Session",
            cancel: "Cancel",
            bookingSuccessTitle: "Session Created!",
            bookingSuccessDesc: "The session has been added to your calendar.",
            bookingErrorTitle: "Error",
            bookingErrorDesc: "Could not create the session.",
            formErrors: {
                studentRequired: "Please select a student.",
                subjectRequired: "Please enter a subject.",
                invalidTime: "Invalid time format (HH:mm).",
                endTimeAfterStart: "End time must be after start time."
            }
        }
    }[language];
    
    const locale = language === 'fr' ? fr : enUS;

    const bookingsRef = useMemoFirebase(
        () => user ? collection(firestore, `tutors/${user.uid}/bookings`) : null,
        [firestore, user]
    );
    const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsRef);

    const followersRef = useMemoFirebase(
        () => user ? collection(firestore, `tutors/${user.uid}/followers`) : null,
        [firestore, user]
    );
    const { data: followers, isLoading: isLoadingFollowers } = useCollection<FollowerRecord>(followersRef);

    const bookingDays = useMemo(() => {
        return bookings?.map(b => b.startTime.toDate()) || [];
    }, [bookings]);

    const selectedDayBookings = useMemo(() => {
        if (!date || !bookings) return [];
        return bookings.filter(booking => isSameDay(booking.startTime.toDate(), date)).sort((a, b) => a.startTime.toDate() - b.startTime.toDate());
    }, [date, bookings]);

    const isLoading = isLoadingBookings || isLoadingFollowers;

    const bookingFormSchema = z.object({
        studentId: z.string().min(1, t.formErrors.studentRequired),
        subject: z.string().min(2, t.formErrors.subjectRequired),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, t.formErrors.invalidTime),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, t.formErrors.invalidTime),
        notes: z.string().optional(),
    }).refine(data => data.endTime > data.startTime, {
        message: t.formErrors.endTimeAfterStart,
        path: ["endTime"],
    });
    
    const form = useForm<z.infer<typeof bookingFormSchema>>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: { subject: '', startTime: '', endTime: '', notes: '' },
    });

    async function onSubmit(data: z.infer<typeof bookingFormSchema>) {
        if (!user || !firestore || !date) return;
        
        try {
            const startDate = parse(data.startTime, 'HH:mm', date);
            const endDate = parse(data.endTime, 'HH:mm', date);

            const selectedStudent = followers?.find(f => f.id === data.studentId);

            const newBooking: Omit<Booking, 'id'> = {
                studentId: data.studentId,
                tutorId: user.uid,
                studentName: selectedStudent?.studentName || 'Unknown Student',
                subject: data.subject,
                startTime: Timestamp.fromDate(startDate),
                endTime: Timestamp.fromDate(endDate),
                status: 'confirmed',
                notes: data.notes || '',
            };

            const bookingsCollectionRef = collection(firestore, 'tutors', user.uid, 'bookings');
            await addDoc(bookingsCollectionRef, newBooking);

            toast({ title: t.bookingSuccessTitle, description: t.bookingSuccessDesc });
            setIsDialogOpen(false);
            form.reset();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: t.bookingErrorTitle, description: t.bookingErrorDesc });
        }
    }


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
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                     <Card className="lg:col-span-2">
                        <CardContent className="p-0 sm:p-2">
                             <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="w-full"
                                locale={locale}
                                modifiers={{ booked: bookingDays }}
                                modifiersClassNames={{ booked: 'font-bold text-primary' }}
                            />
                        </CardContent>
                     </Card>
                     <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold font-headline">{date ? format(date, 'PPP', { locale }) : '...'}</h3>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" disabled={!date}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        {t.newSession}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t.dialogTitle}</DialogTitle>
                                    </DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="studentId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t.studentLabel}</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={t.studentPlaceholder} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {followers?.map(f => <SelectItem key={f.id} value={f.id}>{f.studentName}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="subject"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t.subjectLabel}</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="startTime"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t.startTimeLabel}</FormLabel>
                                                            <FormControl><Input type="time" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="endTime"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t.endTimeLabel}</FormLabel>
                                                            <FormControl><Input type="time" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                             <FormField
                                                control={form.control}
                                                name="notes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t.notesLabel}</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
                                                <Button type="submit" disabled={form.formState.isSubmitting}>{t.submit}</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                         </div>
                         <Card>
                             <CardContent className="p-2">
                                <BookingList bookings={selectedDayBookings} language={language} />
                             </CardContent>
                         </Card>
                     </div>
                </div>
            </div>
        </RoleGuard>
    );
}
