
"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { 
  Newspaper, 
  ExternalLink, 
  ShieldCheck, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  SearchX,
  FileText,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { fetchFoodSafetyNews, type NewsItem } from "@/ai/flows/fetch-food-safety-news";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const ITEMS_PER_PAGE = 5;
const REFRESH_INTERVAL_MS = 300000; // 5 minutes

export default function NewsPage() {
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  const loadNews = React.useCallback(async (showFullLoader = true) => {
    try {
      if (showFullLoader) setIsLoading(true);
      else setIsRefreshing(true);
      
      const result = await fetchFoodSafetyNews();
      if (result && result.news && result.news.length > 0) {
        setNews(result.news);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error("Failed to load news:", err);
      setNews([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and periodic auto-refresh
  React.useEffect(() => {
    loadNews(true);

    const interval = setInterval(() => {
      console.log("Automated news update initiated...");
      loadNews(false);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadNews]);

  const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);
  const paginatedNews = news.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <Newspaper className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-primary leading-none">Verified Bulletins</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground font-medium italic">Official regulatory alerts.</p>
                {isRefreshing && <RefreshCw className="w-3 h-3 animate-spin text-primary/40" />}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 h-8 px-4"
            onClick={() => loadNews(false)}
            disabled={isRefreshing}
          >
            <RefreshCw className={isRefreshing ? "animate-spin w-3 h-3" : "w-3 h-3"} />
            Refresh Feed
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Actual Bulletins...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center gap-6 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-200 px-6">
            <div className="bg-white p-6 rounded-full shadow-sm ring-1 ring-slate-100">
              <SearchX className="w-16 h-16 text-slate-300" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Bulletins Detected</h3>
              <p className="text-sm text-slate-400 font-medium italic">
                There are currently no high-priority safety alerts from verified official sources. The feed will update when new alerts arrive.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {paginatedNews.map((item, idx) => (
                <Card key={idx} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] bg-white ring-1 ring-slate-100">
                  <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100">
                    {item.thumbnailUrl ? (
                      <Image 
                        src={item.thumbnailUrl} 
                        alt={item.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        data-ai-hint="regulatory news"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <AlertTriangle className="w-12 h-12 text-slate-200" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-slate-900 text-white border-none text-[9px] font-black tracking-widest px-3 py-1 uppercase rounded-full">
                        {item.source}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.pubDate}</span>
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                    <div className="flex gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl shrink-0 h-fit">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-primary">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Bulletin</span>
                      </div>
                      <Button asChild variant="ghost" className="rounded-xl h-10 px-5 gap-2 text-slate-400 hover:text-primary font-bold">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          View Actual Release <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 border-t mt-8">
                <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1} className="rounded-xl gap-2 h-12 px-6 font-bold uppercase tracking-widest text-[10px] bg-white shadow-sm hover:shadow-md transition-all">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-5 py-2.5 rounded-xl shadow-inner">
                  {currentPage} / {totalPages}
                </span>
                <Button variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages} className="rounded-xl gap-2 h-12 px-6 font-bold uppercase tracking-widest text-[10px] bg-white shadow-sm hover:shadow-md transition-all">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
