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
import { useFirebase } from '@/firebase';

export default function ForgotPasswordPage() {
  const firebase = useFirebase();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebase) {
      setError('Firebase not initialized. Please try again.');
      return;
    }
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(firebase.auth, email);
      setSubmitted(true);
      toast({
        title: 'Check your email',
        description: 'If an account exists for this email, a password reset link has been sent.',
      });
    } catch (err: any) {
      let friendlyMessage = err.message || "An unexpected error occurred. Please try again.";
      if (err.code === 'auth/user-not-found') {
        // We don't want to reveal if a user exists or not.
        setSubmitted(true); // Pretend it was successful.
        toast({
            title: 'Check your email',
            description: 'If an account exists for this email, a password reset link has been sent.',
        });
      } else {
        setError(friendlyMessage);
        console.error("Password Reset Error:", err);
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
                    disabled={loading || !firebase}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !firebase}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
