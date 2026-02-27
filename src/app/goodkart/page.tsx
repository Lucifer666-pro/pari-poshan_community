
"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { 
  ShoppingBag, 
  Search, 
  Loader2, 
  ShieldCheck, 
  Clock, 
  AlertCircle
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import { SubmitProductDialog } from "@/components/SubmitProductDialog";
import { Input } from "@/components/ui/input";

export default function GoodKartPage() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = React.useState("");

  const productsRef = useMemoFirebase(() => collection(db, "products"), [db]);
  const productsQuery = useMemoFirebase(() => 
    query(productsRef, orderBy("dateAdded", "desc"), limit(50)), 
    [productsRef]
  );
  const { data: products, isLoading, error } = useCollection(productsQuery);

  const verifiedProducts = React.useMemo(() => {
    if (!products) return [];
    return products.filter(p => p.isVerified && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  const queueProducts = React.useMemo(() => {
    if (!products) return [];
    return products.filter(p => !p.isVerified && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-primary leading-none">GoodKart</h2>
              <p className="text-sm text-muted-foreground font-medium italic mt-1">Curated safe and sustainable food discovery.</p>
            </div>
          </div>
          <SubmitProductDialog />
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Filter products by name..." 
            className="pl-12 h-14 rounded-2xl border-none bg-white shadow-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Inventory...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center bg-red-50 rounded-[2.5rem] border-2 border-red-100">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <p className="font-bold text-red-600">Failed to load product inventory.</p>
          </div>
        ) : (
          <Tabs defaultValue="verified" className="w-full">
            <TabsList className="bg-white/50 p-1.5 rounded-[1.5rem] mb-8 ring-1 ring-slate-200">
              <TabsTrigger value="verified" className="rounded-xl px-6 h-10 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Safe
              </TabsTrigger>
              <TabsTrigger value="queue" className="rounded-xl px-6 h-10 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                <Clock className="w-3.5 h-3.5" />
                Review Queue
              </TabsTrigger>
            </TabsList>

            <TabsContent value="verified" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verifiedProducts.length > 0 ? (
                verifiedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-200">
                  <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Verified Products Found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="queue" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {queueProducts.length > 0 ? (
                queueProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-200">
                  <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Queue is Empty</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppShell>
  );
}
