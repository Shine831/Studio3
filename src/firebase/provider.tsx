'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [instances, setInstances] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setInstances({ app, auth, firestore });
  }, []);

  return (
    <FirebaseContext.Provider value={instances}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextValue | null => {
  return useContext(FirebaseContext);
};
