'use client';

import { useMemo } from 'react';
import { collection, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

import { useCollection, useFirestore } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { hasUnlimitedAccess } from '@/lib/utils';

import { RoleGuard } from '@/components/role-guard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ShieldCheck, Users } from 'lucide-react';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { language } = useLanguage();
  const { toast } = useToast();

  const usersRef = useMemo(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading, error } = useCollection<UserProfile>(usersRef);

  const t = {
    fr: {
      title: 'Gestion des Utilisateurs',
      description: "Activez l'accès illimité pour les utilisateurs ayant payé.",
      name: 'Nom',
      email: 'Email',
      system: 'Système',
      lastLogin: 'Dernière Connexion',
      status: 'Statut',
      action: 'Action',
      grantAccess: 'Activer Accès',
      accessGranted: 'Accès Illimité',
      loading: 'Chargement des utilisateurs...',
      error: "Erreur de chargement des utilisateurs.",
      noUsers: "Aucun utilisateur trouvé.",
      successTitle: "Accès Activé !",
      successDesc: "L'utilisateur a maintenant un accès illimité pour aujourd'hui.",
      errorTitle: "Erreur d'activation",
      errorDesc: "Impossible de mettre à jour l'utilisateur.",
      active: "Actif",
      inactive: "Inactif",
    },
    en: {
      title: 'User Management',
      description: 'Grant unlimited access to users who have paid.',
      name: 'Name',
      email: 'Email',
      system: 'System',
      lastLogin: 'Last Login',
      status: 'Status',
      action: 'Action',
      grantAccess: 'Grant Access',
      accessGranted: 'Unlimited Access',
      loading: 'Loading users...',
      error: "Error loading users.",
      noUsers: "No users found.",
      successTitle: "Access Granted!",
      successDesc: "The user now has unlimited access for today.",
      errorTitle: "Activation Error",
      errorDesc: "Could not update the user.",
      active: "Active",
      inactive: "Inactive",
    },
  }[language];

  const handleGrantAccess = async (userId: string) => {
    const userDocRef = doc(firestore, 'users', userId);
    try {
      await updateDoc(userDocRef, {
        aiCredits: Infinity,
        lastCreditRenewal: serverTimestamp(),
      });
      toast({
        title: t.successTitle,
        description: t.successDesc,
      });
    } catch (e) {
      console.error("Failed to grant access:", e);
      toast({
        variant: 'destructive',
        title: t.errorTitle,
        description: t.errorDesc,
      });
    }
  };

  if (isLoading) {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </RoleGuard>
    );
  }

  if (error) {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t.error}</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        </RoleGuard>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-2">
            <Users className="h-7 w-7" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.email}</TableHead>
                  <TableHead>{t.system}</TableHead>
                  <TableHead>{t.lastLogin}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{t.action}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{`${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.system}</TableCell>
                      <TableCell>
                        {user.lastLogin?.toDate ? format(user.lastLogin.toDate(), 'PPpp', { locale: language === 'fr' ? fr : enUS }) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {hasUnlimitedAccess(user) ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            {t.active}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{t.inactive}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleGrantAccess(user.id)}
                          disabled={hasUnlimitedAccess(user)}
                        >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {hasUnlimitedAccess(user) ? t.accessGranted : t.grantAccess}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">{t.noUsers}</TableCell>
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
