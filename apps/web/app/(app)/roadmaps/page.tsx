"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Map, CheckCircle2, PlayCircle, ChevronRight, Star, Lock, XCircle, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { CURRICULUM_DATA } from "@/lib/curriculum";

interface WorldProgress {
  id: string;
  slug: string;
  name: string;
  description: string;
  order_index: number;
  xp_reward: number;
  unlock_criteria: {
    required_topics?: { topic_id: string; min_mastery: number }[];
    overall_retention?: number;
  };
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
  "variables-operators": {
    gradient: "from-brand-cyan/20 to-accent-purple/10",
    icon: "⚡",
    glow: "group-hover:shadow-brand-cyan/20",
  },
  "io-program-flow": {
    gradient: "from-brand-cyan/20 to-accent-green/10",
    icon: "📟",
    glow: "group-hover:shadow-brand-cyan/20",
  },
  "decision-making": {
    gradient: "from-accent-green/20 to-brand-cyan/10",
    icon: "🌿",
    glow: "group-hover:shadow-accent-green/20",
  },
  "loops-iteration": {
    gradient: "from-accent-orange/20 to-accent-purple/10",
    icon: "🌀",
    glow: "group-hover:shadow-accent-orange/20",
  },
};

const TOPIC_TO_WORLD: Record<string, { name: string; slug: string }> = {
  "variables": { name: "Variables, Data Types & Operators", slug: "variables-operators" },
  "io-flow": { name: "Input, Output & Program Flow", slug: "io-program-flow" },
  "conditionals": { name: "Decision Making", slug: "decision-making" },
  "loops": { name: "Loops & Iteration", slug: "loops-iteration" },
  "functions": { name: "Functions & Modular Programming", slug: "functions-modular" },
  "recursion": { name: "Recursion & Advanced Thinking", slug: "recursion-advanced" },
  "memory": { name: "Memory & Program Internals", slug: "memory-internals" },
  "debugging": { name: "Debugging, Testing & Complexity", slug: "debugging-testing" },
  "classes-objects": { name: "Classes, Objects & Constructors", slug: "classes-objects" },
  "oop-principles": { name: "Core OOP Principles", slug: "core-oop-principles" },
  "advanced-oop": { name: "Advanced OOP Relationships", slug: "advanced-oop-relationships" },
  "design-patterns": { name: "Design Patterns & Software Design", slug: "design-patterns-software" },
};

const PARTS = [
  {
    id: 1,
    title: "Part 1: Programming & OOP Foundations",
    desc: "Master the syntax, compilation, memory model, and object-oriented paradigms in your language track.",
    active: true,
  },
  {
    id: 2,
    title: "Part 2: Data Structures & Algorithms",
    desc: "Learn essential data structures and algorithms, complexity analysis, and technical problem-solving.",
    active: false,
    modules: ["Arrays & Strings", "Linked Lists, Stacks & Queues", "Trees & Graphs", "Sorting & Searching", "Dynamic Programming"],
  },
  {
    id: 3,
    title: "Part 3: Advanced Software Engineering",
    desc: "Build industry-ready skills in system integration, automated testing, containerization, and clean code.",
    active: false,
    modules: ["Advanced TypeScript & Node.js", "Clean Code & Refactoring", "CI/CD Pipelines & Testing Strategies", "Docker & Containerization"],
  },
  {
    id: 4,
    title: "Part 4: System Design & Scaling",
    desc: "Architect high-performance distributed systems, databases, caching layers, and microservices.",
    active: false,
    modules: ["Database Design & Query Tuning", "Caching & Message Queues", "High-Level System Design", "Cloud Infrastructure & Scalability"],
  },
  {
    id: 5,
    title: "Part 5: Full-Stack Web Systems",
    desc: "Deploy production-grade full stack web applications with modern framework architecture.",
    active: false,
    modules: ["Next.js & Modern Frontend Frameworks", "NestJS Backend Architectures", "Authentication & Web Security", "Real-time WebSockets & GraphQL"],
  },
  {
    id: 6,
    title: "Part 6: AI & Machine Learning Engineering",
    desc: "Understand foundational ML mathematics, model training, and integration of LLMs.",
    active: false,
    modules: ["Math foundations (Linear Algebra, Calculus)", "Python ML stack (NumPy, Pandas, Scikit-Learn)", "Deep Learning basics (PyTorch/TensorFlow)", "LLM Fine-Tuning & Prompt Engineering"],
  },
  {
    id: 7,
    title: "Part 7: Career Placement & Competitive Coding",
    desc: "Prepare for top tier coding interviews, resume reviews, and behavioral placement prep.",
    active: false,
    modules: ["Technical Resume Building", "Mock Interviews (AI & Human rounds)", "Competitive Coding Strategies", "Behavioral Preparation & Negotiation"],
  },
];

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
      transition={{ delay: index * 0.05 }}
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
              href={`/roadmaps/${world.slug}`}
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

