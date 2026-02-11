'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, Firestore, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Eye, EyeOff, Phone, Loader2 } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';


// Helper to ensure user profile exists
const getOrCreateUserProfile = async (
  firestore: Firestore,
  user: User
) => {
  if (!user) return;
  const userRef = doc(firestore, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    const [firstName, ...lastNameParts] = (user.displayName || '').split(' ');
    const lastName = lastNameParts.join(' ');
    
    const userProfileData: UserProfile = {
      id: user.uid,
      email: user.email,
      phone: user.phoneNumber,
      firstName: firstName || (user.phoneNumber ? 'Utilisateur' : 'Anonymous'),
      lastName: lastName || (user.phoneNumber ? user.phoneNumber : ''),
      profilePicture: user.photoURL || '',
      role: 'student',
      language: 'fr',
      system: 'francophone',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };
    
    await setDoc(userRef, userProfileData);
  } else {
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  }
};


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 2.25-4.82 2.25-3.44 0-6.23-2.82-6.23-6.23s2.79-6.23 6.23-6.23c1.87 0 3.13.79 3.82 1.45l2.34-2.34C16.88 2.79 14.99 2 12.48 2 7.23 2 3.24 6.03 3.24 11.28s3.99 9.28 9.24 9.28c2.97 0 5.3-1.02 7.03-2.79 1.76-1.79 2.36-4.32 2.36-6.32 0-.6-.05-1.19-.16-1.74Z"
      />
    </svg>
);

declare global {
    interface Window {
      recaptchaVerifier?: RecaptchaVerifier;
    }
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

  // Phone Auth State
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'number' | 'code'>('number');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  useEffect(() => {
    if (phoneDialogOpen && auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => { /* reCAPTCHA solved */ }
      });
    }
  }, [phoneDialogOpen, auth]);

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
      orContinueWith: 'Ou continuer avec',
      google: 'Google',
      phone: 'Téléphone',
      phoneAuthTitle: 'Connexion par téléphone',
      phoneAuthDesc: 'Veuillez entrer votre numéro de téléphone pour recevoir un code de vérification.',
      phoneNumberLabel: 'Numéro de téléphone',
      sendCode: 'Envoyer le code',
      sendingCode: 'Envoi...',
      phoneErrorSend: "Erreur lors de l'envoi du code. Vérifiez le numéro (+237XXXX) et réessayez.",
      verifyCodeTitle: 'Vérifier le code',
      verifyCodeDesc: 'Veuillez entrer le code à 6 chiffres que vous avez reçu.',
      verificationCodeLabel: 'Code de vérification',
      verify: 'Vérifier',
      verifying: 'Vérification...',
      phoneErrorVerify: 'Code de vérification invalide.',
      success: 'Succès',
      loggedInSuccess: 'Connecté avec succès.',
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
        orContinueWith: 'Or continue with',
        google: 'Google',
        phone: 'Phone',
        phoneAuthTitle: 'Sign in with Phone',
        phoneAuthDesc: 'Please enter your phone number to receive a verification code.',
        phoneNumberLabel: 'Phone Number',
        sendCode: 'Send Code',
        sendingCode: 'Sending...',
        phoneErrorSend: 'Error sending code. Check number format (+237XXXX) and try again.',
        verifyCodeTitle: 'Verify Code',
        verifyCodeDesc: 'Please enter the 6-digit code you received.',
        verificationCodeLabel: 'Verification Code',
        verify: 'Verify',
        verifying: 'Verifying...',
        phoneErrorVerify: 'Invalid verification code.',
        success: 'Success',
        loggedInSuccess: 'Successfully logged in.',
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
      await getOrCreateUserProfile(firestore, userCredential.user);
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

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return;
    setLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await getOrCreateUserProfile(firestore, result.user);
        toast({ title: t.loginSuccessTitle, description: t.loginSuccessDesc });
        router.push('/study-plan');
    } catch (error: any) {
        console.error("Google sign in error", error);
        toast({ variant: 'destructive', title: t.loginFailedTitle, description: error.message });
        setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!auth) return;
    setPhoneLoading(true);
    setPhoneError(null);
    try {
      const appVerifier = window.recaptchaVerifier!;
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+237${phoneNumber.replace(/\s/g, '')}`;
      const result = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setPhoneStep('code');
    } catch (error: any) {
      console.error("Phone auth error", error);
      setPhoneError(t.phoneErrorSend);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult || !firestore) return;
    setPhoneLoading(true);
    setPhoneError(null);
    try {
        const userCredential = await confirmationResult.confirm(verificationCode);
        await getOrCreateUserProfile(firestore, userCredential.user);
        toast({ title: t.success, description: t.loggedInSuccess });
        router.push('/study-plan');
    } catch (error) {
        console.error("Code verification error", error);
        setPhoneError(t.phoneErrorVerify);
    } finally {
        setPhoneLoading(false);
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
      <div id="recaptcha-container" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleGoogleLogin} disabled={isDisabled}>
                <GoogleIcon className="mr-2 h-4 w-4" /> {t.google}
            </Button>
            <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" disabled={isDisabled}>
                        <Phone className="mr-2 h-4 w-4" /> {t.phone}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    {phoneStep === 'number' ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>{t.phoneAuthTitle}</DialogTitle>
                                <DialogDescription>{t.phoneAuthDesc}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                <Label htmlFor="phone-number">{t.phoneNumberLabel}</Label>
                                <Input id="phone-number" placeholder="+237 600 000 000" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                                </div>
                                {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSendCode} disabled={phoneLoading}>
                                {phoneLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {phoneLoading ? t.sendingCode : t.sendCode}
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                           <DialogHeader>
                                <DialogTitle>{t.verifyCodeTitle}</DialogTitle>
                                <DialogDescription>{t.verifyCodeDesc}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                <Label htmlFor="verification-code">{t.verificationCodeLabel}</Label>
                                <Input id="verification-code" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
                                </div>
                                {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleVerifyCode} disabled={phoneLoading}>
                                {phoneLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {phoneLoading ? t.verifying : t.verify}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
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
