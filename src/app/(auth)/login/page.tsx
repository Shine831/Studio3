
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';
import {
  signInWithEmailAndPassword,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, Firestore, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
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
import { useAuth, useFirestore, useUser, FirestorePermissionError, errorEmitter } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Helper to ensure user profile exists
const getOrCreateUserProfile = (
  firestore: Firestore,
  user: User
) => {
  if (!user) return;
  const userRef = doc(firestore, 'users', user.uid);
  
  getDoc(userRef).then(docSnap => {
    if (!docSnap.exists()) {
      const [firstName, ...lastNameParts] = (user.displayName || '').split(' ');
      const lastName = lastNameParts.join(' ');
      
      const userProfileData: UserProfile = {
        id: user.uid,
        email: user.email,
        phone: user.phoneNumber,
        firstName: firstName || 'Anonymous',
        lastName: lastName || '',
        profilePicture: user.photoURL || '',
        role: 'student',
        language: 'fr',
        system: 'francophone',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      
      setDoc(userRef, userProfileData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userProfileData,
        }));
      });

      // Send a welcome notification
      const notificationsCollectionRef = collection(firestore, 'users', user.uid, 'notifications');
      const notificationData = {
        messageFr: "Bienvenue sur RéviseCamer ! Créez votre premier plan d'étude pour commencer.",
        messageEn: "Welcome to RéviseCamer! Create your first study plan to get started.",
        sentAt: serverTimestamp(),
        targetURL: "/study-plan",
      };
      addDoc(notificationsCollectionRef, notificationData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: notificationsCollectionRef.path,
            operation: 'create',
            requestResourceData: notificationData,
        }));
      });

    } else {
      updateDoc(userRef, { lastLogin: serverTimestamp() }).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { lastLogin: 'serverTimestamp()' },
        }));
      });
    }
  }).catch(error => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'get',
    }));
  });
};


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 2.25-4.82 2.25-3.44 0-6.23-2.82-6.23-6.23s2.79-6.23 6.23-6.23c1.87 0 3.13.79 3.82 1.45l2.34-2.34C16.88 2.79 14.99 2 12.48 2 7.23 2 3.24 6.03 3.24 11.28s3.99 9.28 9.24 9.28c2.97 0 5.3-1.02 7.03-2.79 1.76-1.79 2.36-4.32 2.36-6.32 0-.6-.05-1.19-.16-1.74Z"
      />
    </svg>
);

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
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
      errorFirebaseConfig: "Configuration Firebase manquante. Assurez-vous que vos variables d'environnement (ex: .env.local) sont correctement configurées pour cet environnement d'aperçu.",
      errorUnexpected: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      errorUnauthorizedDomain: "Ce domaine n'est pas autorisé pour l'authentification. L'administrateur doit l'ajouter dans la console Firebase.",
      headsUp: 'Attention !',
      orContinueWith: 'Ou continuer avec',
      google: 'Google',
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
        errorFirebaseConfig: 'Firebase configuration is missing. Ensure your environment variables (e.g., .env.local) are correctly set up for this preview environment.',
        errorUnexpected: 'An unexpected error occurred. Please try again.',
        errorUnauthorizedDomain: "This domain is not authorized for authentication. The administrator needs to add it in the Firebase console.",
        headsUp: 'Heads up!',
        orContinueWith: 'Or continue with',
        google: 'Google',
    }
  };

  const t = content[language];
  
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push(callbackUrl);
    }
  }, [user, isUserLoading, router, callbackUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        setError(t.errorFirebaseConfig);
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
      getOrCreateUserProfile(firestore, userCredential.user);
      toast({
        title: t.loginSuccessTitle,
        description: t.loginSuccessDesc,
      });
      router.push(callbackUrl);
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
            case 'auth/argument-error':
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

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) {
        toast({ variant: 'destructive', title: t.loginFailedTitle, description: t.errorFirebaseConfig });
        return;
    }
    setLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        getOrCreateUserProfile(firestore, result.user);
        toast({ title: t.loginSuccessTitle, description: t.loginSuccessDesc });
        router.push(callbackUrl);
    } catch (error: any) {
        console.error("Google sign in error", error);
        let friendlyMessage = error.message || t.errorUnexpected;
        if (error.code === 'auth/unauthorized-domain') {
            friendlyMessage = t.errorUnauthorizedDomain;
        }
        toast({ variant: 'destructive', title: t.loginFailedTitle, description: friendlyMessage });
    } finally {
        setLoading(false);
    }
  };
  
  const isDisabled = loading || isUserLoading;

  if (isUserLoading || user) {
    return <LoginPageSkeleton />;
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
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t.orContinueWith}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" onClick={handleGoogleLogin} disabled={isDisabled}>
                <GoogleIcon className="mr-2 h-4 w-4" /> {t.google}
            </Button>
          </div>
          
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

function LoginPageSkeleton() {
    return (
      <>
        <div className="flex flex-col space-y-2 text-center">
          <Skeleton className="h-8 w-48 self-center" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <Card>
          <CardHeader />
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full mt-2" />
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
              </div>
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
  
  export default function LoginPage() {
      return (
          <Suspense fallback={<LoginPageSkeleton />}>
              <LoginPageContent />
          </Suspense>
      )
  }
