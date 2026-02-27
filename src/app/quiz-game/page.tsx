
"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { 
  Gamepad2, 
  Trophy, 
  Brain, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  LayoutGrid,
  Joystick
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WEEKLY_QUIZZES, type WeeklyQuiz } from "@/lib/quiz-data";
import { cn } from "@/lib/utils";
import { useFirestore, useUser } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

type GameSection = 'knowledge' | 'arcade';
type GameState = 'list' | 'intro' | 'playing' | 'result';

const QUIZZES_PER_PAGE = 3;

export default function QuizGamePage() {
  const { user } = useUser();
  const db = useFirestore();
  const [activeSection, setActiveSection] = React.useState<GameSection>('knowledge');
  const [gameState, setGameState] = React.useState<GameState>('list');
  const [currentQuiz, setCurrentQuiz] = React.useState<WeeklyQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [hasConfirmed, setHasConfirmed] = React.useState(false);
  
  // List pagination state
  const [listPage, setListPage] = React.useState(1);
  
  // Timer state
  const [startTime, setStartTime] = React.useState<number>(0);
  const [finalTime, setFinalTime] = React.useState<number>(0);

  const quizList = React.useMemo(() => Object.values(WEEKLY_QUIZZES), []);
  const totalPages = Math.ceil(quizList.length / QUIZZES_PER_PAGE);
  const paginatedQuizzes = quizList.slice((listPage - 1) * QUIZZES_PER_PAGE, listPage * QUIZZES_PER_PAGE);

  const selectQuiz = (quiz: WeeklyQuiz) => {
    setCurrentQuiz(quiz);
    setGameState('intro');
  };

  const startQuiz = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setHasConfirmed(false);
    setSelectedOption(null);
    setStartTime(Date.now());
  };

  const handleOptionSelect = (index: number) => {
    if (hasConfirmed) return;
    setSelectedOption(index);
  };

  const confirmAnswer = () => {
    if (selectedOption === null || hasConfirmed) return;
    
    setHasConfirmed(true);
    const isCorrect = selectedOption === currentQuiz?.questions[currentQuestionIndex].correctIndex;
    if (isCorrect) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    if (!currentQuiz) return;
    
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasConfirmed(false);
    } else {
      const timeTaken = (Date.now() - startTime) / 1000;
      setFinalTime(timeTaken);
      setGameState('result');
      saveScore(score, timeTaken);
    }
  };

  const saveScore = (finalScore: number, time: number) => {
    if (!user || !currentQuiz) return;
    
    addDocumentNonBlocking(collection(db, "quiz_scores"), {
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      userPhoto: user.photoURL || '',
      score: finalScore,
      timeTaken: time,
      quizDate: currentQuiz.date,
      challengeType: "weekly",
      createdAt: serverTimestamp()
    });
  };

  const resetGame = () => {
    setGameState('list');
    setCurrentQuiz(null);
  };

  const getQuizImage = (topic: string) => {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('safety') || topicLower.includes('food')) {
      return PlaceHolderImages.find(img => img.id === 'food-safety-1')?.imageUrl || PlaceHolderImages[0].imageUrl;
    }
    if (topicLower.includes('ecology') || topicLower.includes('soil')) {
      return PlaceHolderImages.find(img => img.id === 'quiz-ecology')?.imageUrl || PlaceHolderImages[0].imageUrl;
    }
    if (topicLower.includes('health') || topicLower.includes('microbiome')) {
      return PlaceHolderImages.find(img => img.id === 'quiz-health')?.imageUrl || PlaceHolderImages[0].imageUrl;
    }
    if (topicLower.includes('tech') || topicLower.includes('science') || topicLower.includes('lab')) {
      return PlaceHolderImages.find(img => img.id === 'quiz-science')?.imageUrl || PlaceHolderImages[0].imageUrl;
    }
    if (topicLower.includes('nutrition')) {
      return PlaceHolderImages.find(img => img.id === 'quiz-nutrition')?.imageUrl || PlaceHolderImages[0].imageUrl;
    }
    
    return PlaceHolderImages[0].imageUrl;
  };

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const gameProgress = currentQuiz ? ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100 : 0;

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="bg-white border rounded-[2rem] p-2 flex items-center justify-between shadow-sm overflow-x-auto">
          <button 
            onClick={() => setActiveSection('knowledge')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-12 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-4",
              activeSection === 'knowledge' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-primary hover:bg-slate-50"
            )}
          >
            <Brain className="w-4 h-4" />
            Knowledge Sprint
          </button>
          <button 
            onClick={() => setActiveSection('arcade')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-12 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-4",
              activeSection === 'arcade' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-primary hover:bg-slate-50"
            )}
          >
            <Joystick className="w-4 h-4" />
            Retro Arcade
          </button>
        </div>

        {activeSection === 'arcade' ? (
          <div className="space-y-8 pt-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="bg-primary/10 p-2.5 rounded-2xl">
                <Joystick className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-primary leading-none">Arcade Lab</h2>
                <p className="text-sm text-muted-foreground font-medium italic mt-1">Retro gaming with a food safety twist.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/games/snake">
                <Card className="group rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden ring-1 ring-slate-100 cursor-pointer h-full">
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                    <div className="flex items-center justify-center h-full">
                      <div className="w-4 h-4 bg-primary rounded-sm animate-pulse mr-1" />
                      <div className="w-4 h-4 bg-primary rounded-sm animate-pulse mr-1" />
                      <div className="w-4 h-4 bg-primary rounded-sm animate-pulse" />
                      <div className="ml-4 w-4 h-4 bg-accent rounded-full animate-bounce" />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Safety Snake</h3>
                    <p className="text-xs text-muted-foreground font-medium italic">Consume safe ingredients and avoid pathogens to grow your safety rating.</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/games/bounce">
                <Card className="group rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden ring-1 ring-slate-100 cursor-pointer h-full">
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent rounded-full animate-bounce shadow-lg" />
                    <div className="absolute bottom-0 w-full h-4 bg-slate-200" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Quality Bounce</h3>
                    <p className="text-xs text-muted-foreground font-medium italic">Navigate the production line as a QC ball. Collect certificates and avoid hazards.</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="bg-primary/10 p-2.5 rounded-2xl">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-primary leading-none">Weekly Challenge</h2>
                <p className="text-sm text-muted-foreground font-medium italic mt-1">Science, Ecology & Health Quizzes.</p>
              </div>
            </div>

            {gameState === 'list' && (
              <div className="space-y-8 pt-6">
                <div className="grid gap-6">
                  {paginatedQuizzes.map((quiz) => (
                    <Card 
                      key={quiz.date} 
                      className="group rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden ring-1 ring-slate-100 cursor-pointer"
                      onClick={() => selectQuiz(quiz)}
                    >
                      <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-48 aspect-square rounded-[2rem] bg-slate-100 overflow-hidden shrink-0 border-4 border-white shadow-inner relative">
                          <Image 
                            src={getQuizImage(quiz.topic)} 
                            alt={quiz.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            data-ai-hint="science ecology"
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                              {quiz.date}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {quiz.topic}
                            </span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium italic">
                            Explore the intersection of {quiz.topic.toLowerCase()} and modern science in this week's sprint.
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="hidden md:flex rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6">
                    <Button 
                      variant="outline" 
                      disabled={listPage === 1} 
                      onClick={() => setListPage(prev => prev - 1)}
                      className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[10px] gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-2 h-2 rounded-full transition-all", 
                            listPage === i + 1 ? "bg-primary w-6" : "bg-slate-200"
                          )} 
                        />
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      disabled={listPage === totalPages} 
                      onClick={() => setListPage(prev => prev + 1)}
                      className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[10px] gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {gameState === 'intro' && currentQuiz && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                      <Button variant="ghost" size="sm" onClick={() => setGameState('list')} className="rounded-xl text-slate-400 hover:text-slate-900 font-bold px-0 pr-4">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to List
                      </Button>
                    </div>
                    <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground border-none">
                      {currentQuiz.date}
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">
                      {currentQuiz.title}
                    </h1>
                    <p className="text-muted-foreground font-medium italic leading-relaxed">
                      Deepen your understanding of {currentQuiz.topic}. Complete this week's questions to advance your ranking.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm space-y-2">
                      <LayoutGrid className="w-5 h-5 text-primary" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Challenge Tier</p>
                      <p className="text-xl font-black">{activeSection.toUpperCase()}</p>
                    </div>
                  </div>

                  <Button 
                    onClick={startQuiz}
                    className="w-full h-16 rounded-[2rem] text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-3"
                  >
                    Enter Arena <ArrowRight className="w-6 h-6" />
                  </Button>
                </div>

                <div className="hidden md:block relative aspect-square bg-slate-100 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl sticky top-24">
                  <Image 
                    src={getQuizImage(currentQuiz.topic)} 
                    alt="Weekly Challenge" 
                    fill
                    className="object-cover opacity-80"
                    data-ai-hint="science"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-10">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                      <Trophy className="w-10 h-10 text-white mb-2" />
                      <p className="text-white font-black uppercase tracking-widest text-xs">2026 Elite Series</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {gameState === 'playing' && currentQuestion && (
              <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                      {currentQuestion.category}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Question {currentQuestionIndex + 1} of 5
                    </span>
                  </div>
                  <Progress value={gameProgress} className="h-3 rounded-full" />
                </div>

                <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden ring-8 ring-slate-50">
                  <CardContent className="p-10 space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 leading-snug text-center">
                      {currentQuestion.prompt}
                    </h3>

                    <div className="grid gap-4">
                      {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === currentQuestion.correctIndex;
                        const isWrong = isSelected && !isCorrect;

                        return (
                          <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={hasConfirmed}
                            className={cn(
                              "w-full p-6 rounded-[1.5rem] border-2 text-left font-bold transition-all flex items-center justify-between gap-4",
                              !hasConfirmed && isSelected ? "border-primary bg-primary/5 text-primary shadow-lg" : "border-slate-100 hover:border-primary/50",
                              hasConfirmed && isCorrect && "border-green-500 bg-green-50 text-green-700",
                              hasConfirmed && isWrong && "border-red-500 bg-red-50 text-red-700",
                              !isSelected && hasConfirmed && "opacity-50"
                            )}
                          >
                            <span>{option}</span>
                            {hasConfirmed && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                            {hasConfirmed && isWrong && <XCircle className="w-6 h-6 text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center pt-4">
                  {!hasConfirmed ? (
                    <Button 
                      disabled={selectedOption === null}
                      onClick={confirmAnswer}
                      className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest"
                    >
                      Verify Answer
                    </Button>
                  ) : (
                    <Button 
                      onClick={nextQuestion}
                      className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest gap-2"
                    >
                      {currentQuestionIndex < 4 ? "Next" : "View Result"} 
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {gameState === 'result' && (
              <div className="max-w-md mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500 pt-10">
                <div className="relative inline-block">
                  <div className="bg-primary/10 w-40 h-40 rounded-[3rem] flex items-center justify-center animate-bounce">
                    <Trophy className="w-20 h-20 text-primary" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-accent p-4 rounded-2xl shadow-xl ring-4 ring-white">
                    <Zap className="w-8 h-8 text-accent-foreground" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Mission Success</h2>
                  <p className="text-muted-foreground font-medium italic px-6">
                    You've completed this week's challenge. Your accuracy and completion speed have been recorded.
                  </p>
                </div>

                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6">
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Score</p>
                      <p className="text-3xl font-black text-primary">{score}/5</p>
                    </div>
                    <div className="w-px h-12 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time</p>
                      <p className="text-3xl font-black text-primary">{finalTime.toFixed(1)}s</p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button onClick={startQuiz} variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-2">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry Protocol
                    </Button>
                    <Button onClick={resetGame} variant="ghost" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-slate-400">
                      Exit to Hub
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
