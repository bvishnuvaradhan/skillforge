"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Globe2, CheckCircle2, PlayCircle, ChevronRight, Star, Lock, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface WorldProgress {
  id: string;
  slug: string;
  name: string;
  description: string;
  order_index: number;
  xp_reward: number;
  unlock_criteria: any;
  lesson_count: number;
  game_count: number;
  boss_count: number;
  progress: {
    status: "locked" | "unlocked" | "in_progress" | "completed";
    lessons_completed: number;
    games_completed: number;
    xp_earned: number;
  };
}

const WORLD_THEMES: Record<string, { gradient: string; icon: string; glow: string }> = {
  "variables-kingdom": {
    gradient: "from-brand-cyan/20 to-accent-purple/10",
    icon: "⚡",
    glow: "group-hover:shadow-brand-cyan/20",
  },
  "conditions-valley": {
    gradient: "from-accent-green/20 to-brand-cyan/10",
    icon: "🌿",
    glow: "group-hover:shadow-accent-green/20",
  },
  "loop-forest": {
    gradient: "from-accent-orange/20 to-accent-purple/10",
    icon: "🌀",
    glow: "group-hover:shadow-accent-orange/20",
  },
};

function WorldCard({ world, index, onLockClick }: { world: WorldProgress; index: number; onLockClick: (world: WorldProgress) => void }) {
  const theme = WORLD_THEMES[world.slug] ?? {
    gradient: "from-accent-purple/20 to-brand-cyan/10",
    icon: "🌍",
    glow: "group-hover:shadow-accent-purple/20",
  };

  const isLocked = world.progress.status === "locked";
  const isCompleted = world.progress.status === "completed";
  const isActive = world.progress.status === "in_progress";

  const progressPct =
    world.lesson_count > 0
      ? Math.round((world.progress.lessons_completed / world.lesson_count) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className={`relative bg-bg-secondary border rounded-2xl overflow-hidden transition-all duration-300 ${
          isLocked
            ? "border-border opacity-60"
            : `border-border hover:border-brand-cyan/40 shadow-xl ${theme.glow} hover:shadow-2xl`
        }`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50`} />

        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl">{theme.icon}</div>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs bg-accent-green/20 text-accent-green px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              )}
              {isActive && (
                <span className="flex items-center gap-1 text-xs bg-brand-cyan/20 text-brand-cyan px-2 py-1 rounded-full">
                  <PlayCircle className="w-3 h-3" />
                  Active
                </span>
              )}
              {isLocked && (
                <span className="flex items-center gap-1 text-xs bg-bg-elevated text-text-muted px-2 py-1 rounded-full border border-border">
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              )}
            </div>
          </div>

          {/* World info */}
          <h2 className="text-xl font-heading font-bold text-white mb-1">{world.name}</h2>
          <p className="text-text-secondary text-sm mb-4 line-clamp-2">{world.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Lessons", value: world.lesson_count },
              { label: "Games", value: world.game_count },
              { label: "XP", value: world.xp_reward },
            ].map((stat) => (
              <div key={stat.label} className="bg-bg-elevated/50 rounded-lg p-2 text-center">
                <p className="text-sm font-mono font-bold text-white">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {!isLocked && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-text-muted mb-1.5">
                <span>Progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full bg-bg-elevated rounded-full h-2">
                <div
                  className="bg-brand-cyan h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* XP earned */}
          {!isLocked && world.progress.xp_earned > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-3.5 h-3.5 text-accent-orange" />
              <span className="text-xs text-text-muted">{world.progress.xp_earned} XP earned</span>
            </div>
          )}

          {/* CTA */}
          {!isLocked ? (
            <Link
              href={`/worlds/${world.slug}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-brand-cyan text-bg-primary font-medium text-sm hover:bg-brand-cyan/90 transition-colors"
            >
              {isCompleted ? "Review World" : isActive ? "Continue" : "Start"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => onLockClick(world)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-bg-elevated text-text-muted hover:text-white font-medium text-sm border border-border transition-colors hover:bg-bg-elevated/80"
            >
              <Lock className="w-4 h-4" />
              View Prerequisites
            </button>
          )}
        </div>

        {/* Order badge */}
        <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-bg-elevated border border-border flex items-center justify-center">
          <span className="text-xs font-mono text-text-muted">{world.order_index}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function WorldsPage() {
  const [worlds, setWorlds] = useState<WorldProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorldForPrereq, setSelectedWorldForPrereq] = useState<WorldProgress | null>(null);
  const [masteryScores, setMasteryScores] = useState<Array<{ topicId: string; score: number }>>([]);

  useEffect(() => {
    Promise.all([
      apiFetch<WorldProgress[]>("/worlds"),
      apiFetch<Array<{ topicId: string; score: number }>>("/mastery")
    ])
      .then(([worldsRes, masteryRes]) => {
        setWorlds(worldsRes.data);
        setMasteryScores(masteryRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = worlds.filter((w) => w.progress.status === "completed").length;
  const inProgressCount = worlds.filter((w) => w.progress.status === "in_progress").length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-bg-elevated rounded w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-bg-secondary rounded-2xl border border-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Learning Worlds</h1>
            <p className="text-text-secondary text-sm">
              {completedCount} completed · {inProgressCount} in progress · {worlds.length} total
            </p>
          </div>
        </div>
      </motion.div>

      {/* World Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {worlds.map((world, index) => (
          <WorldCard
            key={world.id}
            world={world}
            index={index}
            onLockClick={(w) => setSelectedWorldForPrereq(w)}
          />
        ))}
        {worlds.length === 0 && (
          <div className="col-span-3 text-center py-20 text-text-muted">
            No worlds available yet. Check back soon!
          </div>
        )}
      </div>

      {/* Prerequisite Modal */}
      <AnimatePresence>
        {selectedWorldForPrereq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent-orange/20 border border-accent-orange/30 flex items-center justify-center text-accent-orange">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-heading font-bold text-white">Prerequisites</h3>
                    <p className="text-xs text-text-secondary">Unlock: {selectedWorldForPrereq.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWorldForPrereq(null)}
                  className="text-text-muted hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Checklist */}
              <div className="space-y-4 my-6">
                {(() => {
                  const criteria = selectedWorldForPrereq.unlock_criteria as any;
                  const reqTopics = criteria?.required_topics ?? [];
                  let totalGap = 0;

                  if (reqTopics.length === 0) {
                    return <p className="text-sm text-text-secondary">No specific topic prerequisites are required for this world.</p>;
                  }

                  return (
                    <>
                      {reqTopics.map((req: any) => {
                        const scoreEntry = masteryScores.find((m) => m.topicId === req.topic_id);
                        const currentScore = scoreEntry?.score ?? 0;
                        const reqScore = req.min_mastery;
                        const gap = Math.max(0, reqScore - currentScore);
                        totalGap += gap;
                        const meets = currentScore >= reqScore;

                        return (
                          <div key={req.topic_id} className="bg-bg-elevated/40 border border-border/60 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white capitalize">
                                {req.topic_id.replace("_", " ")}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                meets ? "bg-accent-green/20 text-accent-green" : "bg-accent-orange/20 text-accent-orange"
                              }`}>
                                {meets ? "Met" : `Gap: ${Math.round(gap * 100)}%`}
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-xs text-text-secondary mb-1">
                              <span>Current: {Math.round(currentScore * 100)}%</span>
                              <span>Required: {Math.round(reqScore * 100)}%</span>
                            </div>

                            <div className="w-full bg-bg-elevated rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${meets ? "bg-accent-green" : "bg-accent-orange"}`}
                                style={{ width: `${Math.min(100, (currentScore / reqScore) * 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Time estimation */}
                      <div className="bg-bg-elevated/60 border border-border/80 rounded-xl p-4 flex items-start gap-3 mt-4">
                        <div className="text-xl">⏳</div>
                        <div>
                          <p className="text-xs font-semibold text-white uppercase tracking-wider">Estimated Time to Unlock</p>
                          <p className="text-sm text-text-secondary mt-0.5">
                            Approx. <span className="font-mono font-bold text-brand-cyan">{Math.max(15, Math.ceil(totalGap * 120))} mins</span> of practice and reviews.
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedWorldForPrereq(null)}
                className="w-full py-2.5 rounded-xl bg-brand-cyan text-bg-primary font-bold text-sm hover:bg-brand-cyan/90 transition-colors text-center"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
