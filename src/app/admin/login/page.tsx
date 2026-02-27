'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * REDUNDANT ROUTE: Redirecting to the primary /admin-login portal
 */
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin-login');
  }, [router]);
  return null;
}
