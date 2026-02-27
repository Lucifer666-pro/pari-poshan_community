
"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/card"; // Using Card as base for Button if custom, but standard button is better
import { Button as ShadcnButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Trophy, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SafetySnakePage() {
  const [snake, setSnake] = React.useState(INITIAL_SNAKE);
  const [food, setFood] = React.useState({ x: 5, y: 5 });
  const [direction, setDirection] = React.useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(true);

  const generateFood = React.useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Ensure food doesn't spawn on snake
    if (snake.some(s => s.x === newFood.x && s.y === newFood.y)) {
      return generateFood();
    }
    setFood(newFood);
  }, [snake]);

  const moveSnake = React.useCallback(() => {
    if (isGameOver || isPaused) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Check collisions
    if (
      head.x < 0 || head.x >= GRID_SIZE ||
      head.y < 0 || head.y >= GRID_SIZE ||
      newSnake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      setIsGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Check food consumption
    if (head.x === food.x && head.y === food.y) {
      setScore(s => s + 10);
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, isGameOver, isPaused, generateFood]);

  React.useEffect(() => {
    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [moveSnake]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case " ":
          if (!isGameOver) setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, isGameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setFood({ x: 5, y: 5 });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <ShadcnButton asChild variant="ghost" className="rounded-xl gap-2 font-bold text-slate-500">
            <Link href="/quiz-game">
              <ChevronLeft className="w-4 h-4" />
              Exit Arcade
            </Link>
          </ShadcnButton>
          <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-black uppercase tracking-widest text-primary">Score: {score}</span>
          </div>
        </div>

        <div className="relative aspect-square w-full max-w-[500px] mx-auto bg-slate-900 rounded-[2.5rem] overflow-hidden border-8 border-slate-800 shadow-2xl flex items-center justify-center">
          <div 
            className="grid gap-px bg-slate-800"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: "100%",
              height: "100%"
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnake = snake.some(s => s.x === x && s.y === y);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;

              return (
                <div 
                  key={i} 
                  className={cn(
                    "w-full h-full transition-all duration-100",
                    isHead ? "bg-primary rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.5)] z-10" : 
                    isSnake ? "bg-primary/60 rounded-sm" : 
                    isFood ? "bg-accent rounded-full animate-pulse shadow-[0_0_15px_rgba(190,242,94,0.6)]" : 
                    "bg-slate-900/50"
                  )}
                />
              );
            })}
          </div>

          {(isGameOver || isPaused) && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-8 text-center z-20">
              <div className="space-y-6 max-w-sm">
                <div className="bg-accent/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-accent/30">
                  <ShieldCheck className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                  {isGameOver ? "Audit Failed" : "Safety Protocol"}
                </h2>
                
                <Card className="bg-white/5 border-white/10 p-5 rounded-2xl text-left space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">How to play:</h4>
                  <ul className="text-xs text-slate-300 space-y-2 font-medium">
                    <li className="flex items-center gap-2">
                      <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">Arrows</kbd> 
                      <span>Navigate the Safety Inspector</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span>Collect Safe Ingredients (Green)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span>Avoid walls and your own trail</span>
                    </li>
                  </ul>
                </Card>

                <ShadcnButton onClick={isGameOver ? resetGame : () => setIsPaused(false)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-none">
                  {isGameOver ? "Restart Mission" : "Start Inspection"}
                </ShadcnButton>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Mobile Controls</h3>
          <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
            <div />
            <ShadcnButton variant="outline" size="icon" onClick={() => direction.y === 0 && setDirection({ x: 0, y: -1 })} className="h-12 w-12 rounded-xl border-2"><ChevronLeft className="rotate-90" /></ShadcnButton>
            <div />
            <ShadcnButton variant="outline" size="icon" onClick={() => direction.x === 0 && setDirection({ x: -1, y: 0 })} className="h-12 w-12 rounded-xl border-2"><ChevronLeft /></ShadcnButton>
            <ShadcnButton variant="outline" size="icon" onClick={() => direction.y === 0 && setDirection({ x: 0, y: 1 })} className="h-12 w-12 rounded-xl border-2"><ChevronLeft className="-rotate-90" /></ShadcnButton>
            <ShadcnButton variant="outline" size="icon" onClick={() => direction.x === 0 && setDirection({ x: 1, y: 0 })} className="h-12 w-12 rounded-xl border-2"><ChevronRight /></ShadcnButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
