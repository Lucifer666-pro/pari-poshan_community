
"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Trophy, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function QualityBouncePage() {
  const [ballPos, setBallPos] = React.useState({ x: 50, y: 350 });
  const [velocity, setVelocity] = React.useState({ x: 0, y: 0 });
  const [isGameOver, setIsGameOver] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(true);
  const [collectibles, setCollectibles] = React.useState<{ x: number, y: number, id: number }[]>([]);

  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const SPEED = 6;
  const BALL_SIZE = 24;
  const GROUND_Y = 350;

  // Generate a random collectible
  const generateCollectible = React.useCallback(() => {
    return {
      x: Math.random() * 400 + 50,
      y: Math.random() * 150 + 150,
      id: Math.random()
    };
  }, []);

  // Initialize collectibles
  React.useEffect(() => {
    setCollectibles([generateCollectible(), generateCollectible()]);
  }, [generateCollectible]);

  const updatePhysics = React.useCallback(() => {
    if (isGameOver || isPaused) return;

    setBallPos(prev => {
      let newX = prev.x + velocity.x;
      let newY = prev.y + velocity.y;
      let newVelY = velocity.y + GRAVITY;

      // Boundary checks
      if (newX < 0) newX = 0;
      if (newX > 450) newX = 450;

      // Ground check
      if (newY > GROUND_Y) {
        newY = GROUND_Y;
        newVelY = 0;
      }

      // Collectible collision
      setCollectibles(current => {
        const remaining = current.filter(c => {
          const dist = Math.sqrt(Math.pow(newX - c.x, 2) + Math.pow(newY - c.y, 2));
          if (dist < BALL_SIZE + 10) {
            setScore(s => s + 10);
            return false;
          }
          return true;
        });
        
        if (remaining.length < 2) {
          remaining.push(generateCollectible());
        }
        return remaining;
      });

      setVelocity(v => ({ ...v, y: newVelY }));
      return { x: newX, y: newY };
    });
  }, [isGameOver, isPaused, velocity, generateCollectible]);

  React.useEffect(() => {
    const interval = setInterval(updatePhysics, 1000 / 60);
    return () => clearInterval(interval);
  }, [updatePhysics]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      
      switch (e.key) {
        case "ArrowUp":
        case " ":
          if (ballPos.y >= GROUND_Y) setVelocity(v => ({ ...v, y: JUMP_FORCE }));
          break;
        case "ArrowLeft":
          setVelocity(v => ({ ...v, x: -SPEED }));
          break;
        case "ArrowRight":
          setVelocity(v => ({ ...v, x: SPEED }));
          break;
      }
      if (isPaused && (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === " ")) {
        setIsPaused(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setVelocity(v => ({ ...v, x: 0 }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [ballPos.y, isGameOver, isPaused]);

  const resetGame = () => {
    setBallPos({ x: 50, y: GROUND_Y });
    setVelocity({ x: 0, y: 0 });
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setCollectibles([generateCollectible(), generateCollectible()]);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="rounded-xl gap-2 font-bold text-slate-500">
            <Link href="/quiz-game">
              <ChevronLeft className="w-4 h-4" />
              Exit Arcade
            </Link>
          </Button>
          <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-black uppercase tracking-widest text-primary">QC Rating: {score}</span>
          </div>
        </div>

        <div className="relative h-[450px] w-full bg-slate-900 rounded-[3rem] overflow-hidden border-8 border-slate-800 shadow-2xl ring-1 ring-slate-100">
          {/* Production Line Background */}
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", 
            backgroundSize: "20px 20px" 
          }} />
          
          <div className="absolute bottom-0 w-full h-12 bg-slate-800 border-t-4 border-slate-700" />
          
          {/* Collectibles */}
          {collectibles.map(c => (
            <div 
              key={c.id}
              className="absolute bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"
              style={{ width: 15, height: 15, left: c.x, top: c.y }}
            />
          ))}
          
          {/* Quality Ball */}
          <div 
            className="absolute bg-accent rounded-full shadow-lg transition-transform duration-75"
            style={{ 
              width: BALL_SIZE, 
              height: BALL_SIZE, 
              left: ballPos.x, 
              top: ballPos.y,
              boxShadow: "inset -4px -4px 0px rgba(0,0,0,0.1), 0 10px 20px rgba(190,242,94,0.3)"
            }}
          />

          {(isPaused || isGameOver) && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-8 text-center z-20">
              <div className="space-y-6">
                <div className="bg-primary/20 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                  {isGameOver ? "Batch Failed" : "Quality Audit Mode"}
                </h2>
                
                <Card className="bg-white/5 border-white/10 p-6 rounded-2xl text-left space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Instructions:</h4>
                  <ul className="text-sm text-slate-300 space-y-2 font-medium">
                    <li className="flex items-center gap-2">
                      <kbd className="bg-slate-700 px-2 py-1 rounded text-[10px]">Left/Right</kbd> 
                      <span>Navigate the production line</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <kbd className="bg-slate-700 px-2 py-1 rounded text-[10px]">Up / Space</kbd> 
                      <span>Jump to collect Safety Nodes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Boost QC Rating by collecting green nodes</span>
                    </li>
                  </ul>
                </Card>

                <Button onClick={isGameOver ? resetGame : () => setIsPaused(false)} className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-none">
                  {isGameOver ? "Restart Batch" : "Start Audit"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white flex items-center gap-4">
            <div className="bg-accent/10 p-3 rounded-xl">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Line Status</p>
              <p className="font-bold text-slate-900">{isPaused ? "On Hold" : "Processing"}</p>
            </div>
          </Card>
          <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peak Rating</p>
              <p className="font-bold text-slate-900">{score}</p>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

