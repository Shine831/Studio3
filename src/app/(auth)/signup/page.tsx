'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from 'lucide-react';
import { getFirebaseInstances } from '@/firebase';

const { auth, firestore } = getFirebaseInstances();

const createNewUserDocument = async (
    user: User,
    fullName?: string
  ) => {
    const userRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || fullName,
            photoURL: user.photoURL || null,
            role: 'student',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
        };
        await setDoc(userRef, userData);
    } else {
        // If document exists, just update the last login time
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    }
  };


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      await createNewUserDocument(userCredential.user, fullName);

      toast({
        title: 'Account Created',
        description: "Welcome! You're now signed up.",
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Email/Password signup error:", err);
      let friendlyMessage = err.message || "An unexpected error occurred. Please try again.";
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "This email address is already in use by another account.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "The password is too weak. Please use a stronger password.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "The email address is not valid.";
      }
      setError(friendlyMessage);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: friendlyMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createNewUserDocument(result.user);
      toast({
        title: 'Account Created',
        description: "Welcome! You're now signed up.",
      });
      router.push('/dashboard');
    } catch (err: any) {
        console.error("Google signup error:", err);
        let friendlyMessage = err.message || "An unexpected error occurred during Google sign-up.";
        if (err.code === 'auth/popup-closed-by-user') {
            friendlyMessage = 'The sign-up window was closed before completion. Please try again.';
        } else if (err.code === 'auth/account-exists-with-different-credential') {
            friendlyMessage = 'An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.';
        }
        setError(friendlyMessage);
        toast({
            variant: 'destructive',
            title: 'Google Signup Failed',
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
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your information to create an account
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {error && (
             <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                    id="full-name" 
                    placeholder="Your Name" 
                    required 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-5.62 1.9-4.76 0-8.64-3.89-8.64-8.64s3.88-8.64 8.64-8.64c2.69 0 4.35 1.05 5.33 1.95l2.62-2.62C19.03 1.18 16.25 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.34 0 12.07-4.82 12.07-12.07 0-.82-.07-1.55-.2-2.28H12.48z"
                  ></path>
                </svg>
                Sign up with Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
      <p className="px-8 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{' '}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
