"use client";

import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  BookPlus, 
  Loader2, 
  Image as ImageIcon,
  X,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  'Food Safety',
  'Health & Wellness',
  'Ecology',
  'Science News',
  'Nutrition'
];

export function CreateArticleDialog() {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [mediaPreview, setMediaPreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 1024 * 1024) {
      toast({ 
        variant: "destructive", 
        title: "File Too Large", 
        description: "Please upload an image smaller than 1MB." 
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Auth Required", description: "Sign in to contribute." });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "articles"), {
        title,
        content,
        category,
        authorId: user.uid,
        imageUrl: mediaPreview || `https://picsum.photos/seed/${Math.random()}/800/400`,
        createdAt: new Date().toISOString(),
      });

      toast({ title: "Insight Shared", description: "Your article is now live in the Knowledge Hub." });
      setOpen(false);
      resetForm();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not publish article." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory(CATEGORIES[0]);
    setMediaPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg gap-2 h-11 px-6 font-bold bg-primary text-white hover:bg-primary/90">
          <BookPlus className="w-5 h-5" />
          <span>Write Article</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[90vh]">
        <DialogHeader className="bg-primary p-6 md:p-8 text-white flex flex-row items-center justify-between shrink-0 relative pr-14">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-black uppercase tracking-widest leading-none">Curation Portal</DialogTitle>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Community Hub</p>
          </div>
          <Button 
            className="rounded-xl bg-white text-primary font-black uppercase tracking-widest px-6 h-10 border-none shadow-lg hover:bg-slate-50 transition-all shrink-0"
            onClick={handleSubmit} 
            disabled={!title || !content || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <div className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </div>
            )}
          </Button>
        </DialogHeader>
        
        <ScrollArea className="flex-1 w-full bg-white">
          <div className="p-8 space-y-8 pb-20">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Topic Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                      category === cat ? "bg-primary text-white border-primary shadow-md" : "border-slate-100 text-slate-400 hover:border-primary/20"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Headline</Label>
                <Input 
                  placeholder="e.g. The Future of Food Pathogen Testing..." 
                  className="h-12 rounded-2xl border-slate-100 bg-slate-50 font-bold placeholder:text-slate-300 focus:bg-white transition-colors"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Full Article Content</Label>
                <Textarea 
                  placeholder="Write your deep-dive or paste a social thread..." 
                  className="min-h-[250px] rounded-2xl border-slate-100 bg-slate-50 p-4 font-medium leading-relaxed placeholder:text-slate-300 focus:bg-white transition-colors"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Visual Context (Required for feed)</Label>
                 {!mediaPreview ? (
                   <Button 
                     variant="outline" 
                     type="button"
                     className="w-full h-40 rounded-2xl border-dashed border-2 flex-col gap-3 bg-slate-50/50 hover:bg-slate-50 transition-all group"
                     onClick={() => document.getElementById('article-image')?.click()}
                   >
                     <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                     <div className="text-center">
                       <p className="text-[10px] font-black uppercase text-slate-500">Upload Header Image</p>
                       <p className="text-[9px] text-slate-400 mt-1 font-medium italic">Supports JPG, PNG (Max 1MB)</p>
                     </div>
                   </Button>
                 ) : (
                   <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100 group">
                     <img src={mediaPreview} className="w-full aspect-[21/9] object-cover" alt="Preview" />
                     <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-3 right-3 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => setMediaPreview(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                   </div>
                 )}
                 <input id="article-image" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="bg-slate-50 p-4 border-t shrink-0 flex justify-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Articles are shared with the Pariposhan community instantly</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
