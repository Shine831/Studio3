'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseInstances } from '@/firebase';

export const useUser = () => {
  const { auth } = getFirebaseInstances();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function that we can use for cleanup.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts.
    return () => unsubscribe();
  }, [auth]); // This effect should re-run if the auth instance ever changes.

  return { user, loading };
};
