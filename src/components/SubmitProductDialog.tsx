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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  ShieldCheck, 
  PackagePlus,
  ArrowRight,
  Image as ImageIcon,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function SubmitProductDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [mediaFile, setMediaFile] = React.useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Sign in to submit products." });
      return;
    }

    setIsSubmitting(true);
    
    const finalImageUrl = mediaPreview || `https://picsum.photos/seed/${Math.random()}/800/600`;

    const productData = {
      name,
      brand,
      description,
      isVerified: false,
      dateAdded: new Date().toISOString(),
      averageRating: 0,
      totalReviews: 0,
      submittedBy: user.uid,
      imageUrl: finalImageUrl
    };

    const productsRef = collection(db, "products");
    
    // Non-blocking mutation
    addDocumentNonBlocking(productsRef, productData);
    
    toast({ 
      title: "Submission Received", 
      description: "Your product is now in the Community Review Queue." 
    });
    
    setOpen(false);
    resetForm();
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setName("");
    setBrand("");
    setDescription("");
    setMediaFile(null);
    setMediaPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg gap-2 h-11 px-6 font-bold bg-slate-900 text-white hover:bg-slate-800">
          <PackagePlus className="w-5 h-5" />
          <span>Submit Product</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-slate-900 p-8 text-white relative shrink-0">
          <DialogTitle className="text-2xl font-black uppercase tracking-widest">Register Product</DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">Add an item to the Community Review Queue.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Product Name</Label>
            <Input 
              placeholder="e.g. Organic Heritage Rice" 
              className="h-12 rounded-2xl border-slate-100 bg-slate-50 font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Brand Name</Label>
            <Input 
              placeholder="e.g. Farm Fresh Collective" 
              className="h-12 rounded-2xl border-slate-100 bg-slate-50 font-bold"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Safety Description</Label>
            <Textarea 
              placeholder="What makes this product safe or special?" 
              className="min-h-[100px] rounded-2xl border-slate-100 bg-slate-50 p-4 font-medium"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Product Image</Label>
            {!mediaPreview ? (
              <Button 
                variant="outline" 
                type="button"
                className="w-full h-32 rounded-2xl border-dashed border-2 flex-col gap-2 bg-slate-50/50 hover:bg-slate-50 transition-all group"
                onClick={() => document.getElementById('product-image-upload')?.click()}
              >
                <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-primary" />
                <span className="text-[10px] font-black uppercase text-slate-500">Upload Photo</span>
              </Button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-4 border-slate-50 bg-slate-50 group">
                <img src={mediaPreview} alt="Preview" className="w-full aspect-video object-cover" />
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="absolute top-2 right-2 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeMedia}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <input 
              id="product-image-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </div>

          <div className="bg-primary/5 p-5 rounded-2xl flex items-start gap-3 border border-primary/10 shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <p className="text-[10px] font-bold text-primary leading-relaxed uppercase tracking-wide">
              Initial submissions are placed in the Community Review Queue for peer auditing before GoodKart Verification.
            </p>
          </div>

          <div className="flex gap-3 pt-2 shrink-0">
            <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setOpen(false)}>
              Discard
            </Button>
            <Button type="submit" className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Submit Audit <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}