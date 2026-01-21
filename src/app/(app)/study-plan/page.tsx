'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  generatePersonalizedStudyPlan,
  type GeneratePersonalizedStudyPlanOutput,
} from '@/ai/flows/generate-personalized-study-plan';
import { useLanguage } from '@/context/language-context';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, BookCopy } from 'lucide-react';
import { anglophoneClasses, francophoneClasses } from '@/lib/cameroon-education';

// Schema for the form
const StudyPlanFormSchema = z.object({
  subject: z.string().min(2, { message: 'Please enter a subject.' }),
  gradeLevel: z.string({ required_error: 'Please select your grade level.' }),
  learningGoals: z
    .string()
    .min(10, { message: 'Please describe your goals in at least 10 characters.' })
    .max(200, { message: 'Goals cannot be longer than 200 characters.' }),
});
type StudyPlanFormValues = z.infer<typeof StudyPlanFormSchema>;

interface UserProfile {
  system?: 'francophone' | 'anglophone';
  classLevel?: string;
}

export default function StudyPlanPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const firestore = useFirestore();

  // Fetch user profile to get their system and class level
  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<GeneratePersonalizedStudyPlanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<StudyPlanFormValues>({
    resolver: zodResolver(StudyPlanFormSchema),
    defaultValues: {
      subject: '',
      learningGoals: '',
      gradeLevel: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    // When the user profile is loaded, set the grade level in the form.
    // The form field will then be pre-filled for the user.
    if (userProfile?.classLevel) {
      form.setValue('gradeLevel', userProfile.classLevel);
    }
  }, [userProfile, form]);

  const availableClasses = userProfile?.system === 'anglophone' ? anglophoneClasses : francophoneClasses;

  async function onSubmit(data: StudyPlanFormValues) {
    if (!user) return;
    setIsLoading(true);
    setStudyPlan(null);
    setError(null);

    try {
      const result = await generatePersonalizedStudyPlan({
        studentId: user.uid,
        subject: data.subject,
        gradeLevel: data.gradeLevel,
        learningGoals: data.learningGoals,
      });
      
      if (result.isRefusal) {
        setError(result.refusalMessage || content[language].generationError);
      } else if (result.plan.length === 0) {
        setError(content[language].noPlanGenerated);
      }
      else {
        setStudyPlan(result);
      }

    } catch (e) {
      console.error(e);
      setError(content[language].generationError);
    } finally {
      setIsLoading(false);
    }
  }
  
  const content = {
    fr: {
        title: "Générateur de Plan d'Étude",
        description: "Décrivez vos objectifs pour une matière et obtenez un plan d'étude sur mesure.",
        subjectLabel: 'Matière',
        subjectPlaceholder: 'Ex: Mathématiques, Physique, etc.',
        gradeLevelLabel: 'Niveau Scolaire',
        gradeLevelPlaceholder: 'Confirmez votre classe',
        goalsLabel: 'Mes Objectifs d\'Apprentissage',
        goalsPlaceholder: "Ex: Je veux maîtriser les équations différentielles pour mon examen...",
        goalsDescription: "Décrivez ce que vous voulez accomplir.",
        generateButton: "Générer mon Plan",
        generating: "Génération en cours...",
        generatedPlanTitle: "Votre Plan d'Étude",
        exploreCourses: "Explorer les cours",
        minutes: "minutes",
        generationError: "Une erreur est survenue lors de la génération du plan. Veuillez réessayer.",
        noPlanGenerated: "Impossible de générer un plan pour ce sujet. Veuillez essayer une autre matière.",
        backToForm: "Modifier mes objectifs",
    },
    en: {
        title: "Study Plan Generator",
        description: "Describe your goals for a subject and get a custom-made study plan.",
        subjectLabel: 'Subject',
        subjectPlaceholder: 'E.g., Mathematics, Physics, etc.',
        gradeLevelLabel: 'Grade Level',
        gradeLevelPlaceholder: 'Confirm your class',
        goalsLabel: 'My Learning Goals',
        goalsPlaceholder: "E.g., I want to master differential equations for my exam...",
        goalsDescription: "Describe what you want to achieve.",
        generateButton: "Generate My Plan",
        generating: "Generating...",
        generatedPlanTitle: "Your Study Plan",
        exploreCourses: "Explore Courses",
        minutes: "minutes",
        generationError: "An error occurred while generating the plan. Please try again.",
        noPlanGenerated: "Could not generate a plan for this topic. Please try another subject.",
        backToForm: "Edit my goals",
    },
  };
  const t = content[language];


  if (isProfileLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (studyPlan) {
    return (
        <div className="space-y-6">
            <div className='flex justify-between items-start'>
                <div>
                    <h3 className="text-2xl font-bold font-headline">{t.generatedPlanTitle}</h3>
                    <p className="text-muted-foreground">{form.getValues('subject')} - {form.getValues('learningGoals')}</p>
                </div>
                <Button variant="outline" onClick={() => setStudyPlan(null)}>{t.backToForm}</Button>
            </div>
            {studyPlan.plan.length > 0 ? (
                 <Accordion type="single" collapsible className="w-full">
                    {studyPlan.plan.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <div className='flex items-center gap-4 text-left'>
                                    <BookCopy className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className='font-semibold'>{item.title}</p>
                                        <p className='text-sm text-muted-foreground font-normal'>{item.description}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex items-center justify-between p-4 rounded-md">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{item.duration} {t.minutes}</span>
                                    </div>
                                    <Button asChild>
                                      <Link href="/courses">{t.exploreCourses}</Link>
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
            ) : (
                <p>{t.noPlanGenerated}</p>
            )}
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold font-headline">{t.title}</h3>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.gradeLevelLabel}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!userProfile?.system}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t.gradeLevelPlaceholder} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {availableClasses.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            <Textarea
                            placeholder={t.goalsPlaceholder}
                            className="resize-none"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>{t.goalsDescription}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? t.generating : t.generateButton}
                </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
