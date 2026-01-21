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

const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email(),
  // Student-specific fields
  dateOfBirth: z.string().optional(),
  system: z.enum(['francophone', 'anglophone']).optional(),
  // Tutor-specific fields
  whatsapp: z.string().optional(),
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
      dateOfBirth: userProfile?.dateOfBirth || '',
      system: userProfile?.system,
      whatsapp: userProfile?.whatsapp || '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!userProfileRef) return;
    try {
      await setDoc(userProfileRef, data, { merge: true });
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
      dob: 'Date de naissance',
      system: 'Système Éducatif',
      systemPlaceholder: 'Choisissez un système',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
      whatsapp: 'Numéro WhatsApp',
      whatsappDesc: 'Visible par les étudiants qui réservent une session.',
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
      dob: 'Date of Birth',
      system: 'Educational System',
      systemPlaceholder: 'Select a system',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
      whatsapp: 'WhatsApp Number',
      whatsappDesc: 'Visible to students who book a session.',
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

          {userProfile?.role === 'student' && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t.dob}</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} value={field.value || ''}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>
            </>
          )}

          {userProfile?.role === 'tutor' && (
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
          )}

          <Button type="submit">{t.updateButton}</Button>
        </form>
      </Form>
    </div>
  );
}
