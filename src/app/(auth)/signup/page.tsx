'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, Firestore } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { francophoneClasses, anglophoneClasses } from '@/lib/cameroon-education';
import { Skeleton } from '@/components/ui/skeleton';

const createNewUserDocument = async (
  firestore: Firestore,
  user: User,
  {
    fullName,
    role,
    system,
    classLevel,
    whatsapp,
  }: {
    fullName: string;
    role: 'student' | 'tutor';
    system: 'francophone' | 'anglophone';
    classLevel?: string;
    whatsapp?: string;
  }
) => {
  const userRef = doc(firestore, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
      const [firstName, ...lastNameParts] = (user.displayName || fullName || '').split(' ');
      const lastName = lastNameParts.join(' ');
      const userData: { [key: string]: any } = {
          id: user.uid,
          email: user.email,
          firstName: firstName || '',
          lastName: lastName || '',
          profilePicture: user.photoURL || null,
          role: role,
          system: system,
          language: 'fr',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
      };
      
      if (role === 'student') {
        userData.classLevel = classLevel;
      }
      if (role === 'tutor') {
        userData.whatsapp = whatsapp;
      }

      await setDoc(userRef, userData);
  } else {
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  }
};

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [system, setSystem] = useState<'francophone' | 'anglophone' | ''>('');
  const [classLevel, setClassLevel] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { auth, firestore, isUserLoading: isFirebaseLoading } = useFirebase();
  const { language } = useLanguage();

  const content = {
    fr: {
      createAccount: 'Créer un compte',
      enterInfo: 'Entrez vos informations pour créer un compte',
      fullNameLabel: 'Nom complet',
      fullNamePlaceholder: 'Votre Nom',
      emailLabel: 'Email',
      passwordLabel: 'Mot de passe',
      iAmA: 'Je suis un(e)',
      student: 'Élève',
      tutor: 'Répétiteur',
      systemLabel: 'Système Éducatif',
      systemPlaceholder: 'Choisissez votre système',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
      classLevelLabel: 'Classe',
      classLevelPlaceholder: 'Choisissez votre classe',
      whatsappLabel: 'Numéro WhatsApp',
      whatsappPlaceholder: '+237 6XX XXX XXX',
      createAccountButton: 'Créer un compte',
      initializing: 'Initialisation...',
      alreadyHaveAccount: 'Vous avez déjà un compte ?',
      login: 'Se connecter',
      terms: 'Conditions d\'utilisation',
      privacy: 'Politique de confidentialité',
      byClicking: 'En cliquant sur continuer, vous acceptez nos',
      and: 'et',
      accountCreatedTitle: 'Compte créé',
      accountCreatedDesc: 'Bienvenue ! Votre inscription est terminée.',
      signupFailedTitle: 'Échec de l\'inscription',
      errorFillFields: 'Veuillez remplir tous les champs.',
      errorSelectSystem: 'Veuillez sélectionner un système éducatif.',
      errorSelectClass: 'Veuillez sélectionner votre classe.',
      errorWhatsapp: 'Veuillez entrer un numéro WhatsApp.',
      errorPasswordLength: 'Le mot de passe doit contenir au moins 6 caractères.',
      errorEmailInUse: 'Cette adresse email est déjà utilisée par un autre compte.',
      errorWeakPassword: 'Le mot de passe est trop faible. Veuillez utiliser un mot de passe plus fort.',
      errorInvalidEmail: 'L\'adresse email n\'est pas valide.',
      errorFirebaseConfig: 'La configuration de Firebase est manquante. L\'application n\'est pas correctement connectée à Firebase.',
      errorUnexpected: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      headsUp: 'Attention !',
    },
    en: {
      createAccount: 'Create an account',
      enterInfo: 'Enter your information to create an account',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'Your Name',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      iAmA: 'I am a',
      student: 'Student',
      tutor: 'Tutor',
      systemLabel: 'Educational System',
      systemPlaceholder: 'Select your system',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
      classLevelLabel: 'Class Level',
      classLevelPlaceholder: 'Select your class',
      whatsappLabel: 'WhatsApp Number',
      whatsappPlaceholder: '+237 6XX XXX XXX',
      createAccountButton: 'Create account',
      initializing: 'Initializing...',
      alreadyHaveAccount: 'Already have an account?',
      login: 'Log in',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      byClicking: 'By clicking continue, you agree to our',
      and: 'and',
      accountCreatedTitle: 'Account Created',
      accountCreatedDesc: "Welcome! You're now signed up.",
      signupFailedTitle: 'Signup Failed',
      errorFillFields: 'Please fill in all fields.',
      errorSelectSystem: 'Please select an educational system.',
      errorSelectClass: 'Please select your class level.',
      errorWhatsapp: 'Please enter a WhatsApp number.',
      errorPasswordLength: 'Password must be at least 6 characters long.',
      errorEmailInUse: 'This email address is already in use by another account.',
      errorWeakPassword: 'The password is too weak. Please use a stronger password.',
      errorInvalidEmail: 'The email address is not valid.',
      errorFirebaseConfig: 'Firebase configuration is missing. The app is not properly connected to Firebase.',
      errorUnexpected: 'An unexpected error occurred. Please try again.',
      headsUp: 'Heads up!',
    }
  };

  const t = content[language];

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!auth || !firestore) {
      setError(t.errorFirebaseConfig);
      return;
    }
    if (!fullName || !email || !password || !role || !system) {
      setError(t.errorFillFields);
      return;
    }
    if (role === 'student' && !classLevel) {
      setError(t.errorSelectClass);
      return;
    }
    if (role === 'tutor' && !whatsapp) {
        setError(t.errorWhatsapp);
        return;
    }
    if (password.length < 6) {
        setError(t.errorPasswordLength);
        return;
    }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      
      await createNewUserDocument(firestore, userCredential.user, {
          fullName,
          role,
          system: system as 'francophone' | 'anglophone',
          classLevel,
          whatsapp,
      });

      toast({
        title: t.accountCreatedTitle,
        description: t.accountCreatedDesc,
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Email/Password signup error:", err);
      let friendlyMessage = err.message || t.errorUnexpected;
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            friendlyMessage = t.errorEmailInUse;
            break;
          case 'auth/weak-password':
            friendlyMessage = t.errorWeakPassword;
            break;
          case 'auth/invalid-email':
            friendlyMessage = t.errorInvalidEmail;
            break;
          case 'auth/configuration-not-found':
            friendlyMessage = t.errorFirebaseConfig;
            break;
        }
      }
      setError(friendlyMessage);
      toast({
        variant: 'destructive',
        title: t.signupFailedTitle,
        description: friendlyMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || isAuthLoading || isFirebaseLoading;

  if (isAuthLoading || user) {
    return (
        <div className="flex flex-col space-y-4 text-center">
            <Skeleton className="h-8 w-48 self-center" />
            <Skeleton className="h-4 w-full" />
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                        <Skeleton className="h-10 w-full"/>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight font-headline">
          {t.createAccount}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.enterInfo}
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {error && (
             <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{t.headsUp}</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">{t.fullNameLabel}</Label>
                <Input 
                    id="full-name" 
                    placeholder={t.fullNamePlaceholder} 
                    required 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={isDisabled}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isDisabled}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t.passwordLabel}</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isDisabled}
                />
              </div>

               <div className="grid gap-2">
                  <Label>{t.iAmA}</Label>
                  <RadioGroup
                    defaultValue="student"
                    className="grid grid-cols-2 gap-4"
                    onValueChange={(value: 'student' | 'tutor') => setRole(value)}
                    disabled={isDisabled}
                  >
                    <div>
                      <RadioGroupItem value="student" id="student" className="peer sr-only" />
                      <Label
                        htmlFor="student"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {t.student}
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="tutor" id="tutor" className="peer sr-only" />
                      <Label
                        htmlFor="tutor"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {t.tutor}
                      </Label>
                    </div>
                  </RadioGroup>
               </div>

                <div className="grid gap-2">
                    <Label htmlFor="system">{t.systemLabel}</Label>
                    <Select onValueChange={(value: 'francophone' | 'anglophone') => setSystem(value)} disabled={isDisabled} value={system}>
                        <SelectTrigger id="system">
                            <SelectValue placeholder={t.systemPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="francophone">{t.francophone}</SelectItem>
                            <SelectItem value="anglophone">{t.anglophone}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {role === 'student' && system && (
                    <div className="grid gap-2">
                        <Label htmlFor="class-level">{t.classLevelLabel}</Label>
                        <Select onValueChange={setClassLevel} disabled={isDisabled || !system} value={classLevel}>
                            <SelectTrigger id="class-level">
                                <SelectValue placeholder={t.classLevelPlaceholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {(system === 'francophone' ? francophoneClasses : anglophoneClasses).map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                
                {role === 'tutor' && (
                  <div className="grid gap-2">
                    <Label htmlFor="whatsapp">{t.whatsappLabel}</Label>
                    <Input
                      id="whatsapp"
                      placeholder={t.whatsappPlaceholder}
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      disabled={isDisabled}
                    />
                  </div>
                )}


              <Button type="submit" className="w-full" disabled={isDisabled}>
                {isDisabled ? t.initializing : t.createAccountButton}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            {t.alreadyHaveAccount}{' '}
            <Link href="/login" className="underline">
              {t.login}
            </Link>
          </div>
        </CardContent>
      </Card>
      <p className="px-8 text-center text-sm text-muted-foreground">
        {t.byClicking}{' '}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          {t.terms}
        </Link>{' '}
        {t.and}{' '}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          {t.privacy}
        </Link>
        .
      </p>
    </>
  );
}
