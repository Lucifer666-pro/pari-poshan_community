'use client';

import * as React from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

/**
 * Chatbot Assistant component integrated into the sidebar.
 * Opens a drawer with the Pariposhan AI chatbot.
 */
export function ChatbotFloating() {
  const chatbotIcon = PlaceHolderImages.find(img => img.id === 'chatbot-icon')?.imageUrl;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="group flex items-center gap-3 w-full p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left">
          <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            {chatbotIcon ? (
              <Image 
                src={chatbotIcon} 
                alt="Chatbot Icon" 
                fill 
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">AI</div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 truncate">Pariposhan</p>
            <p className="text-[9px] text-slate-400 font-medium italic truncate">Food Safety Chatbot</p>
          </div>
          <Sparkles className="w-3 h-3 text-accent animate-pulse shrink-0" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-xl p-0 overflow-hidden border-r-none bg-white">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 bg-primary text-white shrink-0 flex-row items-center gap-3">
            <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border-2 border-white/20">
              {chatbotIcon && (
                <Image 
                  src={chatbotIcon} 
                  alt="Chatbot Header" 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="space-y-0.5 text-left">
              <SheetTitle className="text-white font-black uppercase tracking-widest text-lg leading-none">
                Pariposhan AI
              </SheetTitle>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Community Assistant</p>
            </div>
          </SheetHeader>
          <div className="flex-1 bg-slate-50 relative">
            <iframe 
              src="https://ajith-dev-pariposhan.hf.space?__theme=light" 
              className="absolute inset-0 w-full h-full border-none"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
              title="Pariposhan Chatbot"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
