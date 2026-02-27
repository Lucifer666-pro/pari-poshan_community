
"use client";

import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const REPORT_REASONS = [
  "Unsafe Food Practices",
  "Misinformation",
  "Spam",
  "Harassment",
  "Other"
];

export function ReportDialog({ postId, postTitle }: { postId: string; postTitle: string }) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState(REPORT_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const handleReport = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Sign in to report content." });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reports"), {
        postId,
        postTitle,
        reason,
        reporterId: user.uid,
        timestamp: new Date().toISOString(),
        status: "pending"
      });

      toast({
        title: "Report Submitted",
        description: "Our safety team has received your flag for review."
      });
      setOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Submission Failed", description: "Try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive">
          <Flag className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Potential Safety Issue</DialogTitle>
          <DialogDescription>
            Help us maintain a high standard of food culture. Why are you flagging this content?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={reason} onValueChange={setReason} className="grid gap-3">
            {REPORT_REASONS.map(r => (
              <div key={r} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/20 cursor-pointer">
                <RadioGroupItem value={r} id={`report-${r}`} />
                <Label htmlFor={`report-${r}`} className="flex-1 cursor-pointer font-medium">{r}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleReport} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
