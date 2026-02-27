
"use client";

import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppHeaderProps {
  onSearch: (val: string) => void;
  onShowMyPosts: (userId: string | null) => void;
  onMyPosts: () => void;
}

export function AppHeader({ onShowMyPosts }: AppHeaderProps) {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-4">
      <div className="hidden sm:flex flex-1 items-center px-4 overflow-hidden">
        <div className="flex flex-col min-w-0 animate-in fade-in duration-1000">
          <p className="text-[11px] font-semibold text-slate-600 leading-tight italic truncate">
            To eat is a necessity, but to eat intelligently is an art.
          </p>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
            — François de La Rochefoucauld
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <CreatePostDialog />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center outline-none focus:ring-0 group">
                    <Avatar className="w-9 h-9 border-2 border-transparent group-hover:border-primary/20 transition-all shadow-sm">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-[1.5rem] shadow-2xl border-slate-100 p-2">
                  <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col space-y-1">
                      <span className="font-black text-sm text-slate-900 truncate uppercase tracking-tight">
                        {user.displayName || 'Community Member'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 mx-2" />
                  <DropdownMenuItem 
                    className="h-11 rounded-xl cursor-pointer font-bold text-xs hover:bg-slate-50" 
                    onClick={() => onShowMyPosts(user.uid)}
                  >
                    My Contribution Feed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 mx-2" />
                  <DropdownMenuItem 
                    className="h-11 rounded-xl text-destructive cursor-pointer font-bold text-xs hover:bg-destructive/5" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <Button onClick={() => router.push('/login')} className="rounded-full gap-2 px-6 h-11 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
