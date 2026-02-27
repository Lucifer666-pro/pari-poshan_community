'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * REDUNDANT ROUTE: Redirecting to the primary /admin-dashboard portal
 */
export default function AdminPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin-dashboard');
  }, [router]);
  return null;
}
