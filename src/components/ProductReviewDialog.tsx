
"use client";

import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Star, 
  Loader2, 
  Send,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, increment, query, where, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function ProductReviewDialog({ product }: { product: any }) {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const reviewsRef = useMemoFirebase(() => 
    collection(db, "products", product.id, "product_reviews"), 
    [db, product.id]
  );
  const reviewsQuery = useMemoFirebase(() => 
    query(reviewsRef, where("status", "==", "approved"), limit(10)), 
    [reviewsRef]
  );
  const { data: reviews, isLoading: reviewsLoading } = useCollection(reviewsQuery);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Auth Required", description: "Sign in to vote." });
      return;
    }

    setIsSubmitting(true);
    
    const reviewData = {
      productId: product.id,
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0],
      userPhoto: user.photoURL,
      rating,
      comment,
      status: "approved",
      submissionDate: new Date().toISOString()
    };

    // Non-blocking mutation for the review itself
    addDocumentNonBlocking(reviewsRef, reviewData);
    
    // Update product rating (simple avg calculation logic for prototype)
    const productRef = doc(db, "products", product.id);
    const newTotal = (product.totalReviews || 0) + 1;
    const newRating = ((product.averageRating || 0) * (product.totalReviews || 0) + rating) / newTotal;
    
    // Non-blocking mutation for product metadata
    updateDocumentNonBlocking(productRef, {
      totalReviews: increment(1),
      averageRating: newRating
    });

    toast({ title: "Audit Recorded", description: "Your contribution has been added to the queue statistics." });
    
    // UI feedback
    setOpen(false);
    setComment("");
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-xl h-9 px-4 gap-2 text-primary font-black uppercase tracking-widest text-[9px] hover:bg-primary/5">
          View Audit Details <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="bg-primary p-8 text-white">
          <DialogTitle className="text-2xl font-black uppercase tracking-widest leading-none">Community Audit</DialogTitle>
          <DialogDescription className="text-white/70 font-medium">Review and vote on {product.name}</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100/50 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Safety Score</span>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent-foreground fill-current" />
                <span className="text-3xl font-black">{product.averageRating?.toFixed(1) || "0.0"}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100/50 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Audit Depth</span>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-3xl font-black">{product.totalReviews || 0}</span>
              </div>
            </div>
          </div>

          {user && (
            <form onSubmit={handleSubmitReview} className="space-y-4 bg-white p-6 rounded-[2rem] ring-1 ring-slate-100 shadow-sm">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Your Audit Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button 
                    key={v}
                    type="button"
                    onClick={() => setRating(v)}
                    className={cn(
                      "flex-1 h-12 rounded-xl flex items-center justify-center transition-all",
                      rating >= v ? "bg-accent text-accent-foreground" : "bg-slate-100 text-slate-400"
                    )}
                  >
                    <Star className={cn("w-5 h-5", rating >= v && "fill-current")} />
                  </button>
                ))}
              </div>
              <Textarea 
                placeholder="Provide details on FSSAI compliance, ingredient quality, or sourcing transparency..." 
                className="rounded-xl bg-slate-50 border-none min-h-[80px] font-medium text-xs"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    Commit Audit Data <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">Recent Peer Audits</h4>
            {reviewsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-200" />
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((r: any) => (
                  <div key={r.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex gap-4">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={r.userPhoto} />
                      <AvatarFallback className="text-[10px] font-bold">{r.userName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-900">{r.userName}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-accent-foreground fill-current" />
                          <span className="text-[10px] font-bold">{r.rating}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">"{r.comment}"</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[10px] font-bold text-slate-300 uppercase py-10 italic">No peer audits recorded yet.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
