"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Gamepad2,
  Sword,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  ChevronRight,
  Lock,
  ExternalLink,
  Code,
  Heart,
  Sparkles
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface WorldDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  xp_reward: number;
  progress: {
    status: string;
    lessons_completed: number;
    games_completed: number;
    xp_earned: number;
  };
  lessons: Array<{
    id: string;
    title: string;
    order_index: number;
    estimated_minutes: number;
    topic_tags: string[];
  }>;
  games: Array<{
    id: string;
    name: string;
    game_type: string;
    xp_reward: number;
    order_index: number;
    tier: string;
    topic_tags: string[];
  }>;
  original_problems: Array<{
    id: string;
    title: string;
    description: string;
    starter_code: string;
    xp_reward: number;
    completed: boolean;
  }>;
  external_problems: Array<{
    id: string;
    title: string;
    platform: string;
    url: string;
    xp_reward: number;
    completed: boolean;
  }>;
  boss_unlocked: boolean;
  boss_battles: Array<{
    id: string;
    name: string;
    level: string;
    xp_reward: number;
    pass_threshold: number;
    badge: { id: string; name: string; rarity: string } | null;
  }>;
}

function GameTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    logic_builder: "Logic Builder",
    ifelse_constructor: "If-Else Builder",
    loop_builder: "Loop Builder",
    function_workshop: "Function Workshop",
    bfs_explorer: "BFS Explorer",
    dfs_adventure: "DFS Adventure",
  };
  return <span>{labels[type] ?? type.replace(/_/g, " ")}</span>;
}

function BossLevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    mini: "bg-accent-orange/20 text-accent-orange border-accent-orange/30",
    world: "bg-accent-red/20 text-accent-red border-accent-red/30",
    grand: "bg-accent-purple/20 text-accent-purple border-accent-purple/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${styles[level] ?? "bg-bg-elevated text-text-muted border-border"}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)} Boss
    </span>
  );
}

