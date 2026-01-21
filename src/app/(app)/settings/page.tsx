'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, setDoc } from 'firebase/firestore';

import {
  useFirestore,
  useUser,
  useDoc,
  useMemoFirebase,
} from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cameroonCities } from '@/lib/cameroon-cities';

const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email(),
  system: z.enum(['francophone', 'anglophone']).optional(),
  city: z.string().optional(),
  // Tutor-specific fields
  whatsapp: z.string().optional(),
  classes: z.string().optional(),
  monthlyRate: z.coerce.number().positive().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      system: userProfile?.system,
      city: userProfile?.city || '',
      whatsapp: userProfile?.whatsapp || '',
      classes: userProfile?.classes?.join(', ') || '',
      monthlyRate: userProfile?.monthlyRate || 0,
    },
    mode: 'onChange',
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!userProfileRef) return;
    try {
      const dataToSave: Partial<ProfileFormValues> & { classes?: string[] } = { ...data };
      if (userProfile?.role === 'tutor' && data.classes) {
        dataToSave.classes = data.classes.split(',').map(c => c.trim()).filter(Boolean);
      } else {
        delete dataToSave.classes;
      }
      
      if (userProfile?.role !== 'tutor') {
        delete dataToSave.monthlyRate;
        delete dataToSave.whatsapp;
      }

      await setDoc(userProfileRef, dataToSave, { merge: true });
      toast({
        title: content[language].updateSuccessTitle,
        description: content[language].updateSuccessDesc,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: content[language].updateErrorTitle,
        description: error.message,
      });
    }
  }

  const content = {
    fr: {
      title: 'Paramètres du Profil',
      description: 'Gérez les paramètres et les préférences de votre compte.',
      formTitle: 'Informations Personnelles',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      city: 'Ville',
      cityPlaceholder: 'Choisissez votre ville',
      system: 'Système Éducatif',
      systemPlaceholder: 'Choisissez un système',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
      whatsapp: 'Numéro WhatsApp',
      whatsappDesc: 'Visible par les étudiants qui vous contactent.',
      classes: 'Classes Enseignées',
      classesDesc: 'Séparez les classes par une virgule (ex: 6ème, 5ème).',
      monthlyRate: 'Tarif Mensuel (par matière)',
      monthlyRatePlaceholder: "Ex: 25000",
      updateButton: 'Mettre à jour le profil',
      updateSuccessTitle: 'Profil mis à jour',
      updateSuccessDesc: 'Vos informations ont été sauvegardées avec succès.',
      updateErrorTitle: 'Erreur',
    },
    en: {
      title: 'Profile Settings',
      description: 'Manage your account settings and preferences.',
      formTitle: 'Personal Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      city: 'City',
      cityPlaceholder: 'Select your city',
      system: 'Educational System',
      systemPlaceholder: 'Select a system',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
      whatsapp: 'WhatsApp Number',
      whatsappDesc: 'Visible to students who contact you.',
      classes: 'Classes Taught',
      classesDesc: 'Separate classes with a comma (e.g., Form 1, Form 2).',
      monthlyRate: 'Monthly Rate (per subject)',
      monthlyRatePlaceholder: "E.g., 25000",
      updateButton: 'Update Profile',
      updateSuccessTitle: 'Profile Updated',
      updateSuccessDesc: 'Your information has been successfully saved.',
      updateErrorTitle: 'Error',
    },
  };

  const t = content[language];

  if (isProfileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Separator />
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-headline">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.description}</p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <h4 className="text-md font-medium">{t.formTitle}</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.firstName}</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.lastName}</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.email}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="m@example.com" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
                control={form.control}
                name="system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.system}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.systemPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="francophone">{t.francophone}</SelectItem>
                        <SelectItem value="anglophone">{t.anglophone}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.city}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.cityPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cameroonCities.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          
          {userProfile?.role === 'tutor' && (
            <>
                <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t.whatsapp}</FormLabel>
                    <FormControl>
                        <Input placeholder="+237 6XX XXX XXX" {...field} />
                    </FormControl>
                    <FormDescription>{t.whatsappDesc}</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="monthlyRate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t.monthlyRate} (FCFA)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder={t.monthlyRatePlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="classes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t.classes}</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., 6ème, 5ème, Form 1, Form 2" {...field} />
                        </FormControl>
                         <FormDescription>{t.classesDesc}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </>
          )}

          <Button type="submit">{t.updateButton}</Button>
        </form>
      </Form>
    </div>
  );
}
