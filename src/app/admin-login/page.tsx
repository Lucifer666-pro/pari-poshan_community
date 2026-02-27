'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState('admin@pariposhan.com');
  const [password, setPassword] = React.useState('123456');
  const [isLoading, setIsLoading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    try {
      let user;
      try {
        // Attempt sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } catch (authErr: any) {
        // If master admin doesn't exist, auto-create for prototype convenience
        if ((authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') && email === 'admin@pariposhan.com') {
          const createCredential = await createUserWithEmailAndPassword(auth, email, password);
          user = createCredential.user;
        } else {
          throw authErr;
        }
      }

      if (!user) throw new Error("Authentication failed.");

      // Force administrative profile persistence for Security Rules verification
      const isAdminEmail = email === 'admin@pariposhan.com';
      
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        email: user.email,
        displayName: "System Administrator",
        isAdmin: isAdminEmail,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });

      // If it's the primary admin, provision the role record for DBAC
      if (isAdminEmail) {
        const adminRoleRef = doc(db, "roles_admin", user.uid);
        await setDoc(adminRoleRef, {
          uid: user.uid,
          assignedAt: new Date().toISOString(),
          note: "Auto-provisioned via secure command portal login"
        }, { merge: true });
      }
      
      toast({ 
        title: "Security Clearance Granted", 
        description: "Directing to command center..." 
      });
      
      router.push('/admin-dashboard');
    } catch (err: any) {
      console.error("Auth error:", err);
      setLocalError("Authentication failed. Please verify administrator credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-body">
      <div className="w-full max-w-md space-y-4">
        {localError && (
          <Card className="border-destructive bg-destructive/5 text-destructive p-4 rounded-2xl flex items-center gap-3">
             <ShieldAlert className="w-5 h-5 shrink-0" />
             <p className="text-xs font-bold leading-tight">{localError}</p>
          </Card>
        )}
        
        <Card className="w-full shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-3xl mb-4 backdrop-blur-md">
                <ShieldAlert className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight uppercase tracking-widest leading-none">Command Portal</CardTitle>
              <CardDescription className="text-slate-400 font-medium mt-2">Pariposhan Moderation Hub</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleAdminAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Operator ID</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Security Key</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 text-base font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify identity"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-6 flex flex-col items-center gap-4">
            <Button asChild variant="ghost" className="gap-2 text-slate-500 hover:bg-white hover:text-slate-900 rounded-xl transition-all font-bold text-xs">
              <Link href="/login">
                <ArrowLeft className="w-4 h-4" />
                Return to community login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}