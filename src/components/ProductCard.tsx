"use client";

import * as React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Package, 
  MessageSquare, 
  ThumbsUp,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductReviewDialog } from "@/components/ProductReviewDialog";

interface ProductCardProps {
  product: any;
  isAdminMode?: boolean;
  onApprove?: (id: string) => void;
}

export function ProductCard({ product, isAdminMode, onApprove }: ProductCardProps) {
  return (
    <Card className={cn(
      "group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] bg-white ring-1 ring-slate-100",
      !product.isVerified && "ring-slate-900/5 opacity-90"
    )}>
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            data-ai-hint="food product"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-12 h-12 text-slate-200" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          {product.isVerified ? (
            <Badge className="bg-primary text-white border-none text-[8px] font-black tracking-widest px-3 py-1 uppercase rounded-full shadow-lg">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Verified Safe
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-slate-900 text-white border-none text-[8px] font-black tracking-widest px-3 py-1 uppercase rounded-full shadow-lg">
              Pending Audit
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="p-6 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg font-black text-slate-900 leading-tight">
              {product.name}
            </CardTitle>
            <CardDescription className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
              {product.brand}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 text-accent-foreground fill-current" />
            <span className="text-[10px] font-black text-accent-foreground">
              {product.averageRating?.toFixed(1) || "0.0"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-slate-50 mt-4 bg-slate-50/30">
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {product.totalReviews || 0} Reviews
          </div>
        </div>
        
        {isAdminMode && onApprove ? (
          <Button 
            size="sm" 
            className="rounded-xl bg-primary text-white h-9 px-6 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20"
            onClick={() => onApprove(product.id)}
          >
            Promote to GoodKart
          </Button>
        ) : (
          <ProductReviewDialog product={product} />
        )}
      </CardFooter>
      
      {product.isVerified && (
        <div className="px-6 py-2 bg-primary/5 flex items-center gap-2">
          <ThumbsUp className="w-3 h-3 text-primary" />
          <span className="text-[8px] font-black text-primary uppercase tracking-widest">
            Verified Safe & Community Favorite
          </span>
        </div>
      )}
    </Card>
  );
}