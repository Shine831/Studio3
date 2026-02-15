'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase, type getSdks } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] =
    useState<ReturnType<typeof getSdks> | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setFirebaseServices(initializeFirebase());
  }, []);

  // On the server (and during the initial client render before the effect runs),
  // firebaseServices will be null.
  // We pass these nulls to FirebaseProvider, which is designed to handle them gracefully.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices?.firebaseApp ?? null}
      auth={firebaseServices?.auth ?? null}
      firestore={firebaseServices?.firestore ?? null}
    >
      {children}
    </FirebaseProvider>
  );
}
