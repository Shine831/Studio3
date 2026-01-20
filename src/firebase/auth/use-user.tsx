'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';

export const useUser = () => {
  const firebase = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebase) {
      const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [firebase]);

  return { user, loading };
};
