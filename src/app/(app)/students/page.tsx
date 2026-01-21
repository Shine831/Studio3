'use client';
import { useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { Booking, FollowerRecord, WithId } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/role-guard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}

function ScheduleSessionDialog({ student, language, user, firestore }: { student: WithId<FollowerRecord>, language: 'fr' | 'en', user: any, firestore: any }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const t = {
        fr: {
            dialogTitle: "Planifier une session pour",
            subjectLabel: "Matière",
            dateLabel: "Date",
            datePlaceholder: "Choisissez une date",
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
                subjectRequired: "Veuillez entrer une matière.",
                dateRequired: "Veuillez choisir une date.",
                invalidTime: "Format invalide (HH:mm).",
                endTimeAfterStart: "L'heure de fin doit être après l'heure de début."
            }
        },
        en: {
            dialogTitle: "Schedule a Session for",
            subjectLabel: "Subject",
            dateLabel: "Date",
            datePlaceholder: "Pick a date",
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
                subjectRequired: "Please enter a subject.",
                dateRequired: "Please pick a date.",
                invalidTime: "Invalid time format (HH:mm).",
                endTimeAfterStart: "End time must be after start time."
            }
        }
    }[language];

     const bookingFormSchema = z.object({
        subject: z.string().min(2, t.formErrors.subjectRequired),
        date: z.date({ required_error: t.formErrors.dateRequired }),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, t.formErrors.invalidTime),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, t.formErrors.invalidTime),
        notes: z.string().optional(),
    }).refine(data => {
        if (!data.startTime || !data.endTime) return true;
        return data.endTime > data.startTime;
    }, {
        message: t.formErrors.endTimeAfterStart,
        path: ["endTime"],
    });
    
    const form = useForm<z.infer<typeof bookingFormSchema>>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: { subject: '', startTime: '', endTime: '', notes: '' },
    });

    async function onSubmit(data: z.infer<typeof bookingFormSchema>) {
        if (!user || !firestore) return;
        
        try {
            const [startHour, startMinute] = data.startTime.split(':').map(Number);
            const [endHour, endMinute] = data.endTime.split(':').map(Number);

            const startDate = new Date(data.date);
            startDate.setHours(startHour, startMinute);

            const endDate = new Date(data.date);
            endDate.setHours(endHour, endMinute);

            const newBooking: Omit<Booking, 'id'> = {
                studentId: student.id,
                tutorId: user.uid,
                studentName: student.studentName,
                subject: data.subject,
                startTime: Timestamp.fromDate(startDate),
                endTime: Timestamp.fromDate(endDate),
                status: 'confirmed',
                notes: data.notes || '',
            };

            const bookingsCollectionRef = collection(firestore, 'tutors', user.uid, 'bookings');
            await addDoc(bookingsCollectionRef, newBooking);

            toast({ title: t.bookingSuccessTitle, description: t.bookingSuccessDesc });
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: t.bookingErrorTitle, description: t.bookingErrorDesc });
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">{language === 'fr' ? 'Planifier' : 'Schedule'}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.dialogTitle} {student.studentName}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                         <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>{t.dateLabel}</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>{t.datePlaceholder}</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
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
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.cancel}</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>{t.submit}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


export default function MyStudentsPage() {
    const { language } = useLanguage();
    const { user } = useUser();
    const firestore = useFirestore();

    const t = {
        fr: {
            title: "Mes Élèves",
            description: "Voici la liste des élèves qui vous suivent.",
            name: "Nom",
            followedOn: "Suivi le",
            actions: "Actions",
            noStudents: "Aucun élève ne vous suit pour le moment.",
            loading: "Chargement des élèves...",
        },
        en: {
            title: "My Students",
            description: "Here is the list of students who are following you.",
            name: "Name",
            followedOn: "Followed On",
            actions: "Actions",
            noStudents: "No students are following you yet.",
            loading: "Loading students...",
        }
    }[language];

    const followersRef = useMemoFirebase(
        () => (user ? collection(firestore, 'tutors', user.uid, 'followers') : null),
        [firestore, user]
    );

    const { data: followers, isLoading } = useCollection<FollowerRecord>(followersRef);

    if (isLoading) {
        return (
            <div className="space-y-4">
                 <Skeleton className="h-8 w-1/3" />
                 <Skeleton className="h-4 w-2/3" />
                 <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(3)].map((_, i) => (
                                     <TableRow key={i}>
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
                                    <TableHead>{t.name}</TableHead>
                                    <TableHead>{t.followedOn}</TableHead>
                                    <TableHead className="text-right">{t.actions}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {followers && followers.length > 0 ? (
                                    followers.map(follower => (
                                        <TableRow key={follower.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={follower.studentAvatar} />
                                                        <AvatarFallback>{getInitials(follower.studentName)}</AvatarFallback>
                                                    </Avatar>
                                                    {follower.studentName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {follower.followedAt?.toDate().toLocaleDateString(language)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                               <ScheduleSessionDialog student={follower} language={language} user={user} firestore={firestore} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            {t.noStudents}
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
