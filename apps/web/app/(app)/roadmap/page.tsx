"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ChevronRight, Lock, CheckCircle2, RefreshCw, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface RoadmapStep {
  topic_id: string;
  title: string;
  status: "locked" | "unlocked" | "in_progress" | "completed";
  estimated_days: number;
  mastery_required: number;
}

interface Roadmap {
  goal: "placements" | "competitive" | "dsa" | "interviews";
  steps: RoadmapStep[];
  currentStepIndex: number;
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchRoadmap = useCallback(async () => {
    try {
      const roadmapRes = await apiFetch<Roadmap>("/roadmap");
      setRoadmap(roadmapRes.data);
    } catch (error) {
      console.error("Failed to load roadmap:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRoadmap();
  }, [fetchRoadmap]);

  const handleGoalChange = async (newGoal: string) => {
    setIsUpdating(true);
    try {
      const res = await apiFetch<Roadmap>("/roadmap/goal", {
        method: "PATCH",
        body: JSON.stringify({ goal: newGoal }),
      });
      setRoadmap(res.data);
      toast.success("Learning goal updated successfully!");
    } catch (error) {
      console.error("Failed to update goal:", error);
      toast.error("Failed to update learning goal. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };


  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-elevated rounded w-48" />
          <div className="h-64 bg-bg-secondary rounded-xl border border-border" />
        </div>
      </div>
    );
  }

  const steps = roadmap?.steps || [];
  const activeGoal = roadmap?.goal || "dsa";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-1 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-accent-green" />
            Your roadmap
          </h1>
          <p className="text-text-secondary text-sm">
            Traverse your curriculum steps and unlock worlds based on knowledge graph prerequisites.
          </p>
        </div>

        {/* Goal Switcher */}
        <div className="flex items-center gap-3 bg-bg-secondary border border-border rounded-xl px-4 py-2">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Goal</span>
          <select
            value={activeGoal}
            onChange={(e) => void handleGoalChange(e.target.value)}
            disabled={isUpdating}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="dsa" className="bg-bg-elevated text-white">Data Structures & Algos</option>
            <option value="competitive" className="bg-bg-elevated text-white">Competitive Programming</option>
            <option value="placements" className="bg-bg-elevated text-white">Placements Training</option>
            <option value="interviews" className="bg-bg-elevated text-white">FAANG Mock Interviews</option>
          </select>
          {isUpdating && <RefreshCw className="w-4 h-4 text-brand-cyan animate-spin" />}
        </div>
      </div>

      {/* Main Roadmap Tracker */}
      <div className="max-w-3xl mx-auto bg-bg-secondary border border-border rounded-2xl p-8 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-accent-green/5 blur-3xl" />

        <div className="relative border-l border-border/80 pl-8 ml-4 space-y-8">
          {steps.length === 0 ? (
            <p className="text-text-muted text-sm py-12 text-center">No steps loaded for this goal.</p>
          ) : (
            steps.map((step, idx) => {
              const isCompleted = step.status === "completed";
              const isInProgress = step.status === "in_progress";
              const isUnlocked = step.status === "unlocked";
              const isLocked = step.status === "locked";

              return (
                <motion.div
                  key={step.topic_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group"
                >
                  {/* Circle Indicator on the timeline border */}
                  <div
                    className={`absolute -left-[45px] top-1.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-accent-green border-accent-green/80 text-bg-primary"
                        : isInProgress
                        ? "bg-brand-cyan border-brand-cyan/80 text-bg-primary animate-pulse"
                        : isUnlocked
                        ? "bg-bg-elevated border-border text-white hover:border-brand-cyan/40"
                        : "bg-bg-primary border-border text-text-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-bg-primary" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <span className="font-mono text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Card */}
                  <div
                    className={`border rounded-xl p-5 transition-all relative overflow-hidden ${
                      isInProgress
                        ? "bg-bg-elevated border-brand-cyan/30 shadow-[0_4px_20px_rgba(0,180,216,0.08)]"
                        : isCompleted
                        ? "bg-bg-elevated/40 border-border/40 opacity-80"
                        : isUnlocked
                        ? "bg-bg-elevated/20 border-border hover:border-border/80"
                        : "bg-bg-primary/30 border-border/20 opacity-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`text-base font-semibold ${
                              isInProgress ? "text-white" : isLocked ? "text-text-muted" : "text-text-secondary"
                            }`}
                          >
                            {step.title}
                          </h3>
                          {isInProgress && (
                            <span className="px-2 py-0.5 bg-brand-cyan/20 border border-brand-cyan/30 text-[10px] text-brand-cyan rounded-md font-bold uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed">
                          Estimated duration: {step.estimated_days} days to complete
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1.5 font-mono">
                        <span className="text-[10px] text-text-muted">Mastery Required</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-accent-orange fill-accent-orange/20" />
                          <span className="text-xs font-bold text-white">
                            {Math.round(step.mastery_required * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Completion bar or action link */}
                    {isInProgress && (
                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                        <span className="text-xs text-text-muted">Target is 70% topic mastery score.</span>
                        <a
                          href={`/roadmaps`}
                          className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1 group/link"
                        >
                          Start lessons
                          <ChevronRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
