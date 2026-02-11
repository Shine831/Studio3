'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, Firestore } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Eye, EyeOff } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';

const updateUserLoginTimestamp = (firestore: Firestore, user: User | null) => {
    if (!user) return;
    const userRef = doc(firestore, 'users', user.uid);
    setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true })
        .catch(error => console.error("Error updating login timestamp:", error));
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { auth, firestore, isUserLoading: isFirebaseLoading } = useFirebase();
  const { language } = useLanguage();

  const content = {
    fr: {
      welcomeBack: 'Bon retour parmi nous',
      enterEmail: 'Entrez votre email ci-dessous pour vous connecter à votre compte',
      emailLabel: 'Email',
      passwordLabel: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      loginButton: 'Se connecter',
      initializing: 'Initialisation...',
      noAccount: "Vous n'avez pas de compte ?",
      signUp: "S'inscrire",
      loginSuccessTitle: 'Connexion réussie',
      loginSuccessDesc: 'Bon retour !',
      loginFailedTitle: 'Échec de la connexion',
      errorFillFields: 'Veuillez remplir tous les champs.',
      errorInvalidCredentials: 'Email ou mot de passe invalide. Veuillez vérifier vos informations et réessayer.',
      errorTooManyRequests: "L'accès à ce compte a été temporairement désactivé en raison de nombreuses tentatives de connexion échouées. Vous pouvez le restaurer immédiatement en réinitialisant votre mot de passe ou réessayer plus tard.",
      errorFirebaseConfig: "La configuration de Firebase est manquante. L'application n'est pas correctement connectée à Firebase.",
      errorUnexpected: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      headsUp: 'Attention !',
    },
    en: {
      welcomeBack: 'Welcome back',
      enterEmail: 'Enter your email below to log in to your account',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      forgotPassword: 'Forgot your password?',
      loginButton: 'Login',
      initializing: 'Initializing...',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      loginSuccessTitle: 'Login Successful',
      loginSuccessDesc: 'Welcome back!',
      loginFailedTitle: 'Login Failed',
      errorFillFields: 'Please fill in all fields.',
      errorInvalidCredentials: 'Invalid email or password. Please check your credentials and try again.',
      errorTooManyRequests: 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.',
      errorFirebaseConfig: 'Firebase configuration is missing. The app is not properly connected to Firebase.',
      errorUnexpected: 'An unexpected error occurred. Please try again.',
      headsUp: 'Heads up!',
    }
  };

  const t = content[language];
  
  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/study-plan');
    }
  }, [user, isAuthLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        setError('Firebase is not initialized correctly.');
        return;
    }
    if (!email || !password) {
      setError(t.errorFillFields);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      updateUserLoginTimestamp(firestore, userCredential.user);
      toast({
        title: t.loginSuccessTitle,
        description: t.loginSuccessDesc,
      });
      router.push('/study-plan');
    } catch (err: any) {
      console.error("Email/Password login error:", err);
      let friendlyMessage = err.message || t.errorUnexpected;
      
      if (err.code) {
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              friendlyMessage = t.errorInvalidCredentials;
              break;
            case 'auth/too-many-requests':
              friendlyMessage = t.errorTooManyRequests;
              break;
            case 'auth/configuration-not-found':
              friendlyMessage = t.errorFirebaseConfig;
              break;
        }
      }
      
      setError(friendlyMessage);
      toast({
        variant: 'destructive',
        title: t.loginFailedTitle,
        description: friendlyMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const isDisabled = loading || isFirebaseLoading || isAuthLoading;

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
          {t.welcomeBack}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.enterEmail}
        </p>
      </div>
      <Card>
        <CardHeader>
          {error && (
             <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{t.headsUp}</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isDisabled}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t.passwordLabel}</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isDisabled}
                  />
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isDisabled}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isDisabled}>
                {isDisabled ? t.initializing : t.loginButton}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            {t.noAccount}{' '}
            <Link href="/signup" className="underline">
              {t.signUp}
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
