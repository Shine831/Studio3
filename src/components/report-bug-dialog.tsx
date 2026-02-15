'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { useFirestore, useUser, FirestorePermissionError, errorEmitter } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const ReportBugSchema = z.object({
  description: z.string().min(10, { message: 'Please describe the bug in at least 10 characters.' }).max(1000),
});

type ReportBugValues = z.infer<typeof ReportBugSchema>;

export function ReportBugDialog({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    fr: {
      title: "Signaler un Bug",
      description: "Aidez-nous à améliorer RéviseCamer. Décrivez le bug que vous avez rencontré.",
      formLabel: "Description du bug",
      formPlaceholder: "Veuillez décrire le problème en détail...",
      submit: "Envoyer le rapport",
      submitting: "Envoi...",
      cancel: "Annuler",
      successTitle: "Rapport envoyé !",
      successDesc: "Merci pour votre aide. Nous allons examiner ce problème.",
      errorTitle: "Erreur",
      errorDesc: "Impossible d'envoyer le rapport. Veuillez réessayer.",
    },
    en: {
      title: "Report a Bug",
      description: "Help us improve RéviseCamer. Describe the bug you encountered.",
      formLabel: "Bug Description",
      formPlaceholder: "Please describe the issue in detail...",
      submit: "Send Report",
      submitting: "Sending...",
      cancel: "Cancel",
      successTitle: "Report Sent!",
      successDesc: "Thank you for your help. We will look into this issue.",
      errorTitle: "Error",
      errorDesc: "Could not send the report. Please try again.",
    }
  }[language];

  const form = useForm<ReportBugValues>({
    resolver: zodResolver(ReportBugSchema),
    defaultValues: { description: '' },
  });

  async function onSubmit(data: ReportBugValues) {
    if (!user || !firestore) return;
    setIsLoading(true);

    const reportsCollection = collection(firestore, 'bug_reports');
    const reportData = {
      description: data.description,
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
      status: 'new',
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    addDoc(reportsCollection, reportData)
      .then(() => {
        toast({ title: t.successTitle, description: t.successDesc });
        form.reset();
        setOpen(false);
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: reportsCollection.path,
          operation: 'create',
          requestResourceData: reportData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: t.errorTitle, description: t.errorDesc });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.formLabel}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t.formPlaceholder} {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.cancel}</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? t.submitting : t.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}