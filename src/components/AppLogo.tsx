
"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  const logoData = PlaceHolderImages.find(img => img.id === 'brand-logo');
  
  return (
    <div className={cn("relative overflow-hidden bg-white flex items-center justify-center shadow-inner", className)}>
      <Image 
        src={logoData?.imageUrl || "https://picsum.photos/seed/pariposhan-logo-final/512/512"} 
        alt="Pariposhan Logo"
        width={512}
        height={512}
        className="object-contain w-full h-full p-1"
        priority
        unoptimized // Necessary for direct external links like drive images
        data-ai-hint="thali logo"
      />
    </div>
  );
}
