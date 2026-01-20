'use client';

import { ReactNode } from 'react';
import { FirebaseApp, getApps, initializeApp, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { firebaseConfig } from '@/firebase/config';

// --- Singleton Initialization ---
// This code runs only once when the module is first imported,
// ensuring a single, consistent instance of Firebase services.
let firebaseAppInstance: FirebaseApp;
if (getApps().length === 0) {
  firebaseAppInstance = initializeApp(firebaseConfig);
} else {
  firebaseAppInstance = getApp();
}

const authInstance: Auth = getAuth(firebaseAppInstance);
const firestoreInstance: Firestore = getFirestore(firebaseAppInstance);
// --- End Singleton Initialization ---


// The provider component is now a "pass-through". It no longer manages
// state but is kept for structural compatibility with the root layout.
export const FirebaseProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <>{children}</>;
};

// The hooks now return the singleton instances directly, bypassing React Context.
// This is a more robust approach for Next.js applications.

export const useFirebase = () => {
    return {
        firebaseApp: firebaseAppInstance,
        auth: authInstance,
        firestore: firestoreInstance,
    }
};

export const useFirebaseApp = (): FirebaseApp => firebaseAppInstance;
export const useFirestore = (): Firestore => firestoreInstance;
export const useAuth = (): Auth => authInstance;
