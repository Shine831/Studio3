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

/**
 * This provider component handles the initialization of Firebase on the client-side
 * and makes the Firebase app, auth, and firestore instances available to the rest of the app via context.
 */
export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [instances, setInstances] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    // Initialize Firebase only on the client, and only once.
    let app: FirebaseApp;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    
    setInstances({ app, auth, firestore });
  }, []);

  // While Firebase is initializing, we don't render the children.
  // This prevents hydration errors and ensures that components that depend on Firebase
  // don't render until Firebase is ready.
  if (!instances) {
    return null; 
  }

  return (
    <FirebaseContext.Provider value={instances}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hooks to easily access the Firebase instances.
// These hooks ensure that they are used within a FirebaseProvider.

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === null) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

export const useFirebaseApp = () => useFirebase().app;
export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
