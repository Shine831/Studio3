'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

import { useCollection, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import type { BugReport, WithId } from '@/lib/types';

import { RoleGuard } from '@/components/role-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Bug, Calendar, User, Info, Link as LinkIcon, MonitorSmartphone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const dynamic = 'force-dynamic';

export default function AdminBugsPage() {
  const firestore = useFirestore();
  const { language } = useLanguage();
  const { toast } = useToast();

  const bugsRef = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'bug_reports'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: bugs, isLoading, error } = useCollection<BugReport>(bugsRef);

  const t = {
    fr: {
      title: 'Gestion des Bugs',
      description: 'Examinez et gérez les rapports de bugs soumis par les utilisateurs.',
      status: 'Statut',
      new: 'Nouveau',
      inProgress: 'En cours',
      resolved: 'Résolu',
      reportedBy: 'Signalé par',
      date: 'Date',
      url: 'URL',
      userAgent: 'User Agent',
      loading: 'Chargement des rapports...',
      error: 'Erreur de chargement des rapports.',
      noBugs: 'Aucun rapport de bug trouvé.',
      successTitle: 'Statut mis à jour !',
      successDesc: 'Le statut du rapport a été modifié.',
      errorTitle: 'Erreur de mise à jour',
      errorDesc: 'Impossible de mettre à jour le statut.',
    },
    en: {
      title: 'Bug Management',
      description: 'Review and manage bug reports submitted by users.',
      status: 'Status',
      new: 'New',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      reportedBy: 'Reported by',
      date: 'Date',
      url: 'URL',
      userAgent: 'User Agent',
      loading: 'Loading reports...',
      error: "Error loading reports.",
      noBugs: "No bug reports found.",
      successTitle: 'Status Updated!',
      successDesc: "The report's status has been changed.",
      errorTitle: 'Update Error',
      errorDesc: 'Could not update status.',
    },
  }[language];

  const handleStatusChange = (reportId: string, newStatus: BugReport['status']) => {
    if (!firestore) return;
    const reportDocRef = doc(firestore, 'bug_reports', reportId);
    const updatedData = { status: newStatus };

    updateDoc(reportDocRef, updatedData)
      .then(() => {
        toast({
          title: t.successTitle,
          description: t.successDesc,
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: reportDocRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: 'destructive',
            title: t.errorTitle,
            description: t.errorDesc,
        });
      });
  };

  const getStatusBadgeVariant = (status: BugReport['status']) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'in-progress': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };
  
  const getStatusText = (status: BugReport['status']) => {
    switch (status) {
        case 'new': return t.new;
        case 'in-progress': return t.inProgress;
        case 'resolved': return t.resolved;
        default: return status;
    }
  }


  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
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
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-2">
            <Bug className="h-7 w-7" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>

        {bugs && bugs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(bugs as WithId<BugReport>[]).map((bug) => (
              <Card key={bug.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-semibold leading-snug">{bug.description}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(bug.status)} className="whitespace-nowrap">
                        {getStatusText(bug.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{t.reportedBy}: {bug.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{t.date}: {bug.createdAt?.toDate ? format(bug.createdAt.toDate(), 'PPpp', { locale: language === 'fr' ? fr : enUS }) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        <a href={bug.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{t.url}: {bug.url}</a>
                    </div>
                     <div className="flex items-start gap-2">
                        <MonitorSmartphone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="text-xs break-all">
                            <span className="font-medium">{t.userAgent}:</span> {bug.userAgent}
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="w-full">
                        <label className="text-xs text-muted-foreground">{t.status}</label>
                        <Select onValueChange={(value: BugReport['status']) => handleStatusChange(bug.id, value)} defaultValue={bug.status}>
                            <SelectTrigger>
                                <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">{t.new}</SelectItem>
                                <SelectItem value="in-progress">{t.inProgress}</SelectItem>
                                <SelectItem value="resolved">{t.resolved}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Bug className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-semibold">{t.noBugs}</h4>
            </div>
        )}
      </div>
    </RoleGuard>
  );
}
