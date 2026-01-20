'use client';

import { ReactNode } from 'react';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase using a singleton pattern.
const app: FirebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const firestoreInstance: Firestore = getFirestore(app);
const authInstance: Auth = getAuth(app);

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FirebaseProvider
      firebaseApp={app}
      firestore={firestoreInstance}
      auth={authInstance}
    >
      {children}
    </FirebaseProvider>
  );
};
