
"use client";

import * as React from "react";
import { FactCard } from "@/components/FactCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface CommunityFeedProps {
  categoryFilter: string | null;
  searchQuery: string;
  authorIdFilter?: string | null;
}

export function CommunityFeed({ categoryFilter, searchQuery, authorIdFilter }: CommunityFeedProps) {
  const db = useFirestore();

  // Optimized query memoization using useMemoFirebase to prevent runtime errors
  const postsRef = useMemoFirebase(() => collection(db, "posts"), [db]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limit(50)), [postsRef]);

  const { data: firestorePosts, isLoading, error } = useCollection(postsQuery);

  const filteredAndSortedPosts = React.useMemo(() => {
    if (!firestorePosts) return [];
    return firestorePosts
      .filter(post => {
        const matchesCategory = !categoryFilter || post.category === categoryFilter;
        const matchesAuthor = !authorIdFilter || post.authorId === authorIdFilter;
        const matchesSearch = !searchQuery || 
          post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          post.content?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCategory && matchesAuthor && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [firestorePosts, categoryFilter, authorIdFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="space-y-4 border rounded-3xl p-6 bg-white">
            <div className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-24 h-3" />
              </div>
            </div>
            <Skeleton className="w-full h-48 rounded-2xl" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-3/4 h-6" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-3xl border-2 py-10 flex flex-col items-center text-center gap-4">
        <AlertCircle className="h-10 w-10" />
        <div>
          <AlertTitle className="text-xl font-black uppercase tracking-widest">Feed Synchronization Error</AlertTitle>
          <AlertDescription className="font-medium mt-2 max-w-md">
            We encountered an issue connecting to the safety feed.
          </AlertDescription>
        </div>
        <Button variant="outline" className="rounded-xl font-bold mt-4" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reconnect Feed
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {filteredAndSortedPosts.length > 0 ? (
        filteredAndSortedPosts.map(post => (
          <FactCard key={post.id} post={post} />
        ))
      ) : (
        <div className="text-center py-32 bg-white/50 backdrop-blur rounded-[3rem] border-4 border-dashed border-slate-200/50">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">No Content Found</h2>
          <p className="text-slate-400 font-medium mt-2 italic px-10">Be the first to share a safety alert or nutrition tip!</p>
        </div>
      )}
    </div>
  );
}
