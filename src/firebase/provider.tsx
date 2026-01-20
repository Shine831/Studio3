'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { firebaseConfig } from '@/firebase/config';

interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  firebaseApp: null,
  firestore: null,
  auth: null,
});

export const FirebaseProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [instances, setInstances] = useState<FirebaseContextType | null>(null);

  useEffect(() => {
    let firebaseApp;
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApps()[0];
    }
    
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    setInstances({ firebaseApp, auth, firestore });
  }, []);

  // While initializing, don't render children
  // as they might depend on Firebase.
  if (!instances) {
    return null;
  }

  return (
    <FirebaseContext.Provider value={instances}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useFirestore = () => useFirebase().firestore;
export const useAuth = () => useFirebase().auth;
