
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';

import {
  useFirestore,
  useUser,
  useDoc,
  FirestorePermissionError,
  errorEmitter,
} from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import type { UserProfile } from '@/lib/types';
import { Camera } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const profileFormSchema = z.object({
  profilePicture: z.string().optional(),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email(),
  system: z.enum(['francophone', 'anglophone']),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const userProfileRef = useMemo(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      system: 'francophone',
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
        system: userProfile.system || 'francophone',
        profilePicture: userProfile.profilePicture || '',
      };
      
      form.reset(defaultVals as ProfileFormValues);
      setPreview(userProfile.profilePicture || null);
    }
  }, [userProfile, form]);
  
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
        profilePicture: data.profilePicture,
        system: data.system,
    };

    updateDoc(userProfileRef, { ...userProfileData })
      .then(() => {
        toast({
          title: content[language].updateSuccessTitle,
          description: content[language].updateSuccessDesc,
        });
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'update',
          requestResourceData: userProfileData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: content[language].updateErrorTitle,
          description: error.message,
        });
      });
  }

  const content = {
    fr: {
      title: 'Paramètres du Profil',
      description: 'Gérez les paramètres et les préférences de votre compte.',
      formTitle: 'Informations Personnelles',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      system: 'Système Éducatif',
      systemPlaceholder: 'Choisissez un système',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
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
      system: 'Educational System',
      systemPlaceholder: 'Select a system',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
      updateButton: 'Update Profile',
      updateSuccessTitle: 'Profile Updated',
      updateSuccessDesc: 'Your information has been successfully saved.',
      updateErrorTitle: 'Update Error',
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
                      <Select onValueChange={field.onChange} value={field.value || ''}>
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
          </div>
         
          <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>{t.updateButton}</Button>
        </form>
      </Form>
    </div>
  );
}
