'use client';

import * as React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar";
import { 
  LayoutGrid, 
  Newspaper, 
  ShoppingBag, 
  Gamepad2, 
  BookOpenText,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { AppLogo } from "@/components/AppLogo";
import { ChatbotFloating } from "@/components/ChatbotFloating";

const NAV_ITEMS = [
  { id: 'feed', label: 'Feed', icon: LayoutGrid, href: '/feed' },
  { id: 'news', label: 'Verified News', icon: Newspaper, href: '/news' },
  { id: 'goodkart', label: 'GoodKart', icon: ShoppingBag, href: '/goodkart' },
  { id: 'quiz-game', label: 'Quiz & Game', icon: Gamepad2, href: '/quiz-game' },
  { id: 'blog', label: 'Knowledge Hub', icon: BookOpenText, href: '/blog' },
];

export function AppSidebar() {
  const { user } = useUser();
  const db = useFirestore();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      if (user.email === 'admin@pariposhan.com') {
        setIsAdmin(true);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().isAdmin === true);
      } catch (e) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user, db]);

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3 px-2 py-4 hover:opacity-80 transition-opacity">
          <AppLogo className="w-16 h-16 rounded-2xl shadow-lg ring-4 ring-white" />
          <div>
            <h1 className="text-xl font-black tracking-tight text-primary uppercase leading-none">Pariposhan</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">Building a safer culture</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Administrative</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white">
                    <Link href="/admin-dashboard">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Security Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t bg-slate-50/50 flex flex-col gap-4">
        <ChatbotFloating />
        <div className="px-2 pb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
            Developed by Ajith RB
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
