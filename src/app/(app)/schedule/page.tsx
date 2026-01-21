
'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import type { Booking, WithId } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleGuard } from '@/components/role-guard';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';


function EditSessionDialog({ booking, language, children }: { booking: WithId<Booking>, language: 'fr' | 'en', children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

    const t = {
        fr: {
            dialogTitle: "Modifier la session",
            subjectLabel: "Matière",
            dateLabel: "Date",
            startTimeLabel: "Heure de début",
            endTimeLabel: "Heure de fin",
            notesLabel: "Notes (optionnel)",
            submit: "Mettre à jour",
            cancel: "Annuler",
            updateSuccessTitle: "Session mise à jour !",
            updateSuccessDesc: "La session a été modifiée.",
            updateErrorTitle: "Erreur",
            updateErrorDesc: "Impossible de mettre à jour la session.",
            formErrors: {
                subjectRequired: "Veuillez entrer une matière.",
                dateRequired: "Veuillez choisir une date.",
                invalidTime: "Format invalide (HH:mm).",
                endTimeAfterStart: "L'heure de fin doit être après l'heure de début."
            }
        },
        en: {
            dialogTitle: "Edit Session",
            subjectLabel: "Subject",
            dateLabel: "Date",
            startTimeLabel: "Start Time",
            endTimeLabel: "End Time",
            notesLabel: "Notes (optional)",
            submit: "Update Session",
            cancel: "Cancel",
            updateSuccessTitle: "Session Updated!",
            updateSuccessDesc: "The session has been successfully modified.",
            updateErrorTitle: "Error",
            updateErrorDesc: "Could not update the session.",
            formErrors: {
                subjectRequired: "Please enter a subject.",
                dateRequired: "Please pick a date.",
                invalidTime: "Invalid time format (HH:mm).",
                endTimeAfterStart: "End time must be after start time."
            }
        }
    }[language];

     const bookingFormSchema = z.object({
        subject: z.string().min(2, { message: t.formErrors.subjectRequired }),
        date: z.string().min(1, { message: t.formErrors.dateRequired }),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: t.formErrors.invalidTime }),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: t.formErrors.invalidTime }),
        notes: z.string().optional(),
    }).refine(data => {
        if (!data.startTime || !data.endTime) return true;
        return data.endTime > data.startTime;
    }, {
        message: t.formErrors.endTimeAfterStart,
        path: ["endTime"],
    });

    const defaultValues = {
        subject: booking.subject,
        date: format(booking.startTime.toDate(), 'yyyy-MM-dd'),
        startTime: format(booking.startTime.toDate(), 'HH:mm'),
        endTime: format(booking.endTime.toDate(), 'HH:mm'),
        notes: booking.notes || '',
    };
    
    const form = useForm<z.infer<typeof bookingFormSchema>>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues,
    });

    async function onSubmit(data: z.infer<typeof bookingFormSchema>) {
        if (!user || !firestore) return;
        
        try {
            const startDate = new Date(`${data.date}T${data.startTime}`);
            const endDate = new Date(`${data.date}T${data.endTime}`);

            const bookingRef = doc(firestore, 'tutors', user.uid, 'bookings', booking.id);

            await updateDoc(bookingRef, {
                subject: data.subject,
                startTime: Timestamp.fromDate(startDate),
                endTime: Timestamp.fromDate(endDate),
                notes: data.notes || '',
            });

            toast({ title: t.updateSuccessTitle, description: t.updateSuccessDesc });
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: t.updateErrorTitle, description: t.updateErrorDesc });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.dialogTitle}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <FormField control={form.control} name="subject" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.subjectLabel}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )}/>
                         <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.dateLabel}</FormLabel>
                                <FormControl><Input type="date" {...field} min={new Date().toISOString().split("T")[0]} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="startTime" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t.startTimeLabel}</FormLabel>
                                    <FormControl><Input type="time" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="endTime" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t.endTimeLabel}</FormLabel>
                                    <FormControl><Input type="time" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                         <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.notesLabel}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )}/>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.cancel}</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>{t.submit}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function CancelSessionAlert({ booking, language, children }: { booking: WithId<Booking>, language: 'fr' | 'en', children: React.ReactNode }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

    const t = {
        fr: {
            title: "Annuler la session ?",
            description: "Cette action est irréversible. La session sera marquée comme annulée.",
            cancel: "Retour",
            confirm: "Confirmer l'annulation",
            successTitle: "Session annulée",
            successDesc: "La session a été annulée.",
            errorTitle: "Erreur",
            errorDesc: "Impossible d'annuler la session.",
        },
        en: {
            title: "Cancel Session?",
            description: "This action cannot be undone. The session will be marked as cancelled.",
            cancel: "Back",
            confirm: "Confirm Cancellation",
            successTitle: "Session Cancelled",
            successDesc: "The session has been cancelled.",
            errorTitle: "Error",
            errorDesc: "Could not cancel the session.",
        }
    }[language];

    const handleCancel = async () => {
        if (!user || !firestore) return;
        try {
            const bookingRef = doc(firestore, 'tutors', user.uid, 'bookings', booking.id);
            await updateDoc(bookingRef, { status: 'cancelled' });
            toast({ title: t.successTitle, description: t.successDesc });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: t.errorTitle, description: t.errorDesc });
        }
    }

    return (
         <AlertDialog>
            <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t.title}</AlertDialogTitle>
                    <AlertDialogDescription>{t.description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">{t.confirm}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

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
            actions: "Actions",
            noBookings: "Aucune session planifiée.",
            statuses: {
                pending: 'En attente',
                confirmed: 'Confirmée',
                completed: 'Terminée',
                cancelled: 'Annulée'
            },
            edit: "Modifier",
            cancel: "Annuler",
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
            actions: "Actions",
            noBookings: "No scheduled sessions.",
            statuses: {
                pending: 'Pending',
                confirmed: 'Confirmed',
                completed: 'Completed',
                cancelled: 'Cancelled'
            },
            edit: "Edit",
            cancel: "Cancel",
        }
    }[language];
    
    const locale = language === 'fr' ? fr : enUS;

    const bookingsQuery = useMemoFirebase(
        () => user ? query(collection(firestore, `tutors/${user.uid}/bookings`), orderBy('startTime', 'desc')) : null,
        [firestore, user]
    );
    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    const getStatusVariant = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return 'default';
            case 'completed': return 'secondary';
            case 'cancelled': return 'destructive';
            case 'pending': return 'outline';
            default: return 'outline';
        }
    };
    
    const isFutureSession = (booking: WithId<Booking>) => {
        return booking.startTime.toDate() > new Date();
    }

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
                                    {[...Array(5)].map((_,i) => <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>)}
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {[...Array(3)].map((_, i) => (
                                     <TableRow key={i}>
                                         {[...Array(5)].map((_,j) => <TableCell key={j}><Skeleton className="h-10 w-full" /></TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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
                 <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.student}</TableHead>
                                    <TableHead>{t.subject}</TableHead>
                                    <TableHead>{t.date}</TableHead>
                                    <TableHead>{t.time}</TableHead>
                                    <TableHead>{t.status}</TableHead>
                                    <TableHead className="text-right">{t.actions}</TableHead>
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
                                            <TableCell>
                                                <Badge variant={getStatusVariant(booking.status)}>{t.statuses[booking.status]}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                               {isFutureSession(booking) && booking.status !== 'cancelled' ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Ouvrir le menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <EditSessionDialog booking={booking} language={language}>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>{t.edit}</DropdownMenuItem>
                                                            </EditSessionDialog>
                                                            <CancelSessionAlert booking={booking} language={language}>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">{t.cancel}</DropdownMenuItem>
                                                            </CancelSessionAlert>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : null}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
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

