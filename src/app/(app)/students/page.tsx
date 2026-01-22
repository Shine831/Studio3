
'use client';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/language-context';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { Booking, FollowerRecord, WithId } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/ui/role-guard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}


function ScheduleSessionDialog({ 
    students, 
    language, 
    user, 
    firestore, 
    onSessionCreated, 
    children 
}: { 
    students: WithId<FollowerRecord>[], 
    language: 'fr' | 'en', 
    user: any, 
    firestore: any, 
    onSessionCreated: () => void,
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const t = {
        fr: {
            dialogTitle: students.length > 1 ? "Planifier une session de groupe" : "Planifier une session",
            studentCount: students.length > 1 ? `${students.length} élèves sélectionnés` : students[0]?.studentName,
            subjectLabel: "Matière",
            dateLabel: "Date",
            startTimeLabel: "Heure de début",
            endTimeLabel: "Heure de fin",
            notesLabel: "Notes (optionnel)",
            submit: "Créer la session",
            cancel: "Annuler",
            bookingSuccessTitle: "Session créée !",
            bookingSuccessDesc: "La session a été ajoutée pour tous les élèves sélectionnés.",
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
            dialogTitle: students.length > 1 ? "Schedule Group Session" : "Schedule Session",
            studentCount: students.length > 1 ? `${students.length} students selected` : students[0]?.studentName,
            subjectLabel: "Subject",
            dateLabel: "Date",
            startTimeLabel: "Start Time",
            endTimeLabel: "End Time",
            notesLabel: "Notes (optional)",
            submit: "Create Session",
            cancel: "Cancel",
            bookingSuccessTitle: "Session Created!",
            bookingSuccessDesc: "The session has been added for all selected students.",
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
    
    const form = useForm<z.infer<typeof bookingFormSchema>>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: { subject: '', date: '', startTime: '', endTime: '', notes: '' },
    });

    async function onSubmit(data: z.infer<typeof bookingFormSchema>) {
        if (!user || !user.displayName || !firestore || students.length === 0) return;
        
        try {
            const startDate = new Date(`${data.date}T${data.startTime}`);
            const endDate = new Date(`${data.date}T${data.endTime}`);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error("Invalid date or time value");
            }
            
            const batch = writeBatch(firestore);

            students.forEach(student => {
                const newTutorBookingRef = doc(collection(firestore, 'tutors', user.uid, 'bookings'));
                const newStudentBookingRef = doc(firestore, 'users', student.id, 'bookings', newTutorBookingRef.id);
                const studentNotificationRef = doc(collection(firestore, 'users', student.id, 'notifications'));
                
                const newBooking: Omit<Booking, 'id'> = {
                    studentId: student.id,
                    tutorId: user.uid,
                    studentName: student.studentName,
                    tutorName: user.displayName || 'Tutor',
                    subject: data.subject,
                    startTime: Timestamp.fromDate(startDate),
                    endTime: Timestamp.fromDate(endDate),
                    status: 'confirmed',
                    notes: data.notes || '',
                };
                
                batch.set(newTutorBookingRef, newBooking);
                batch.set(newStudentBookingRef, newBooking);

                batch.set(studentNotificationRef, {
                    userId: student.id,
                    type: 'booking_created',
                    messageFr: `Nouvelle session de ${data.subject} programmée par ${user.displayName} pour le ${format(startDate, 'PPP', { locale: fr })}.`,
                    messageEn: `New ${data.subject} session scheduled by ${user.displayName} for ${format(startDate, 'PPP', { locale: enUS })}.`,
                    sentAt: serverTimestamp(),
                    targetURL: '/my-schedule'
                });
            })

            await batch.commit();

            toast({ title: t.bookingSuccessTitle, description: t.bookingSuccessDesc });
            setOpen(false);
            form.reset();
            onSessionCreated();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: t.bookingErrorTitle, description: t.bookingErrorDesc });
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.dialogTitle}</DialogTitle>
                    <DialogDescription>{t.studentCount}</DialogDescription>
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
                                <FormItem>
                                    <FormLabel>{t.dateLabel}</FormLabel>
                                    <FormControl><Input type="date" {...field} min={new Date().toISOString().split("T")[0]} /></FormControl>
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
    const [selectedStudents, setSelectedStudents] = useState<WithId<FollowerRecord>[]>([]);

    const t = {
        fr: {
            title: "Mes Élèves",
            description: "Voici la liste des élèves qui vous suivent. Cochez les cases pour planifier une session de groupe.",
            scheduleGroup: "Planifier (Groupe)",
            name: "Nom",
            followedOn: "Suivi le",
            actions: "Actions",
            schedule: "Planifier",
            noStudents: "Aucun élève ne vous suit pour le moment.",
            loading: "Chargement des élèves...",
        },
        en: {
            title: "My Students",
            description: "Here is the list of students who are following you. Select checkboxes to schedule a group session.",
            scheduleGroup: "Schedule (Group)",
            name: "Name",
            followedOn: "Followed On",
            actions: "Actions",
            schedule: "Schedule",
            noStudents: "No students are following you yet.",
            loading: "Loading students...",
        }
    }[language];

    const followersRef = useMemoFirebase(
        () => (user ? collection(firestore, 'tutors', user.uid, 'followers') : null),
        [firestore, user]
    );

    const { data: followers, isLoading } = useCollection<FollowerRecord>(followersRef);

    const handleSelectStudent = (student: WithId<FollowerRecord>, isSelected: boolean) => {
        if (isSelected) {
            setSelectedStudents(prev => [...prev, student]);
        } else {
            setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
        }
    };
    
    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected && followers) {
            setSelectedStudents(followers);
        } else {
            setSelectedStudents([]);
        }
    };

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
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
                        <p className="text-muted-foreground">{t.description}</p>
                    </div>
                     <ScheduleSessionDialog 
                        students={selectedStudents} 
                        language={language} 
                        user={user} 
                        firestore={firestore} 
                        onSessionCreated={() => setSelectedStudents([])}
                    >
                        <Button disabled={selectedStudents.length === 0}>{t.scheduleGroup}</Button>
                    </ScheduleSessionDialog>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox 
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                            checked={followers ? selectedStudents.length === followers.length && followers.length > 0 : false}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead>{t.name}</TableHead>
                                    <TableHead>{t.followedOn}</TableHead>
                                    <TableHead className="text-right">{t.actions}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {followers && followers.length > 0 ? (
                                    followers.map(follower => (
                                        <TableRow key={follower.id} data-state={selectedStudents.some(s => s.id === follower.id) && "selected"}>
                                            <TableCell>
                                                <Checkbox 
                                                    onCheckedChange={(checked) => handleSelectStudent(follower, !!checked)}
                                                    checked={selectedStudents.some(s => s.id === follower.id)}
                                                    aria-label={`Select ${follower.studentName}`}
                                                />
                                            </TableCell>
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
                                                 <ScheduleSessionDialog 
                                                    students={[follower]} 
                                                    language={language} 
                                                    user={user} 
                                                    firestore={firestore} 
                                                    onSessionCreated={() => {}}
                                                >
                                                    <Button variant="outline" size="sm">{t.schedule}</Button>
                                                </ScheduleSessionDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
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
