'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  try {
    const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;
    if (!isConfigValid) {
      console.error("Firebase configuration is invalid. Please check your environment variables.");
      return { firebaseApp: null, auth: null, firestore: null };
    }
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return getSdks(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