export default function WorldDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [world, setWorld] = useState<WorldDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Problems states
  const [submittingProblem, setSubmittingProblem] = useState<string | null>(null);

  // Boss session states
  const [bossSession, setBossSession] = useState<any>(null);

  const loadWorldData = () => {
    if (!slug) return;
    setLoading(true);
    apiFetch<WorldDetail>(`/worlds/${slug}`)
      .then((worldRes) => {
        setWorld(worldRes.data);
        
        // Fetch active boss session status if boss battles are available
        if (worldRes.data?.boss_battles?.length > 0) {
          const bossId = worldRes.data.boss_battles[0]!.id;
          apiFetch(`/boss/${bossId}/session/status`)
            .then((sessionRes: any) => {
              if (sessionRes.success && sessionRes.data) {
                setBossSession(sessionRes.data);
              } else {
                setBossSession(null);
              }
            })
            .catch(() => setBossSession(null));
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error("This module is locked. Complete prerequisites first.");
          router.push("/roadmaps");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWorldData();
  }, [slug, router]);

  const handleStartBossSession = async (bossId: string) => {
    try {
      const res: any = await apiFetch(`/boss/${bossId}/session/start`, { method: "POST" });
      if (res.success) {
        toast.success("Portal opened! Face the boss.");
        router.push(`/roadmaps/${slug}/boss/${bossId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start boss battle.");
    }
  };

  const handleCompleteProblem = async (problemId: string, type: "original" | "external") => {
    setSubmittingProblem(problemId);
    try {
      const body: Record<string, string> = {};
      const res: any = await apiFetch(`/worlds/${slug}/problems/${type}/${problemId}/complete`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (res.success) {
        toast.success(res.data?.message || "Problem completed!");
        loadWorldData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit.");
    } finally {
      setSubmittingProblem(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 bg-bg-elevated rounded w-48" />
        <div className="h-32 bg-bg-secondary rounded-xl border border-border" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-bg-secondary rounded-xl border border-border" />
          ))}
        </div>
      </div>
    );
  }

  if (!world) return null;

  const totalLessons = world.lessons.length;
  const lessonsDone = world.progress.lessons_completed;
  const totalGames = world.games.length;
  const gamesDone = world.progress.games_completed;
  const totalOriginal = world.original_problems.length;
  const originalDone = world.original_problems.filter(p => p.completed).length;
  const totalExternal = world.external_problems.length;
  const externalDone = world.external_problems.filter(p => p.completed).length;

  const progressPct =
    totalLessons > 0
      ? Math.round((lessonsDone / totalLessons) * 100)
      : 0;



  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/roadmaps"
        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Roadmaps
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary border border-border rounded-2xl p-8 mb-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/10 to-accent-purple/5" />
        <div className="relative">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">{world.name}</h1>
          <p className="text-text-secondary mb-6 max-w-2xl">{world.description}</p>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-full bg-bg-elevated rounded-full h-2 w-48">
                <div
                  className="bg-brand-cyan h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-sm text-text-secondary font-mono">{progressPct}%</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-text-secondary">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {lessonsDone}/{totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                {gamesDone}/{totalGames} games
              </span>
              <span className="flex items-center gap-1">
                <Code className="w-3.5 h-3.5" />
                {originalDone + externalDone}/{totalOriginal + totalExternal} practice
              </span>
              <span className="flex items-center gap-1 text-accent-orange">
                ⚡ {world.progress.xp_earned}/{world.xp_reward} XP
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid: Left column (Lessons & Games), Right column (Problems & Boss) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Lessons & Games) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Lessons */}
          <section>
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-cyan" />
              Lessons
            </h2>
            <div className="space-y-3">
              {world.lessons.map((lesson, idx) => {
                const isCompleted = idx < lessonsDone;
                const isCurrent = idx === lessonsDone;
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      isCompleted
                        ? "bg-accent-green/5 border-accent-green/20"
                        : isCurrent
                        ? "bg-brand-cyan/5 border-brand-cyan/30 animate-pulse-slow"
                        : "bg-bg-secondary border-border opacity-70"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0" />
                    ) : isCurrent ? (
                      <Circle className="w-5 h-5 text-brand-cyan shrink-0 animate-ping-slow" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center shrink-0">
                        <span className="text-xs text-text-muted">{idx + 1}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white">{lesson.title}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.estimated_minutes} min
                        </span>
                        <div className="flex gap-1">
                          {lesson.topic_tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-border/60">
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {(isCompleted || isCurrent) ? (
                        <Link
                          href={`/roadmaps/${slug}/lesson/${lesson.id}`}
                          className="text-xs text-brand-cyan hover:underline flex items-center gap-0.5"
                        >
                          Read <ChevronRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Games */}
          <section>
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-accent-purple" />
              Coding Games
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {world.games.map((game) => {
                const isLessonPrereqMet = lessonsDone >= totalLessons;
                return (
                  <div
                    key={game.id}
                    className={`p-4 bg-bg-secondary border rounded-xl flex flex-col justify-between transition-all duration-200 ${
                      isLessonPrereqMet
                        ? "border-border hover:border-accent-purple/40"
                        : "border-border/60 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-white">
                          {game.name}
                        </h3>
                        {game.tier === "premium" && (
                          <span className="text-[10px] bg-accent-orange/20 text-accent-orange px-1.5 py-0.5 rounded border border-accent-orange/20 font-bold">PRO</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mb-4">
                        <GameTypeLabel type={game.game_type} />
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {game.topic_tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] bg-bg-elevated text-text-secondary px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {isLessonPrereqMet ? (
                        <Link
                          href={`/roadmaps/${slug}/game/${game.id}`}
                          className="inline-flex items-center gap-1 text-xs bg-accent-purple text-white px-3 py-1.5 rounded-lg font-medium hover:bg-accent-purple/90 transition-colors"
                        >
                          Play Game
                        </Link>
                      ) : (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right Column (Problems & Boss Battle Gating) */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Gated Boss Battle Portal */}
          <section>
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Sword className="w-5 h-5 text-accent-red" />
              Boss Arena
            </h2>
            {world.boss_battles.map((boss) => {
              const isGated = !world.boss_unlocked;
              
              return (
                <div
                  key={boss.id}
                  className={`bg-bg-secondary border rounded-2xl overflow-hidden ${
                    isGated
                      ? "border-border opacity-70"
                      : "border-accent-red/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        isGated ? "bg-bg-elevated border border-border" : "bg-accent-red/10 border border-accent-red/20 text-accent-red"
                      }`}>
                        👹
                      </div>
                      <div>
                        <h3 className="text-base font-heading font-bold text-white">{boss.name}</h3>
                        <BossLevelBadge level={boss.level} />
                      </div>
                    </div>

                    {/* Gated checklist message */}
                    {isGated ? (
                      <div className="space-y-4">
                        <div className="bg-bg-elevated/60 border border-border p-4 rounded-xl space-y-2">
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Unlocking Criteria Checklist:</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">1. Lessons Completed</span>
                              <span className={lessonsDone >= totalLessons ? "text-accent-green" : "text-accent-orange"}>
                                {lessonsDone}/{totalLessons}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">2. Game Completed</span>
                              <span className={gamesDone >= totalGames ? "text-accent-green" : "text-accent-orange"}>
                                {gamesDone}/{totalGames}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">3. Original Problems Solved</span>
                              <span className={originalDone >= totalOriginal ? "text-accent-green" : "text-accent-orange"}>
                                {originalDone}/{totalOriginal}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-secondary">4. External Problems Solved</span>
                              <span className={externalDone >= totalExternal ? "text-accent-green" : "text-accent-orange"}>
                                {externalDone}/{totalExternal}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-text-muted leading-relaxed text-center italic bg-bg-elevated/25 p-2 rounded-lg">
                          🔒 Gated. Finish all tasks in the module to unlock.
                        </div>
                      </div>
                    ) : (
                      /* Portal Unlocked UI */
                      <div className="space-y-5">
                        {bossSession ? (
                          /* Resume Active Session */
                          <div className="space-y-4">
                            <div className="bg-bg-elevated border border-border p-4 rounded-xl text-center space-y-2.5">
                              <p className="text-xs font-semibold text-accent-orange uppercase tracking-wider flex items-center justify-center gap-1">
                                <Sparkles className="w-3 h-3 animate-pulse" />
                                Active Battle Session
                              </p>
                              
                              <div className="flex justify-center gap-1.5 my-2">
                                {[1, 2, 3].map((heartIndex) => (
                                  <Heart
                                    key={heartIndex}
                                    className={`w-5 h-5 ${
                                      heartIndex <= bossSession.lives
                                        ? "text-accent-red fill-accent-red"
                                        : "text-text-muted"
                                    }`}
                                  />
                                ))}
                              </div>

                              <p className="text-sm font-semibold text-white">
                                Level {bossSession.currentLevel} of 3
                              </p>
                            </div>

                            <Link
                              href={`/roadmaps/${slug}/boss/${boss.id}`}
                              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent-orange hover:bg-accent-orange/95 text-white font-bold text-sm transition-colors text-center shadow-lg shadow-accent-orange/10"
                            >
                              Resume Boss Fight
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        ) : (
                          /* Start New Session */
                          <div className="space-y-4">
                            <div className="text-xs text-text-secondary leading-relaxed bg-bg-elevated p-3 rounded-xl text-center border border-border/40">
                              ⚡ portal unlocked! Face the module boss in a 3-level gauntlet (Quiz → Matching → Live Code). You have 3 lives.
                            </div>
                            
                            <button
                              onClick={() => handleStartBossSession(boss.id)}
                              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent-red hover:bg-accent-red/95 text-white font-bold text-sm transition-colors text-center shadow-lg shadow-accent-red/10"
                            >
                              Enter Boss Portal
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Practice Problems Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-accent-purple" />
              Practice Problems
            </h2>

            {/* Original problems list */}
            {world.original_problems.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Original Challenges</p>
                {world.original_problems.map((prob) => (
                  <div
                    key={prob.id}
                    className="bg-bg-secondary border border-border rounded-xl overflow-hidden hover:border-brand-cyan/25 transition-all duration-200"
                  >
                    <Link
                      href={`/roadmaps/${slug}/problems/${prob.id}`}
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-bg-elevated/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {prob.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-muted shrink-0" />
                        )}
                        <span className="text-sm font-medium text-white truncate max-w-[240px]">{prob.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-bg-elevated text-accent-orange px-2 py-0.5 rounded font-mono shrink-0">+{prob.xp_reward} XP</span>
                        <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* External problems list */}
            {world.external_problems.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">External Practice Links</p>
                {world.external_problems.map((prob) => (
                  <div
                    key={prob.id}
                    className="p-4 bg-bg-secondary border border-border rounded-xl flex flex-col gap-3 justify-between"
                  >
                    <div className="flex items-start justify-between min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {prob.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-muted shrink-0" />
                        )}
                        <span className="text-sm font-medium text-white truncate max-w-[200px]">{prob.title}</span>
                      </div>
                      <span className="text-[10px] text-text-muted font-mono">{prob.platform}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-cyan hover:underline"
                      >
                        Solve on {prob.platform}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      
                      {!prob.completed && (
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-[10px] text-text-muted italic">Honor system disclaimer: Mark this once you've solved it on {prob.platform} — not automatically verified</p>
                          <button
                            onClick={() => handleCompleteProblem(prob.id, "external")}
                            disabled={submittingProblem === prob.id}
                            className="px-2.5 py-1 text-[11px] bg-bg-elevated border border-border hover:border-brand-cyan/40 hover:bg-bg-elevated/70 text-text-secondary hover:text-white rounded transition-colors font-medium"
                          >
                            Mark Solved
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
