'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, addDoc, setDoc, serverTimestamp, collection, deleteDoc } from 'firebase/firestore';
import { isSameDay } from 'date-fns';

import {
  generatePersonalizedStudyPlan,
} from '@/ai/flows/generate-personalized-study-plan';
import { useLanguage } from '@/context/language-context';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookCopy, PlusCircle, AlertCircle, Zap, ArrowRight, Trash2, MoreVertical } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { type SavedStudyPlan, type WithId, type UserProfile } from '@/lib/types';


// Schema for the form
const StudyPlanFormSchema = z.object({
  subject: z.string().min(2, { message: 'Please enter a subject.' }),
  learningGoals: z
    .string()
    .min(10, { message: 'Please describe your goals in at least 10 characters.' })
    .max(200, { message: 'Goals cannot be longer than 200 characters.' }),
});
type StudyPlanFormValues = z.infer<typeof StudyPlanFormSchema>;

function GeneratePlanDialog({ userProfile, onPlanGenerated }: { userProfile: UserProfile, onPlanGenerated: () => void }) {
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const t = {
    fr: {
      subjectLabel: 'Matière',
      subjectPlaceholder: 'Ex: Mathématiques, Physique, etc.',
      goalsLabel: 'Mes Objectifs d\'Apprentissage',
      goalsPlaceholder: "Ex: Je veux maîtriser les équations différentielles pour mon examen...",
      goalsDescription: "Décrivez ce que vous voulez accomplir.",
      generateButton: "Générer mon Plan",
      generating: "Génération en cours...",
      generationError: "Une erreur est survenue lors de la génération du plan. Veuillez réessayer.",
      noPlanGenerated: "Impossible de générer un plan pour ce sujet. Veuillez essayer une autre matière.",
      close: "Fermer",
      unlimitedAccess: "Le paiement de 1200 FCFA vous donne un accès illimité pour la journée."
    },
    en: {
      subjectLabel: 'Subject',
      subjectPlaceholder: 'E.g., Mathematics, Physics, etc.',
      goalsLabel: 'My Learning Goals',
      goalsPlaceholder: "E.g., I want to master differential equations for my exam...",
      goalsDescription: "Describe what you want to achieve.",
      generateButton: "Generate My Plan",
      generating: "Generating...",
      generationError: "An error occurred while generating the plan. Please try again.",
      noPlanGenerated: "Could not generate a plan for this topic. Please try another subject.",
      close: "Close",
      unlimitedAccess: "Paying 1200 FCFA gives you unlimited access for the day."
    },
  }[language];

  const form = useForm<StudyPlanFormValues>({
    resolver: zodResolver(StudyPlanFormSchema),
    defaultValues: { subject: '', learningGoals: '' },
    mode: 'onChange',
  });

  async function onSubmit(data: StudyPlanFormValues) {
    if (!user || !firestore) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await generatePersonalizedStudyPlan({
        studentId: user.uid,
        subject: data.subject,
        learningGoals: data.learningGoals,
      });

      if (result.isRefusal) {
        setError(result.refusalMessage || t.generationError);
      } else if (result.plan.length === 0) {
        setError(t.noPlanGenerated);
      } else {
        // Save the plan to Firestore
        const plansCollectionRef = collection(firestore, 'users', user.uid, 'studyPlans');
        await addDoc(plansCollectionRef, {
          studentId: user.uid,
          subject: data.subject,
          learningGoals: data.learningGoals,
          lessons: result.plan,
          createdAt: serverTimestamp(),
        });

        // Decrement AI credits
        const userProfileRef = doc(firestore, 'users', user.uid);
        await setDoc(userProfileRef, { aiCredits: (userProfile.aiCredits || 0) - 1 }, { merge: true });

        onPlanGenerated();
        setOpen(false); // Close dialog on success
      }
    } catch (e) {
      console.error(e);
      setError(t.generationError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          {language === 'fr' ? 'Générer un Nouveau Plan' : 'Generate New Plan'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{language === 'fr' ? 'Nouveau Plan d\'Étude' : 'New Study Plan'}</DialogTitle>
          <DialogDescription>
             {language === 'fr' ? 'Décrivez vos objectifs pour une matière et obtenez un plan sur mesure.' : 'Describe your goals for a subject and get a custom plan.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.subjectLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.subjectPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="learningGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.goalsLabel}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t.goalsPlaceholder} className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>{t.goalsDescription}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.close}</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t.generating : t.generateButton}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AiCreditAlert({ language }: { language: 'fr' | 'en' }) {
    const t = {
        fr: {
            noCreditsTitle: "Crédits Quotidiens Épuisés",
            noCreditsDescription: "Vous avez utilisé tous vos crédits pour aujourd'hui. Revenez demain pour en avoir plus !",
            rechargeButton: "Recharger (1200 FCFA)",
            rechargeDescription: "Payez via Orange Money au 699 477 055 pour un accès illimité pour le reste de la journée.",
            unlimitedAccess: "Le paiement de 1200 FCFA vous donne un accès illimité pour la journée."
        },
        en: {
            noCreditsTitle: "Daily Credits Exhausted",
            noCreditsDescription: "You have used all your credits for today. Check back tomorrow for more!",
            rechargeButton: "Recharge (1200 FCFA)",
            rechargeDescription: "Pay via Orange Money to 699 477 055 for unlimited access for the rest of the day.",
            unlimitedAccess: "Paying 1200 FCFA gives you unlimited access for the day."
        }
    }[language];

    return (
        <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>{t.noCreditsTitle}</AlertTitle>
            <AlertDescription>
                {t.noCreditsDescription}
                <div className="mt-4">
                    <Button disabled>
                        {t.rechargeButton}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">{t.rechargeDescription}</p>
                </div>
            </AlertDescription>
        </Alert>
    )
}

export default function StudyPlanPage() {
  const { language } = useLanguage();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const studyPlansRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'studyPlans') : null),
    [firestore, user]
  );

  const { data: savedPlans, isLoading: arePlansLoading, error: plansError } = useCollection<SavedStudyPlan>(studyPlansRef);
  
  const [refreshKey, setRefreshKey] = useState(0);

  const hasCheckedCredits = useRef(false);
  const DAILY_CREDIT_LIMIT = 5;

  useEffect(() => {
    if (!user || !firestore || !userProfile || isProfileLoading || hasCheckedCredits.current) return;

    const checkAndRenewCredits = async () => {
        const now = new Date();
        const lastRenewal = userProfile.lastCreditRenewal;
        const lastRenewalDate = lastRenewal?.toDate ? lastRenewal.toDate() : null;

        if (!lastRenewalDate || !isSameDay(now, lastRenewalDate)) {
            hasCheckedCredits.current = true;
            const userDocRef = doc(firestore, 'users', user.uid);
            try {
                await setDoc(userDocRef, {
                    aiCredits: DAILY_CREDIT_LIMIT,
                    lastCreditRenewal: serverTimestamp(),
                }, { merge: true });
            } catch (error) {
                console.error("Failed to renew credits:", error);
            }
        } else {
            hasCheckedCredits.current = true;
        }
    };

    checkAndRenewCredits();
  }, [user, firestore, userProfile, isProfileLoading]);


  const content = {
    fr: {
        title: "Mes Plans d'Étude",
        description: "Retrouvez ici tous vos plans d'étude générés. Créez-en de nouveaux pour atteindre vos objectifs.",
        noPlans: "Vous n'avez aucun plan d'étude pour le moment.",
        noPlansDesc: "Générez votre premier plan pour commencer à apprendre de manière structurée.",
        loadingPlans: "Chargement de vos plans...",
        viewPlan: "Voir le plan",
        lessons: "leçons",
        errorLoading: "Une erreur est survenue lors du chargement de vos plans.",
        aiCreditsRemaining: "crédits quotidiens restants",
        deletePlan: "Supprimer",
        deleteConfirmTitle: "Êtes-vous sûr ?",
        deleteConfirmDesc: "Cette action est irréversible. Votre plan d'étude sera définitivement supprimé.",
        cancel: "Annuler",
    },
    en: {
        title: "My Study Plans",
        description: "Find all your generated study plans here. Create new ones to achieve your goals.",
        noPlans: "You don't have any study plans yet.",
        noPlansDesc: "Generate your first plan to start learning in a structured way.",
        loadingPlans: "Loading your plans...",
        viewPlan: "View Plan",
        lessons: "lessons",
        errorLoading: "An error occurred while loading your plans.",
        aiCreditsRemaining: "daily credits remaining",
        deletePlan: "Delete",
        deleteConfirmTitle: "Are you sure?",
        deleteConfirmDesc: "This action cannot be undone. This will permanently delete your study plan.",
        cancel: "Cancel",
    },
  };
  const t = content[language];
  
  const isLoading = isUserLoading || isProfileLoading || arePlansLoading;
  const hasCredits = userProfile ? userProfile.aiCredits > 0 : false;

  const handleDeletePlan = async (planId: string) => {
    if (!user) return;
    const planDocRef = doc(firestore, 'users', user.uid, 'studyPlans', planId);
    try {
        await deleteDoc(planDocRef);
    } catch(e) {
        console.error("Error deleting study plan:", e);
    }
  }

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h3 className="text-2xl font-bold font-headline">{t.title}</h3>
            <p className="text-muted-foreground">{t.description}</p>
        </div>
        {hasCredits && userProfile && (
            <div className="text-right">
                <GeneratePlanDialog userProfile={userProfile} onPlanGenerated={() => setRefreshKey(k => k+1)} />
                <p className="text-xs text-muted-foreground mt-1">
                    {userProfile.aiCredits} {t.aiCreditsRemaining}
                </p>
            </div>
        )}
      </div>

      {!hasCredits && <AiCreditAlert language={language} />}
      
      {plansError && (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t.errorLoading}</AlertTitle>
          </Alert>
      )}

      {savedPlans && savedPlans.length > 0 ? (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {savedPlans.map(plan => (
                <Card key={plan.id} className="flex flex-col group">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <CardTitle className="flex items-center gap-3">
                                <BookCopy className="h-6 w-6 text-primary" />
                                {plan.subject}
                            </CardTitle>
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {t.deletePlan}
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t.deleteConfirmDesc}
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePlan(plan.id)} className="bg-destructive hover:bg-destructive/90">
                                        {t.deletePlan}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <CardDescription>{plan.learningGoals}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">
                            {plan.lessons.length} {t.lessons}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href={`/study-plan/${plan.id}`}>
                                {t.viewPlan} <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
             ))}
         </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h4 className="text-lg font-semibold">{t.noPlans}</h4>
            <p className="text-muted-foreground mt-2">{t.noPlansDesc}</p>
        </div>
      )}
    </div>
  );
}
