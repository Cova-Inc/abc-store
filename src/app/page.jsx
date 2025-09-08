'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------
// ABC Store Dashboard
// Core features: Products (with image upload), Users, Authentication
// ----------------------------------------------------------------------

// Client Component - redirect happens on the client
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push(CONFIG.auth.redirectPath);
  }, [router]);

  // Show nothing while redirecting
  return null;
}
