
"use client";

import * as React from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  MessageCircle, 
  Clock,
  ShieldCheck,
  MoreVertical,
  Send,
  Trash2,
  Reply,
  X
} from "lucide-react";
import Image from "next/image";
import { ReportDialog } from "@/components/ReportDialog";
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { 
  doc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  increment 
} from "firebase/firestore";
import { 
  setDocumentNonBlocking, 
  deleteDocumentNonBlocking, 
  addDocumentNonBlocking,
  updateDocumentNonBlocking 
} from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function FactCard({ post }: { post: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [showComments, setShowComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");
  const [replyingTo, setReplyingTo] = React.useState<any>(null);

  // Memoized references for real-time updates
  const likeRef = useMemoFirebase(() => 
    user ? doc(db, "posts", post.id, "likes", user.uid) : null, 
    [db, post.id, user?.uid]
  );
  const { data: userLike } = useDoc(likeRef);
  const isLiked = !!userLike;

  const commentsRef = useMemoFirebase(() => 
    collection(db, "posts", post.id, "comments"), 
    [db, post.id]
  );
  const commentsQuery = useMemoFirebase(() => 
    query(commentsRef, orderBy("createdAt", "asc"), limit(50)), 
    [commentsRef]
  );
  const { data: rawComments } = useCollection(commentsQuery);

  // Threading logic: group comments by parentId
  const threadedComments = React.useMemo(() => {
    if (!rawComments) return [];
    
    const roots = rawComments.filter(c => !c.parentId);
    const replies = rawComments.filter(c => c.parentId);

    return roots.map(root => ({
      ...root,
      replies: replies.filter(r => r.parentId === root.id)
    }));
  }, [rawComments]);

  const toggleLike = () => {
    if (!user) {
      toast({ title: "Auth Required", description: "Please sign in to like posts." });
      return;
    }

    const postDocRef = doc(db, "posts", post.id);

    if (isLiked) {
      deleteDocumentNonBlocking(likeRef!);
      updateDocumentNonBlocking(postDocRef, { likeCount: increment(-1) });
    } else {
      setDocumentNonBlocking(likeRef!, {
        userId: user.uid,
        postId: post.id,
        createdAt: new Date().toISOString()
      }, { merge: true });
      updateDocumentNonBlocking(postDocRef, { likeCount: increment(1) });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const commentData = {
      content: newComment.trim(),
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorPhoto: user.photoURL || '',
      postId: post.id,
      parentId: replyingTo?.id || null,
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(commentsRef, commentData);
    updateDocumentNonBlocking(doc(db, "posts", post.id), { commentCount: increment(1) });
    
    setNewComment("");
    setReplyingTo(null);
  };

  const handleDeleteComment = (commentId: string) => {
    const commentRef = doc(db, "posts", post.id, "comments", commentId);
    deleteDocumentNonBlocking(commentRef);
    updateDocumentNonBlocking(doc(db, "posts", post.id), { commentCount: increment(-1) });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: any, isReply?: boolean }) => (
    <div className={cn("flex gap-3 group", isReply && "ml-10")}>
      <Avatar className={cn("shrink-0", isReply ? "w-6 h-6" : "w-8 h-8")}>
        <AvatarImage src={comment.authorPhoto} />
        <AvatarFallback className="text-[10px] font-bold">
          {comment.authorName?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-900 text-xs">{comment.authorName}</span>
          <span className="text-[10px] text-muted-foreground">
            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
          </span>
        </div>
        <p className="text-slate-600 font-medium leading-snug">{comment.content}</p>
        
        <div className="flex items-center gap-3 mt-2">
          {!isReply && user && (
            <button 
              onClick={() => setReplyingTo(comment)}
              className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
          )}
          {user && (user.uid === comment.authorId || user.email === 'admin@pariposhan.com') && (
            <button 
              onClick={() => handleDeleteComment(comment.id)}
              className="text-[10px] font-bold text-red-400 flex items-center gap-1 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/5">
            <AvatarImage src={post.authorPhoto} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {post.authorName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">{post.authorName}</span>
              {post.isExpert && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] px-2 py-0 h-4 uppercase font-black tracking-widest">
                  <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                  Expert
                </Badge>
              )}
            </div>
            <div className="flex items-center text-[10px] text-muted-foreground gap-1 font-medium">
              <Clock className="w-3 h-3" />
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="px-5 pb-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {post.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {post.content}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border-none px-3">
            {post.category}
          </Badge>
        </div>
        
        {post.imageUrl && (
          <div className="relative aspect-[16/9] mt-4 rounded-2xl overflow-hidden group shadow-inner">
            <Image 
              src={post.imageUrl} 
              alt={post.title} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}

        {post.videoUrl && (
          <div className="relative aspect-[16/9] mt-4 rounded-2xl overflow-hidden shadow-inner bg-black">
            <video 
              src={post.videoUrl} 
              className="w-full h-full object-cover" 
              controls 
              poster={post.imageUrl || undefined}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch p-4 border-t bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLike}
              className={`gap-1.5 h-9 px-4 rounded-full transition-all ${isLiked ? 'text-rose-500 bg-rose-50 hover:bg-rose-100' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold">{post.likeCount || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className={`gap-1.5 h-9 px-4 rounded-full text-slate-500 hover:bg-slate-100 ${showComments ? 'bg-slate-100' : ''}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-bold">{post.commentCount || 0}</span>
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <ReportDialog postId={post.id} postTitle={post.title} />
          </div>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {threadedComments.length > 0 ? (
                threadedComments.map((thread: any) => (
                  <div key={thread.id} className="space-y-3">
                    <CommentItem comment={thread} />
                    {thread.replies.map((reply: any) => (
                      <CommentItem key={reply.id} comment={reply} isReply />
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-muted-foreground py-4 italic font-medium">No comments yet. Start the conversation!</p>
              )}
            </div>

            {user ? (
              <div className="space-y-2">
                {replyingTo && (
                  <div className="flex items-center justify-between bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                    <span className="text-[10px] font-bold text-primary uppercase">
                      Replying to {replyingTo.authorName}
                    </span>
                    <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="text-[10px] font-bold">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="relative flex-1">
                    <Input 
                      placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="h-10 pr-10 rounded-xl border-slate-200 bg-white focus:bg-white text-xs font-medium"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      variant="ghost" 
                      disabled={!newComment.trim()}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:text-primary/80"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2 border-t">Sign in to leave a comment</p>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
