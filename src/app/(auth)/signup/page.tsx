'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from 'lucide-react';
import { useFirebase } from '@/firebase';

const createNewUserDocument = async (
  firestore: Firestore,
  user: User,
  fullName?: string
) => {
  const userRef = doc(firestore, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
      const [firstName, ...lastNameParts] = (user.displayName || fullName || '').split(' ');
      const lastName = lastNameParts.join(' ');
      const userData = {
          id: user.uid,
          email: user.email,
          firstName: firstName || '',
          lastName: lastName || '',
          profilePicture: user.photoURL || null,
          role: 'student',
          language: 'fr',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
      };
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { auth, firestore, isUserLoading } = useFirebase();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        setError('Firebase is not initialized correctly.');
        return;
    }
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
      await createNewUserDocument(firestore, userCredential.user, fullName);

      toast({
        title: 'Account Created',
        description: "Welcome! You're now signed up.",
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Email/Password signup error:", err);
      let friendlyMessage = err.message || "An unexpected error occurred. Please try again.";
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            friendlyMessage = "This email address is already in use by another account.";
            break;
          case 'auth/weak-password':
            friendlyMessage = "The password is too weak. Please use a stronger password.";
            break;
          case 'auth/invalid-email':
            friendlyMessage = "The email address is not valid.";
            break;
          case 'auth/configuration-not-found':
            friendlyMessage = "Firebase configuration is missing. The app is not properly connected to Firebase.";
            break;
        }
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

  const isDisabled = loading || isUserLoading;

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
                    disabled={isDisabled}
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
                  disabled={isDisabled}
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
                    disabled={isDisabled}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isDisabled}>
                {isDisabled ? 'Initializing...' : 'Create account'}
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
