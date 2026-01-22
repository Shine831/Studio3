'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import Link from 'next/link';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import type { TutorProfile, FollowingRecord, WithId } from '@/lib/types';
import { RoleGuard } from '@/components/role-guard';
import { Skeleton } from '@/components/ui/skeleton';
import { TutorCard } from '@/components/tutor-card';
import { Button } from '@/components/ui/button';

export default function MyTutorsPage() {
    const { language } = useLanguage();
    const { user } = useUser();
    const firestore = useFirestore();
    const [tutorProfiles, setTutorProfiles] = useState<WithId<TutorProfile>[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

    const t = {
        fr: {
            title: "Mes Répétiteurs",
            description: "Voici la liste des répétiteurs que vous suivez.",
            noTutors: "Vous ne suivez aucun répétiteur pour le moment.",
            browseTutors: "Parcourir les répétiteurs",
        },
        en: {
            title: "My Tutors",
            description: "Here is the list of tutors you are following.",
            noTutors: "You are not following any tutors yet.",
            browseTutors: "Browse Tutors",
        }
    }[language];

    const followingQuery = useMemoFirebase(
        () => user ? collection(firestore, 'users', user.uid, 'following') : null,
        [firestore, user]
    );
    const { data: following, isLoading: isLoadingFollowing } = useCollection<FollowingRecord>(followingQuery);

    useEffect(() => {
        if (!firestore) return;
        
        if (isLoadingFollowing) return;

        if (!following || following.length === 0) {
            setTutorProfiles([]);
            setIsLoadingProfiles(false);
            return;
        }

        const fetchTutorProfiles = async () => {
            setIsLoadingProfiles(true);
            const tutorIds = following.map(f => f.tutorId);
            
            try {
                // Firestore 'in' query is limited to 30 elements at a time.
                // We'll have to batch if it's more than 30.
                const tutorBatches: string[][] = [];
                for (let i = 0; i < tutorIds.length; i += 30) {
                    tutorBatches.push(tutorIds.slice(i, i + 30));
                }

                const profilePromises = tutorBatches.map(batch => {
                    const tutorsRef = collection(firestore, 'tutors');
                    const q = query(tutorsRef, where(documentId(), 'in', batch));
                    return getDocs(q);
                });

                const querySnapshots = await Promise.all(profilePromises);
                const profiles = querySnapshots.flatMap(snapshot => 
                    snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<TutorProfile>))
                );
                
                setTutorProfiles(profiles);
            } catch (error) {
                console.error("Error fetching tutor profiles: ", error);
                setTutorProfiles([]);
            } finally {
                setIsLoadingProfiles(false);
            }
        };

        fetchTutorProfiles();
    }, [following, firestore, isLoadingFollowing]);

    const isLoading = isLoadingFollowing || isLoadingProfiles;

    return (
        <RoleGuard allowedRoles={['student', 'admin']}>
            <div className="flex flex-1 flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{t.title}</h1>
                    <p className="text-muted-foreground">{t.description}</p>
                </div>
                
                {isLoading ? (
                    <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-56 w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : tutorProfiles.length > 0 ? (
                    <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tutorProfiles.map((tutor) => (
                            <TutorCard key={tutor.id} tutor={tutor} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-20">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                {t.noTutors}
                            </h3>
                            <Button variant="link" asChild>
                                <Link href="/tutors">{t.browseTutors}</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}