export default function RoadmapsPage() {
  const [worlds, setWorlds] = useState<WorldProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState<number>(1);
  const [selectedWorldForPrereq, setSelectedWorldForPrereq] = useState<WorldProgress | null>(null);
  const [masteryScores, setMasteryScores] = useState<Array<{ topicId: string; score: number }>>([]);

  useEffect(() => {
    Promise.all([
      apiFetch<WorldProgress[]>("/worlds"),
      apiFetch<Array<{ topicId: string; score: number }>>("/mastery")
    ])
      .then(([worldsRes, masteryRes]) => {
        // Sort worlds by order index
        const sorted = (worldsRes.data || []).sort((a, b) => a.order_index - b.order_index);
        setWorlds(sorted);
        setMasteryScores(masteryRes.data || []);
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-14 bg-bg-secondary rounded-xl border border-border" />
              ))}
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-bg-secondary rounded-2xl border border-border" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activePartData = PARTS.find((p) => p.id === selectedPart);

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
            <Map className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Learning Roadmaps</h1>
            <p className="text-text-secondary text-sm">
              7 Structured Curriculum Parts · {completedCount} completed modules · {inProgressCount} in progress
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Parts List */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Curriculum Parts</p>
          {PARTS.map((part) => {
            const isSelected = part.id === selectedPart;
            return (
              <button
                key={part.id}
                onClick={() => setSelectedPart(part.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 relative group flex items-start gap-3 ${
                  isSelected
                    ? "bg-brand-cyan/10 border-brand-cyan/30 text-white"
                    : "bg-bg-secondary/40 border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80 hover:border-border/80"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                  isSelected ? "bg-brand-cyan text-bg-primary" : "bg-bg-elevated border border-border"
                }`}>
                  {part.id}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{part.title}</p>
                  {!part.active && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full mt-1.5 font-medium border border-accent-purple/20">
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      Coming Soon
                    </span>
                  )}
                  {part.active && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-accent-green/20 text-accent-green px-2 py-0.5 rounded-full mt-1.5 font-medium border border-accent-green/20">
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right column: Content detail */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPart}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Part description banner */}
              <div className="bg-bg-secondary/60 border border-border rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-3xl" />
                <h2 className="text-xl font-heading font-bold text-white mb-2">{activePartData?.title}</h2>
                <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">{activePartData?.desc}</p>
              </div>

              {selectedPart === 1 ? (
                /* Part 1 Active Modules Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {worlds.map((world, index) => (
                    <WorldCard
                      key={world.id}
                      world={world}
                      index={index}
                      onLockClick={(w) => setSelectedWorldForPrereq(w)}
                    />
                  ))}
                  {worlds.length === 0 && (
                    <div className="col-span-2 text-center py-20 text-text-muted">
                      No modules available in this part yet.
                    </div>
                  )}
                </div>
              ) : (
                /* Parts 2-7 Coming Soon details */
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="bg-bg-secondary/40 border border-border/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-purple/10 border border-accent-purple/20 rounded-xl flex items-center justify-center text-xl text-accent-purple animate-pulse shrink-0">
                        ✨
                      </div>
                      <div>
                        <h3 className="text-md font-heading font-bold text-white">Under Active Development</h3>
                        <p className="text-text-secondary text-xs">
                          Our curriculum designers are adapting these modules for all 5 language tracks.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-bg-elevated text-text-secondary px-3 py-1 rounded-full border border-border font-mono whitespace-nowrap">
                      {(CURRICULUM_DATA.find((p) => p.id === selectedPart)?.modules || []).length} Modules Planned
                    </span>
                  </div>

                  {/* High-Fidelity Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(CURRICULUM_DATA.find((p) => p.id === selectedPart)?.modules || []).map((mod) => (
                      <div
                        key={mod.id}
                        className="group relative bg-bg-secondary/30 border border-border hover:border-accent-purple/20 rounded-2xl p-6 transition-all duration-300 overflow-hidden backdrop-blur-sm"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/5 rounded-full blur-2xl group-hover:bg-accent-purple/10 transition-all duration-300" />
                        
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-3 relative z-10">
                          <span className="bg-bg-elevated/80 text-text-secondary text-[11px] font-mono px-2 py-0.5 rounded border border-border/40">
                            MODULE {mod.id.padStart(2, "0")}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-semibold bg-accent-purple/10 text-accent-purple border border-accent-purple/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Coming Soon
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-base font-heading font-bold text-white/90 group-hover:text-white transition-colors mb-2 relative z-10">
                          {mod.name}
                        </h4>

                        {/* Tech Tag list */}
                        <div className="flex flex-wrap gap-1 mb-3 relative z-10">
                          {mod.tech.split(",").map((techName, i) => (
                            <span key={i} className="bg-bg-elevated/45 text-text-muted text-[10px] px-1.5 py-0.5 rounded border border-border/30">
                              {techName.trim()}
                            </span>
                          ))}
                        </div>

                        {/* Topics */}
                        <div className="mb-3 relative z-10">
                          <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1">Key Topics</p>
                          <div className="flex flex-wrap gap-1 max-h-[72px] overflow-hidden">
                            {mod.topics.split(",").map((topicName, i) => (
                              <span key={i} className="text-[10px] text-text-secondary bg-bg-elevated/20 px-1.5 py-0.5 rounded border border-border/20">
                                {topicName.trim()}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Games/Concepts */}
                        {mod.games && (
                          <div className="mb-4 relative z-10">
                            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1">Planned Playground</p>
                            <p className="text-xs text-text-secondary/80 truncate">{mod.games}</p>
                          </div>
                        )}

                        {/* Bottom Row */}
                        <div className="pt-3 border-t border-border/40 flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Difficulty:</span>
                            <span className="text-accent-orange text-xs font-mono">{mod.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-1 text-text-muted">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono uppercase tracking-wider">Locked</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
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
                  const criteria = selectedWorldForPrereq.unlock_criteria;
                  const reqTopics = criteria?.required_topics ?? [];

                  if (reqTopics.length === 0) {
                    return <p className="text-sm text-text-secondary">No specific topic prerequisites are required for this module.</p>;
                  }

                  return (
                    <>
                      {reqTopics.map((req: { topic_id: string; min_mastery: number }) => {
                        const scoreEntry = masteryScores.find((m) => m.topicId === req.topic_id);
                        const currentScore = scoreEntry?.score ?? 0;
                        const reqScore = req.min_mastery;
                        const gap = Math.max(0, reqScore - currentScore);
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

                      {/* Required completion info */}
                      <div className="bg-bg-elevated/60 border border-border/80 rounded-xl p-4 flex items-start gap-3 mt-4">
                        <div className="text-xl">🎯</div>
                        <div>
                          <p className="text-xs font-semibold text-white uppercase tracking-wider">Required Completion</p>
                          <p className="text-sm text-text-secondary mt-1">
                            You must complete the previous world{" "}
                            {reqTopics.map((req: { topic_id: string; min_mastery: number }, i: number) => {
                              const targetWorld = TOPIC_TO_WORLD[req.topic_id];
                              return (
                                <span key={req.topic_id}>
                                  {i > 0 && " and "}
                                  <Link
                                    href={`/roadmaps/${targetWorld?.slug || ""}`}
                                    onClick={() => setSelectedWorldForPrereq(null)}
                                    className="text-brand-cyan hover:underline font-semibold"
                                  >
                                    {targetWorld?.name || req.topic_id}
                                  </Link>
                                </span>
                              );
                            })}
                            {" "}first to unlock this module.
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
