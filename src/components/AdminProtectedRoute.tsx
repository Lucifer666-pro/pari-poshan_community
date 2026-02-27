
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ShieldX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const db = useFirestore();
  const router = useRouter();

  const checkAdminStatus = React.useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    setIsChecking(true);
    try {
      // Master Admin Bypass
      if (user.email === 'admin@pariposhan.com') {
        setIsAdmin(true);
        setIsChecking(false);
        return;
      }

      // Check Firestore document for isAdmin flag
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data().isAdmin === true) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Admin check failed:", error);
      setIsAdmin(false);
    } finally {
      setIsChecking(false);
    }
  }, [user, db]);

  React.useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        setIsAdmin(false);
        router.replace('/admin-login');
      } else {
        checkAdminStatus();
      }
    }
  }, [user, isUserLoading, router, checkAdminStatus]);

  if (isUserLoading || isAdmin === null || isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 font-body">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Security Clearance</p>
          <p className="text-xs text-muted-foreground animate-pulse font-medium italic">Validating operator credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-10 font-body">
        <div className="bg-destructive/10 p-12 rounded-[3.5rem] shadow-inner ring-8 ring-destructive/5">
          <ShieldX className="w-24 h-24 text-destructive" />
        </div>
        <div className="space-y-4 max-w-lg mx-auto">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 uppercase">Access Denied</h1>
          <p className="text-muted-foreground text-lg leading-relaxed font-medium">
            Your identity has been flagged as unauthorized for this command center.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button variant="outline" className="rounded-2xl h-14 flex-1 font-black uppercase tracking-widest text-xs" onClick={() => checkAdminStatus()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Protocol
          </Button>
          <Button asChild variant="destructive" className="rounded-2xl h-14 flex-1 font-black uppercase tracking-widest text-xs">
            <Link href="/admin-login">Switch Operator</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
