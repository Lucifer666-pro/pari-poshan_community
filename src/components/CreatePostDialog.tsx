
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
  PlusCircle, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Loader2, 
  X,
  AlertCircle,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const CATEGORIES = [
  'Food Safety Alerts',
  'Label Education',
  'Recipes',
  'Nutrition Tips',
  'Food Allergies',
  'Sustainability',
  'General Discussion'
];

const MAX_VIDEO_SIZE_MB = 100;

export function CreatePostDialog() {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [mediaFile, setMediaFile] = React.useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setError(`Video size exceeds ${MAX_VIDEO_SIZE_MB}MB limit.`);
      return;
    }

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
    setError(null);
  };

  const handleSubmit = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Auth Required", description: "Sign in to post." });
      return;
    }

    setIsSubmitting(true);
    
    // In a real app, large media would go to Firebase Storage. 
    // For this prototype, we handle data URIs gracefully.
    const isTooLarge = mediaPreview && mediaPreview.length > 800000;
    
    const postData = {
      title,
      content,
      category,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorPhoto: user.photoURL || '',
      imageUrl: mediaFile?.type.startsWith('image/') ? (isTooLarge ? `https://picsum.photos/seed/${Math.random()}/800/600` : mediaPreview) : null,
      videoUrl: mediaFile?.type.startsWith('video/') ? (isTooLarge ? null : mediaPreview) : null,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isExpert: user.email === 'admin@pariposhan.com' // Admins are automatically experts
    };

    const postsRef = collection(db, "posts");
    
    // Non-blocking mutation for optimistic feel
    addDoc(postsRef, postData)
      .then(() => {
        toast({
          title: "Content Published",
          description: "Your post is now live in the community feed."
        });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: postsRef.path,
          operation: 'create',
          requestResourceData: postData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    // Reset and close dialog immediately
    setOpen(false);
    resetForm();
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory(CATEGORIES[0]);
    setMediaFile(null);
    setMediaPreview(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg gap-2 h-11 px-6 font-bold">
          <PlusCircle className="w-5 h-5" />
          <span>New Post</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-primary p-6 md:p-8 text-white flex flex-row items-center justify-between shrink-0 relative pr-14">
          <DialogTitle className="text-2xl font-black uppercase tracking-widest leading-none">Share Fact</DialogTitle>
          <Button 
            className="rounded-xl font-black uppercase tracking-widest px-6 h-10 shadow-lg bg-white text-primary hover:bg-slate-50 transition-all border-none"
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
        
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6 pb-12">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">File Error</AlertTitle>
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="rounded-xl">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Title</Label>
              <Input 
                id="title" 
                placeholder="Give your post a title..." 
                className="h-12 rounded-2xl border-slate-100 bg-slate-50 font-bold"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Content</Label>
              <Textarea 
                id="content" 
                placeholder="What would you like to share?" 
                className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50 p-4 font-medium"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Media (Photo or Video up to 100MB)</Label>
              {!mediaPreview ? (
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    type="button"
                    className="flex-1 h-24 rounded-2xl border-dashed border-2 flex-col gap-2 bg-slate-50/50 hover:bg-slate-50 transition-all group"
                    onClick={() => document.getElementById('media-upload')?.click()}
                  >
                    <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Photo</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button"
                    className="flex-1 h-24 rounded-2xl border-dashed border-2 flex-col gap-2 bg-slate-50/50 hover:bg-slate-50 transition-all group"
                    onClick={() => document.getElementById('media-upload')?.click()}
                  >
                    <VideoIcon className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Video</span>
                  </Button>
                  <input 
                    id="media-upload" 
                    type="file" 
                    accept="image/*,video/*" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-4 border-slate-50 bg-slate-50 group">
                  {mediaFile?.type.startsWith('image/') ? (
                    <img src={mediaPreview} alt="Preview" className="w-full aspect-video object-cover" />
                  ) : (
                    <video src={mediaPreview} className="w-full aspect-video object-cover" controls />
                  )}
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
            </div>
          </div>
        </ScrollArea>
        <div className="bg-slate-50 p-6 border-t shrink-0">
          <Button variant="ghost" className="rounded-xl font-bold px-6 text-slate-400 hover:text-slate-900" onClick={() => {
            resetForm();
            setOpen(false);
          }}>Discard Draft</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
