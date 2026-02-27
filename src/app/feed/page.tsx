"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { CommunityFeed } from "@/components/CommunityFeed";
import { useSearchParams } from "next/navigation";

export default function FeedPage() {
  const searchParams = useSearchParams();
  const authorIdFilter = searchParams.get('user');

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="pb-2 border-b">
          <h2 className="text-2xl font-black uppercase tracking-widest text-primary">Community Feed</h2>
          <p className="text-sm text-muted-foreground font-medium">Real-time safety facts and community discussions.</p>
        </div>
        <CommunityFeed 
          categoryFilter={null} 
          searchQuery="" 
          authorIdFilter={authorIdFilter}
        />
      </div>
    </AppShell>
  );
}