"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Globe2,
  Zap,
  Flame,
  BookOpen,
  TrendingUp,
  Award,
  ChevronRight,
  Lock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface DltState {
  overall_mastery: number;
  overall_retention: number;
  xp_total: number;
  level: number;
  streak_count: number;
  last_computed_at: string | null;
}

interface WorldProgress {
  id: string;
  slug: string;
  name: string;
  description: string;
  order_index: number;
  progress: {
    status: "locked" | "unlocked" | "in_progress" | "completed";
    lessons_completed: number;
    games_completed: number;
    xp_earned: number;
  };
  lesson_count: number;
  game_count: number;
}

interface RoadmapStep {
  topic_id: string;
  title: string;
  status: string;
  estimated_days: number;
  mastery_required: number;
}

interface Roadmap {
  steps: RoadmapStep[];
  current_step_index: number;
}

// ──────────────────────────────────────────────
// Utility
// ──────────────────────────────────────────────
function MasteryBar({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const color =
    value >= 0.8
      ? "bg-accent-green"
      : value >= 0.6
      ? "bg-accent-orange"
      : "bg-accent-red";
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-2.5" };

  return (
    <div className={`w-full bg-bg-elevated rounded-full ${heights[size]}`}>
      <motion.div
        className={`${color} ${heights[size]} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(value * 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

function WorldStatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-accent-green" />;
  if (status === "in_progress") return <Circle className="w-4 h-4 text-brand-cyan fill-brand-cyan/30" />;
  return <Lock className="w-4 h-4 text-text-muted" />;
}

// ──────────────────────────────────────────────
// Widget: XP & Level
// ──────────────────────────────────────────────
function XpLevelWidget({ dlt }: { dlt: DltState | null }) {
  const xpInLevel = dlt ? dlt.xp_total % 1000 : 0;
  const level = dlt?.level ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent-purple" />
          </div>
          <span className="text-text-secondary text-sm font-medium">XP & Level</span>
        </div>
        <span className="text-xs text-text-muted font-mono">
          {dlt?.xp_total ?? 0} XP
        </span>
      </div>

      <div>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-heading font-bold text-white">{level}</span>
          <span className="text-text-secondary text-sm mb-1">/ Level</span>
        </div>
        <MasteryBar value={xpInLevel / 1000} size="lg" />
        <p className="text-xs text-text-muted mt-1.5">{xpInLevel}/1000 XP to next level</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-elevated rounded-lg p-3">
          <p className="text-xs text-text-muted mb-0.5">Mastery</p>
          <p className="text-lg font-mono font-bold text-accent-green">
            {Math.round((dlt?.overall_mastery ?? 0) * 100)}%
          </p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-3">
          <p className="text-xs text-text-muted mb-0.5">Retention</p>
          <p className="text-lg font-mono font-bold text-brand-cyan">
            {Math.round((dlt?.overall_retention ?? 0) * 100)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Widget: Streak
// ──────────────────────────────────────────────
function StreakWidget({ streak }: { streak: number }) {
  const milestones = [7, 30, 100];
  const nextMilestone = milestones.find((m) => m > streak) ?? 100;
  const progress = (streak / nextMilestone) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent-orange/20 border border-accent-orange/30 flex items-center justify-center">
          <Flame className="w-4 h-4 text-accent-orange" />
        </div>
        <span className="text-text-secondary text-sm font-medium">Daily Streak</span>
      </div>

      <div className="text-center py-2">
        <div className="text-6xl mb-1">🔥</div>
        <p className="text-5xl font-heading font-bold text-white">{streak}</p>
        <p className="text-text-secondary text-sm mt-1">
          {streak === 1 ? "day" : "days"} in a row
        </p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-text-muted mb-1.5">
          <span>Next milestone: {nextMilestone} days</span>
          <span>{streak}/{nextMilestone}</span>
        </div>
        <div className="w-full bg-bg-elevated rounded-full h-2">
          <div
            className="bg-accent-orange h-2 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Widget: World Progress
// ──────────────────────────────────────────────
function WorldProgressWidget({ worlds }: { worlds: WorldProgress[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-brand-cyan" />
          </div>
          <span className="text-text-secondary text-sm font-medium">World Progress</span>
        </div>
        <a href="/worlds" className="text-xs text-brand-cyan hover:underline flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </a>
      </div>

      <div className="space-y-3">
        {worlds.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">No worlds available yet</p>
        ) : (
          worlds.slice(0, 3).map((world) => (
            <div key={world.id} className="flex items-center gap-3 p-3 bg-bg-elevated rounded-lg">
              <WorldStatusIcon status={world.progress.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{world.name}</p>
                <p className="text-xs text-text-muted">
                  {world.progress.lessons_completed}/{world.lesson_count} lessons •{" "}
                  {world.progress.xp_earned} XP
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  world.progress.status === "completed"
                    ? "bg-accent-green/20 text-accent-green"
                    : world.progress.status === "in_progress"
                    ? "bg-brand-cyan/20 text-brand-cyan"
                    : "bg-bg-elevated text-text-muted border border-border"
                }`}
              >
                {world.progress.status === "in_progress"
                  ? "Active"
                  : world.progress.status.charAt(0).toUpperCase() + world.progress.status.slice(1)}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Widget: Roadmap Preview
// ──────────────────────────────────────────────
function RoadmapWidget({ roadmap }: { roadmap: Roadmap | null }) {
  if (!roadmap) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-bg-secondary border border-border rounded-xl p-6 flex items-center justify-center"
      >
        <p className="text-text-muted text-sm">Complete onboarding to see your roadmap.</p>
      </motion.div>
    );
  }

  const steps = roadmap.steps as RoadmapStep[];
  const currentIdx = roadmap.current_step_index ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent-green/20 border border-accent-green/30 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-accent-green" />
        </div>
        <span className="text-text-secondary text-sm font-medium">Roadmap Preview</span>
      </div>

      <div className="space-y-2">
        {steps.slice(0, 4).map((step, idx) => (
          <div key={step.topic_id} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                idx < currentIdx
                  ? "bg-accent-green text-bg-primary"
                  : idx === currentIdx
                  ? "bg-brand-cyan text-bg-primary"
                  : "bg-bg-elevated text-text-muted border border-border"
              }`}
            >
              {idx < currentIdx ? "✓" : idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm truncate ${
                  idx === currentIdx ? "text-white font-medium" : "text-text-secondary"
                }`}
              >
                {step.title}
              </p>
            </div>
            <span className="text-xs text-text-muted shrink-0">{step.estimated_days}d</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Widget: Recommendations
// ──────────────────────────────────────────────
function RecommendationsWidget() {
  // Placeholder recommendations for Phase 2 (full engine in Phase 3)
  const recs = [
    { id: "1", title: "Practice Arrays", why: "Mastery below 60%", impact: "high", effort_minutes: 20 },
    { id: "2", title: "Review Variables", why: "Retention dropping", impact: "medium", effort_minutes: 15 },
    { id: "3", title: "Complete Loop Forest boss", why: "Unlock next world", impact: "high", effort_minutes: 30 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center">
          <Award className="w-4 h-4 text-accent-purple" />
        </div>
        <span className="text-text-secondary text-sm font-medium">Recommendations</span>
      </div>

      <div className="space-y-2.5">
        {recs.map((rec) => (
          <div key={rec.id} className="p-3 bg-bg-elevated rounded-lg border border-border hover:border-brand-cyan/30 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-brand-cyan transition-colors truncate">
                  {rec.title}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{rec.why}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    rec.impact === "high"
                      ? "bg-accent-orange/20 text-accent-orange"
                      : "bg-brand-cyan/20 text-brand-cyan"
                  }`}
                >
                  {rec.impact}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <BookOpen className="w-3 h-3 text-text-muted" />
              <span className="text-xs text-text-muted">{rec.effort_minutes} min</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Main Dashboard Page
// ──────────────────────────────────────────────
export default function DashboardPage() {
  const [dlt, setDlt] = useState<DltState | null>(null);
  const [worlds, setWorlds] = useState<WorldProgress[]>([]);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dltRes, worldsRes] = await Promise.all([
        apiFetch<DltState>("/dlt/me").catch(() => null),
        apiFetch<WorldProgress[]>("/worlds").catch(() => null),
      ]);

      if (dltRes) setDlt(dltRes.data);
      if (worldsRes) setWorlds(worldsRes.data);

      // Try roadmap (requires completed onboarding)
      const roadmapRes = await apiFetch<{ steps: RoadmapStep[]; current_step_index: number }>("/users/me/roadmap").catch(() => null);
      if (roadmapRes) setRoadmap(roadmapRes.data);
    } catch {
      // Silent fail — widgets show defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();

    // Socket.io listener for real-time dlt_updated events
    // (Socket provider at layout level would do this — placeholder for wiring)
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-elevated rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-52 bg-bg-secondary rounded-xl border border-border" />
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
        <h1 className="text-3xl font-heading font-bold text-white mb-1">Dashboard</h1>
        <p className="text-text-secondary text-sm">
          Your learning overview — keep going, you&apos;re doing great!
        </p>
      </motion.div>

      {/* 5-widget grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Row 1: XP + Level, Streak, World Progress */}
        <XpLevelWidget dlt={dlt} />
        <StreakWidget streak={dlt?.streak_count ?? 0} />
        <WorldProgressWidget worlds={worlds} />

        {/* Row 2: Roadmap Preview + Recommendations */}
        <RoadmapWidget roadmap={roadmap} />
        <div className="lg:col-span-2">
          <RecommendationsWidget />
        </div>
      </div>
    </div>
  );
}
