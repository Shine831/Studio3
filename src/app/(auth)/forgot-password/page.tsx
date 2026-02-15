
'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, MailCheck } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { useLanguage } from '@/context/language-context';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const auth = useAuth();
  const { isUserLoading } = useUser();
  const { language } = useLanguage();

  const content = {
    fr: {
      forgotPassword: 'Mot de passe oublié ?',
      enterEmail: "Ne vous inquiétez pas. Entrez votre email et nous vous enverrons un lien pour le réinitialiser.",
      emailLabel: 'Email',
      sendResetLink: 'Envoyer le lien de réinitialisation',
      initializing: 'Initialisation...',
      rememberedPassword: 'Vous vous souvenez de votre mot de passe ?',
      login: 'Se connecter',
      checkYourEmailTitle: 'Vérifiez vos emails',
      checkYourEmailDesc: "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé. N'oubliez pas de vérifier vos courriers indésirables !",
      error: 'Erreur',
      errorNoEmail: 'Veuillez entrer votre adresse email.',
      errorAuthService: "Le service d'authentification n'est pas disponible.",
      errorFirebaseConfig: "Configuration Firebase manquante. Assurez-vous que vos variables d'environnement (ex: .env.local) sont correctement configurées pour cet environnement d'aperçu.",
      errorUnexpected: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
      submissionTitle: "Lien envoyé !",
      submissionMessage: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception (et votre dossier spam).',
    },
    en: {
      forgotPassword: 'Forgot Password?',
      enterEmail: "No worries. Enter your email and we'll send you a reset link.",
      emailLabel: 'Email',
      sendResetLink: 'Send Reset Link',
      initializing: 'Initializing...',
      rememberedPassword: 'Remembered your password?',
      login: 'Log in',
      checkYourEmailTitle: 'Check your email',
      checkYourEmailDesc: 'If an account exists for this email, a password reset link has been sent. Remember to check your spam folder!',
      error: 'Error',
      errorNoEmail: 'Please enter your email address.',
      errorAuthService: 'Authentication service is not available.',
      errorFirebaseConfig: 'Firebase configuration is missing. Ensure your environment variables (e.g., .env.local) are correctly set up for this preview environment.',
      errorUnexpected: 'An unexpected error occurred. Please try again.',
      submissionTitle: 'Link Sent!',
      submissionMessage: 'If an account with that email exists, a password reset link has been sent. Please check your inbox (and your spam folder).',
    }
  };
  const t = content[language];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        setError(t.errorFirebaseConfig);
        return;
    }
    if (!email) {
      setError(t.errorNoEmail);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
    } catch (err: any) {
      // For security reasons (to prevent email enumeration), we show the success message
      // even if the user is not found or another error occurs.
      // We only show a specific error for major configuration issues.
      let friendlyMessage = t.errorUnexpected;
      let shouldShowError = false;
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/argument-error') {
        friendlyMessage = t.errorFirebaseConfig;
        setError(friendlyMessage);
        shouldShowError = true;
      } else {
        setSubmitted(true); 
      }
       console.error("Password Reset Error:", err);
       if (shouldShowError) {
        toast({
          variant: 'destructive',
          title: t.error,
          description: friendlyMessage,
        });
       }
    } finally {
      setLoading(false);
    }
  };
  
  const isDisabled = loading || isUserLoading;

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight font-headline">
          {t.forgotPassword}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.enterEmail}
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>{t.error}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {submitted ? (
            <div className="text-center p-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MailCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-medium font-headline">{t.submissionTitle}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    {t.submissionMessage}
                </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
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
                <Button type="submit" className="w-full" disabled={isDisabled}>
                  {isDisabled ? t.initializing : t.sendResetLink}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="text-center text-sm">
        <Link href="/login" className="underline text-muted-foreground hover:text-primary">
          {t.rememberedPassword} {t.login}
        </Link>
      </div>
    </>
  );
}
