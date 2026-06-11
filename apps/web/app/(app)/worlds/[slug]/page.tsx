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
  Trophy,
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
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    apiFetch<WorldDetail>(`/worlds/${slug}`)
      .then((res) => setWorld(res.data))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error("This world is locked. Complete prerequisites first.");
          router.push("/worlds");
        }
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleCompleteLesson = async (lessonId: string) => {
    if (!slug) return;
    setCompletingLesson(lessonId);
    try {
      await apiFetch(`/worlds/${slug}/lessons/${lessonId}/complete`, { method: "POST" });
      toast.success("Lesson completed! +25 XP earned 🎉");
      // Refresh world data
      const res = await apiFetch<WorldDetail>(`/worlds/${slug}`);
      setWorld(res.data);
    } catch {
      toast.error("Failed to mark lesson complete");
    } finally {
      setCompletingLesson(null);
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

  const progressPct =
    world.lessons.length > 0
      ? Math.round((world.progress.lessons_completed / world.lessons.length) * 100)
      : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/worlds"
        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Worlds
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

            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {world.progress.lessons_completed}/{world.lessons.length} lessons
              </span>
              <span className="flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                {world.progress.games_completed}/{world.games.length} games
              </span>
              <span className="flex items-center gap-1 text-accent-orange">
                ⚡ {world.progress.xp_earned}/{world.xp_reward} XP
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lessons */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-cyan" />
          Lessons
        </h2>
        <div className="space-y-3">
          {world.lessons.map((lesson, idx) => {
            const isCompleted = idx < world.progress.lessons_completed;
            const isCurrent = idx === world.progress.lessons_completed;
            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                  isCompleted
                    ? "bg-accent-green/5 border-accent-green/20"
                    : isCurrent
                    ? "bg-brand-cyan/5 border-brand-cyan/30"
                    : "bg-bg-secondary border-border"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0" />
                ) : isCurrent ? (
                  <Circle className="w-5 h-5 text-brand-cyan shrink-0" />
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
                        <span key={tag} className="text-xs bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent && (
                    <button
                      onClick={() => void handleCompleteLesson(lesson.id)}
                      disabled={completingLesson === lesson.id}
                      className="text-xs bg-brand-cyan text-bg-primary px-3 py-1.5 rounded-lg font-medium hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
                    >
                      {completingLesson === lesson.id ? "Saving..." : "Complete"}
                    </button>
                  )}
                  <Link
                    href={`/worlds/${slug}/lesson/${lesson.id}`}
                    className="text-xs text-brand-cyan hover:underline flex items-center gap-0.5"
                  >
                    Read <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Games */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-accent-purple" />
          Games
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {world.games.map((game) => (
            <Link
              key={game.id}
              href={`/worlds/${slug}/game/${game.id}`}
              className="group p-4 bg-bg-secondary border border-border hover:border-accent-purple/40 rounded-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-white group-hover:text-accent-purple transition-colors">
                  {game.name}
                </h3>
                {game.tier === "premium" && (
                  <span className="text-xs bg-accent-orange/20 text-accent-orange px-1.5 py-0.5 rounded">PRO</span>
                )}
              </div>
              <p className="text-xs text-text-muted mb-3">
                <GameTypeLabel type={game.game_type} />
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {game.topic_tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs bg-bg-elevated text-text-muted px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-accent-orange font-mono">+{game.xp_reward} XP</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Boss Battles */}
      {world.boss_battles.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-heading font-semibold text-white mb-4 flex items-center gap-2">
            <Sword className="w-5 h-5 text-accent-red" />
            Boss Battles
          </h2>
          <div className="space-y-3">
            {world.boss_battles.map((boss) => (
              <Link
                key={boss.id}
                href={`/worlds/${slug}/boss/${boss.id}`}
                className="group flex items-center gap-4 p-5 bg-bg-secondary border border-border hover:border-accent-red/40 rounded-xl transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-orange/5 to-accent-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-12 h-12 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-2xl">
                  👹
                </div>
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-white">{boss.name}</h3>
                    <BossLevelBadge level={boss.level} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>Pass: {Math.round(boss.pass_threshold * 100)}%</span>
                    <span className="text-accent-orange">+{boss.xp_reward} XP</span>
                    {boss.badge && (
                      <span className="flex items-center gap-0.5 text-accent-purple">
                        <Trophy className="w-3 h-3" />
                        {boss.badge.name}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="relative w-5 h-5 text-text-muted group-hover:text-accent-red transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
