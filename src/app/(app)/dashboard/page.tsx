'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  useEffect(() => {
    redirect('/study-plan');
  }, []);
  return null;
}
