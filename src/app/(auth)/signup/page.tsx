
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, Firestore } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, Eye, EyeOff, Phone, Loader2 } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';


const getOrCreateUserProfile = async (
  firestore: Firestore,
  user: User,
  extraData: {
    fullName?: string;
    system?: 'francophone' | 'anglophone';
  } = {}
) => {
  if (!user) return;
  const userRef = doc(firestore, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    const name = extraData.fullName || user.displayName || '';
    const [firstName, ...lastNameParts] = name.split(' ');
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
      system: extraData.system || 'francophone',
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


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [system, setSystem] = useState<'francophone' | 'anglophone' | ''>('');
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
      createAccount: 'Créer un compte',
      enterInfo: 'Entrez vos informations pour créer votre compte élève.',
      fullNameLabel: 'Nom complet',
      fullNamePlaceholder: 'Votre Nom',
      emailLabel: 'Email',
      passwordLabel: 'Mot de passe',
      confirmPasswordLabel: 'Confirmer le mot de passe',
      systemLabel: 'Système Éducatif',
      systemPlaceholder: 'Choisissez votre système',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
      createAccountButton: 'Créer mon compte',
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
      errorFillFields: 'Veuillez remplir tous les champs obligatoires.',
      errorSelectSystem: 'Veuillez sélectionner un système éducatif.',
      errorPasswordLength: 'Le mot de passe doit contenir au moins 6 caractères.',
      errorPasswordMismatch: 'Les mots de passe ne correspondent pas.',
      errorEmailInUse: 'Cette adresse email est déjà utilisée par un autre compte.',
      errorWeakPassword: 'Le mot de passe est trop faible. Veuillez utiliser un mot de passe plus fort.',
      errorInvalidEmail: 'L\'adresse email n\'est pas valide.',
      errorFirebaseConfig: 'La configuration de Firebase est manquante. L\'application n\'est pas correctement connectée à Firebase.',
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
      phoneErrorOperationNotAllowed: "L'envoi de SMS n'est pas activé pour cette région. Le développeur doit activer cette fonctionnalité dans la console Google Cloud.",
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
      createAccount: 'Create an account',
      enterInfo: 'Enter your information to create your student account.',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'Your Name',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm Password',
      systemLabel: 'Educational System',
      systemPlaceholder: 'Select your system',
      francophone: 'Francophone',
      anglophone: 'Anglophone',
      createAccountButton: 'Create my account',
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
      errorFillFields: 'Please fill in all required fields.',
      errorSelectSystem: 'Please select an educational system.',
      errorPasswordLength: 'Password must be at least 6 characters long.',
      errorPasswordMismatch: 'Passwords do not match.',
      errorEmailInUse: 'This email address is already in use by another account.',
      errorWeakPassword: 'The password is too weak. Please use a stronger password.',
      errorInvalidEmail: 'The email address is not valid.',
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
      phoneErrorOperationNotAllowed: "SMS sending is not enabled for this region. The developer needs to enable this feature in the Google Cloud console.",
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
    if (!fullName || !email || !password) {
      setError(t.errorFillFields);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.errorPasswordMismatch);
      return;
    }
    if (!system) {
        setError(t.errorSelectSystem);
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
      
      await getOrCreateUserProfile(firestore, userCredential.user, {
          fullName,
          system,
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

  const handleGoogleSignup = async () => {
    if (!auth || !firestore) return;
    setLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await getOrCreateUserProfile(firestore, result.user);
        toast({ title: t.accountCreatedTitle, description: t.accountCreatedDesc });
        router.push('/study-plan');
    } catch (error: any) {
        console.error("Google sign up error", error);
        toast({ variant: 'destructive', title: t.signupFailedTitle, description: error.message || t.errorUnexpected });
    } finally {
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
      if (error.code === 'auth/operation-not-allowed') {
          setPhoneError(t.phoneErrorOperationNotAllowed);
      } else {
          setPhoneError(t.phoneErrorSend);
      }
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
      <div id="recaptcha-container" />
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
                <div className="relative">
                  <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">{t.confirmPasswordLabel}</Label>
                <div className="relative">
                  <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      disabled={isDisabled}
                  />
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isDisabled}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
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
              
              <Button type="submit" className="w-full" disabled={isDisabled}>
                {isDisabled ? t.initializing : t.createAccountButton}
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
                <Button variant="outline" onClick={handleGoogleSignup} disabled={isDisabled}>
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
