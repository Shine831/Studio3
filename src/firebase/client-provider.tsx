'use client';

import { ReactNode, useMemo } from 'react';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';

let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;

export function getFirebaseApp() {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  }
  return firebaseApp;
}

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const app = useMemo(() => {
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig);
    }
    return firebaseApp;
  }, []);

  const firestoreInstance = useMemo(() => {
    if (!firestore) {
      firestore = getFirestore(app);
    }
    return firestore;
  }, [app]);

  const authInstance = useMemo(() => {
    if (!auth) {
      auth = getAuth(app);
    }
    return auth;
  }, [app]);

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
