
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { AppLogo } from '@/components/AppLogo';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    signOut(auth).catch(() => {});
  }, [auth]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        if (password !== confirmPassword) throw new Error("Passwords do not match.");

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.email?.split('@')[0] || 'Anonymous',
          photoURL: user.photoURL || '',
          isAdmin: false,
          createdAt: new Date().toISOString()
        }, { merge: true });
        
        toast({ title: "Welcome!", description: "Community profile created successfully." });
        router.push('/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-body">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-1 bg-white rounded-[2.5rem] mb-2 shadow-2xl ring-8 ring-primary/5">
            <AppLogo className="w-32 h-32 rounded-[2rem]" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-primary uppercase">Pariposhan</h1>
          <p className="text-muted-foreground font-medium italic">Building a safer food culture, together.</p>
        </div>

        {authError && (
          <Alert variant="destructive" className="border-2 rounded-2xl shadow-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Security Notice</AlertTitle>
            <AlertDescription className="font-medium text-xs">{authError}</AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="space-y-1 p-10 pb-4 text-center">
            <CardTitle className="text-3xl font-black">
              {isSignUp ? "Join Community" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="font-medium">
              {isSignUp ? "Create your profile" : "Sign in to your feed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-10 pt-4">
            <form onSubmit={handleAuth} className="grid gap-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    className="pl-12 pr-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Confirm Identity</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-medium" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? "Create Profile" : "Sign In")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-6 text-sm text-muted-foreground border-t bg-slate-50/50 p-8">
            <div className="font-medium">
              {isSignUp ? "Already a member?" : "New here?"}
              <button type="button" className="text-primary ml-2 font-black uppercase tracking-widest text-[10px] hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Sign In" : "Join Now"}
              </button>
            </div>
            <Link href="/admin-login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all border-b border-transparent hover:border-slate-900 pb-0.5">Administrator Portal</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
