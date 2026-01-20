'use client';

import { ReactNode, useState, useEffect } from 'react';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';

interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const [instances, setInstances] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // Initialize Firebase on the client, and only once.
    if (getApps().length === 0) {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setInstances({ app, auth, firestore });
    } else {
      const app = getApps()[0];
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setInstances({ app, auth, firestore });
    }
  }, []);

  // While initializing, don't render children
  // as they might depend on Firebase.
  if (!instances) {
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={instances.app}
      firestore={instances.firestore}
      auth={instances.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
