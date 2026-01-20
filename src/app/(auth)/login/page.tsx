'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
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
import { auth, firestore } from '@/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateUserLoginTimestamp = (user: User | null) => {
      if (!user) return;
      const userRef = doc(firestore, 'users', user.uid);
      setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true })
          .catch(error => console.error("Error updating login timestamp:", error));
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      updateUserLoginTimestamp(userCredential.user);
      toast({
        title: 'Login Successful',
        description: "Welcome back!",
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Email/Password login error:", err);
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      
      if (err.code) {
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              friendlyMessage = "Invalid email or password. Please check your credentials and try again.";
              break;
            case 'auth/too-many-requests':
              friendlyMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
              break;
            default:
              friendlyMessage = err.message;
        }
      }
      
      setError(friendlyMessage);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: friendlyMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      updateUserLoginTimestamp(result.user);
       toast({
        title: 'Login Successful',
        description: "Welcome back!",
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Google Login Error:", err);
      let friendlyMessage = "An unexpected error occurred during Google sign-in.";
      
      if (err.code) {
        switch (err.code) {
            case 'auth/popup-closed-by-user':
              friendlyMessage = 'The sign-in window was closed before completion. Please try again.';
              break;
            case 'auth/account-exists-with-different-credential':
              friendlyMessage = 'An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.';
              break;
             default:
                friendlyMessage = err.message;
        }
      }

      setError(friendlyMessage);
       toast({
        variant: 'destructive',
        title: 'Google Login Failed',
        description: friendlyMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight font-headline">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to log in to your account
        </p>
      </div>
      <Card>
        <CardHeader>
          {error && (
             <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-5.62 1.9-4.76 0-8.64-3.89-8.64-8.64s3.88-8.64 8.64-8.64c2.69 0 4.35 1.05 5.33 1.95l2.62-2.62C19.03 1.18 16.25 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.34 0 12.07-4.82 12.07-12.07 0-.82-.07-1.55-.2-2.28H12.48z"
                  ></path>
                </svg>
                Login with Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
