
"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <AppHeader 
            onSearch={setSearchQuery} 
            onMyPosts={() => {}} 
            onShowMyPosts={(uid) => {
              if (uid) window.location.href = `/feed?user=${uid}`;
            }} 
          />
          <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
