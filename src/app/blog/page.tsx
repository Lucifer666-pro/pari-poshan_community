
"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { 
  BookOpenText, 
  Clock, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  SearchX,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ShieldCheck
} from "lucide-react";
import Image from "next/image";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreateArticleDialog } from "@/components/CreateArticleDialog";
import { ReportDialog } from "@/components/ReportDialog";

const ITEMS_PER_PAGE = 5;

export default function BlogPage() {
  const db = useFirestore();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const articlesRef = useMemoFirebase(() => collection(db, "articles"), [db]);
  const articlesQuery = useMemoFirebase(() => query(articlesRef, orderBy("createdAt", "desc"), limit(50)), [articlesRef]);
  const { data: articles, isLoading } = useCollection(articlesQuery);

  // Pagination logic
  const totalPages = Math.ceil((articles?.length || 0) / ITEMS_PER_PAGE);
  const paginatedArticles = articles?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ) || [];

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      setExpandedId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setExpandedId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <BookOpenText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-primary leading-none">Knowledge Hub</h2>
              <p className="text-sm text-muted-foreground font-medium italic mt-1">Curation of safety insights from the community.</p>
            </div>
          </div>
          <CreateArticleDialog />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Knowledge Base...</p>
          </div>
        ) : paginatedArticles.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center gap-6 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 px-6">
            <SearchX className="w-16 h-16 text-slate-300" />
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Knowledge Base Empty</h3>
              <p className="text-sm text-slate-400 font-medium italic">Share your first curated deep-dive!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {paginatedArticles.map(article => {
              const isExpanded = expandedId === article.id;
              
              return (
                <Card key={article.id} className="group border-none shadow-none bg-transparent overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-6 shadow-xl ring-8 ring-slate-50 bg-slate-100">
                      <Image 
                        src={article.imageUrl || `https://picsum.photos/seed/${article.id}/800/400`} 
                        alt={article.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        data-ai-hint="food safety health"
                      />
                      <div className="absolute top-6 left-6 flex gap-2">
                        <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4 px-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Community Insight</span>
                        </div>
                        <ReportDialog postId={article.id} postTitle={article.title} />
                      </div>
                      
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">
                        {article.title}
                      </h3>
                      
                      <p className="text-muted-foreground font-medium leading-relaxed italic line-clamp-2">
                        {article.content.substring(0, 150) + "..."}
                      </p>

                      <div className={cn(
                        "overflow-hidden transition-all duration-500 ease-in-out",
                        isExpanded ? "max-h-[3000px] opacity-100 mt-6" : "max-h-0 opacity-0"
                      )}>
                        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-inner text-slate-600 leading-relaxed font-medium space-y-6">
                          {article.content.split('\n\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Recent'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <ShieldCheck className="w-3.5 h-3.5" />
                             Verified by Community
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          onClick={() => toggleExpand(article.id)}
                          className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] text-primary hover:bg-primary/5 h-10 px-6"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Minimize
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-4 h-4" />
                              Read Insight
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-10 border-t mt-12">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="rounded-xl gap-2 h-12 px-6 font-bold uppercase tracking-widest text-[10px] bg-white shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 shadow-inner px-5 py-2.5 rounded-xl">
                  {currentPage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-xl gap-2 h-12 px-6 font-bold uppercase tracking-widest text-[10px] bg-white shadow-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
