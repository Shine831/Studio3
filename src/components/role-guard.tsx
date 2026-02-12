'use client';
import { useUser, useDoc, useFirestore } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from './ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

interface RoleGuardProps {
  allowedRoles: Array<'student' | 'admin'>;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { language } = useLanguage();
  
  const userProfileRef = useMemo(() => (user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  const t = {
      fr: {
          loading: "Vérification des permissions...",
          unauthorized: "Accès non autorisé",
          unauthorizedDesc: "Vous n'avez pas la permission de voir cette page."
      },
      en: {
          loading: "Verifying permissions...",
          unauthorized: "Unauthorized Access",
          unauthorizedDesc: "You do not have permission to view this page."
      }
  }[language]

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (!userProfile || !allowedRoles.includes(userProfile.role)) {
    return (
        <Card className="mt-10">
            <CardHeader className="text-center">
                <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="mt-4">{t.unauthorized}</CardTitle>
                <CardDescription>{t.unauthorizedDesc}</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return <>{children}</>;
}
