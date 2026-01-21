
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, setDoc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';

import {
  useFirestore,
  useUser,
  useDoc,
  useMemoFirebase,
} from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import type { UserProfile, TutorProfile, WithId } from '@/lib/types';
import { Camera } from 'lucide-react';

const profileFormSchema = z.object({
  profilePicture: z.string().optional(),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email(),
  system: z.enum(['francophone', 'anglophone']).optional(),
  city: z.string().optional(),
  // Tutor-specific fields
  subjects: z.string().optional(),
  whatsapp: z.string().optional(),
  classes: z.string().optional(),
  monthlyRate: z.coerce.number().positive().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
}


export default function SettingsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userProfileRef);
  
  const tutorProfileRef = useMemoFirebase(
    () => (user && userProfile?.role === 'tutor' ? doc(firestore, 'tutors', user.uid) : null),
    [firestore, user, userProfile?.role]
  );
  const { data: tutorProfile, isLoading: isTutorProfileLoading } = useDoc<WithId<TutorProfile>>(tutorProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      system: undefined,
      city: '',
      subjects: '',
      whatsapp: '',
      classes: '',
      monthlyRate: 0,
      profilePicture: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (userProfile) {
      const defaultVals: Partial<ProfileFormValues> = {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        system: userProfile.system || undefined, // Ensure undefined if falsy
        city: userProfile.city || '',
        profilePicture: userProfile.profilePicture || '',
      };

      if (userProfile.role === 'tutor') {
        defaultVals.subjects = (tutorProfile && Array.isArray(tutorProfile.subjects)) ? tutorProfile.subjects.join(', ') : '';
        defaultVals.whatsapp = tutorProfile?.whatsapp || '';
        defaultVals.classes = (tutorProfile && Array.isArray(tutorProfile.classes)) ? tutorProfile.classes.join(', ') : '';
        defaultVals.monthlyRate = tutorProfile?.monthlyRate ?? 0;
      }
      
      form.reset(defaultVals);
      setPreview(userProfile.profilePicture || null);
    }
  }, [userProfile, tutorProfile]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        form.setValue('profilePicture', result, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };


  async function onSubmit(data: ProfileFormValues) {
    if (!userProfileRef || !user || !firestore) return;
    
    const userProfileData: Partial<UserProfile> = {
        firstName: data.firstName,
        lastName: data.lastName,
        system: data.system,
        city: data.city,
        profilePicture: data.profilePicture
    };

    try {
      await updateDoc(userProfileRef, { ...userProfileData });

      if (userProfile?.role === 'tutor' && tutorProfileRef) {
        const tutorDoc = await getDoc(tutorProfileRef);
        const tutorDataToUpdate: Partial<TutorProfile> = {
          userId: user.uid,
          name: `${data.firstName} ${data.lastName}`,
          avatarUrl: data.profilePicture,
          whatsapp: data.whatsapp,
          monthlyRate: data.monthlyRate,
          subjects: data.subjects?.split(',').map(s => s.trim()).filter(Boolean),
          classes: data.classes?.split(',').map(c => c.trim()).filter(Boolean),
          city: data.city,
          system: data.system as 'francophone' | 'anglophone' | 'both' | undefined,
        };
        
        if (tutorDoc.exists()) {
             await updateDoc(tutorProfileRef, tutorDataToUpdate);
        } else {
             await setDoc(tutorProfileRef, {
                ...tutorDataToUpdate,
                id: user.uid,
                availability: 'Non définie',
                rating: 0,
                reviewsCount: 0,
                followersCount: 0,
                adminVerified: false,
             });
        }
      }

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
      subjectsLabel: 'Matières Enseignées',
      subjectsPlaceholder: 'Ex: Mathématiques, Physique...',
      subjectsDesc: 'Séparez les matières par une virgule.',
      classes: 'Classes Enseignées',
      classesDesc: 'Séparez les classes par une virgule (ex: 6ème, 5ème).',
      monthlyRate: 'Tarif Mensuel (par matière)',
      monthlyRatePlaceholder: "Ex: 25000",
      updateButton: 'Mettre à jour le profil',
      updateSuccessTitle: 'Profil mis à jour',
      updateSuccessDesc: 'Vos informations ont été sauvegardées avec succès.',
      updateErrorTitle: 'Erreur de mise à jour',
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
      subjectsLabel: 'Subjects Taught',
      subjectsPlaceholder: 'E.g., Mathematics, Physics...',
      subjectsDesc: 'Separate subjects with a comma.',
      classes: 'Classes Taught',
      classesDesc: 'Separate classes with a comma (e.g., Form 1, Form 2).',
      monthlyRate: 'Monthly Rate (per subject)',
      monthlyRatePlaceholder: "E.g., 25000",
      updateButton: 'Update Profile',
      updateSuccessTitle: 'Profile Updated',
      updateSuccessDesc: 'Your information has been successfully saved.',
      updateErrorTitle: 'Update Error',
    },
  };

  const t = content[language];

  if (isProfileLoading || (userProfile?.role === 'tutor' && isTutorProfileLoading)) {
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
  
  if (profileError) {
      return <p>Error loading profile.</p>
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
            <div className="flex items-center gap-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                />
                <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={preview || undefined} />
                        <AvatarFallback className="text-3xl">
                            {getInitials(form.watch('firstName') + ' ' + form.watch('lastName'))}
                        </AvatarFallback>
                    </Avatar>
                     <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                        onClick={() => fileInputRef.current?.click()}
                        >
                        <Camera className="h-4 w-4" />
                    </Button>
                </div>
                 <h4 className="text-md font-medium">{t.formTitle}</h4>
            </div>

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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    name="subjects"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t.subjectsLabel}</FormLabel>
                        <FormControl>
                            <Textarea placeholder={t.subjectsPlaceholder} {...field} />
                        </FormControl>
                         <FormDescription>{t.subjectsDesc}</FormDescription>
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

          <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>{t.updateButton}</Button>
        </form>
      </Form>
    </div>
  );
}
