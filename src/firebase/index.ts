// This file ensures that Firebase is initialized only once.
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;

// Check if Firebase has already been initialized.
// This is safe to run on the client and prevents re-initialization.
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize and export Auth and Firestore services
const auth = getAuth(app);
const firestore = getFirestore(app);

// Re-export useUser for convenience, which now uses the initialized 'auth' instance
export { useUser } from './auth/use-user';
export { app, auth, firestore };
