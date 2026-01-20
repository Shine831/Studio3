'use client';

import { ReactNode, useMemo } from 'react';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const { app, firestoreInstance, authInstance } = useMemo(() => {
    const app = initializeApp(firebaseConfig);
    const firestoreInstance = getFirestore(app);
    const authInstance = getAuth(app);
    return { app, firestoreInstance, authInstance };
  }, []);

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
