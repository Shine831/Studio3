// src/app/(app)/students/page.tsx
'use client';

import { useLanguage } from '@/context/language-context';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { FollowerRecord } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RoleGuard } from '@/components/role-guard';

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
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
            contact: "Contacter",
            schedule: "Planifier",
            noStudents: "Aucun élève ne vous suit pour le moment.",
            loading: "Chargement des élèves...",
        },
        en: {
            title: "My Students",
            description: "Here is the list of students who are following you.",
            name: "Name",
            followedOn: "Followed On",
            actions: "Actions",
            contact: "Contact",
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
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href="/schedule">{t.schedule}</Link>
                                                </Button>
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

    