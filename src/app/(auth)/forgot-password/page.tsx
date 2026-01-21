'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
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
import { Terminal } from 'lucide-react';
import { useAuth, useFirebase } from '@/firebase'; // useAuth hook

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const auth = useAuth(); // get auth from context
  const { isUserLoading } = useFirebase();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        setError("Authentication service is not available.");
        return;
    }
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      toast({
        title: 'Check your email',
        description: 'If an account exists for this email, a password reset link has been sent.',
      });
    } catch (err: any) {
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      let shouldShowError = false;
      if (err.code === 'auth/configuration-not-found') {
        friendlyMessage = "Firebase configuration is missing. The app is not properly connected to Firebase.";
        setError(friendlyMessage);
        shouldShowError = true;
      } else {
        // We don't want to reveal if a user exists or not for security reasons.
        // So, in all other cases, we pretend the operation was successful.
        setSubmitted(true); 
        toast({
            title: 'Check your email',
            description: 'If an account exists for this email, a password reset link has been sent.',
        });
      }
       console.error("Password Reset Error:", err);
       if (shouldShowError) { // Only toast a real error
        toast({
          variant: 'destructive',
          title: 'Error',
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
          Forgot Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link.
        </p>
      </div>
      <Card>
        <CardHeader>
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center">
              <p>
                If an account with that email exists, a password reset link has
                been sent. Please check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
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
                  {isDisabled ? 'Initializing...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Remembered your password?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
