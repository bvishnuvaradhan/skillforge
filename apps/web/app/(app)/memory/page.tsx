"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, RefreshCw, AlertTriangle, Calendar } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

interface RetentionScore {
  topic_id: string;
  retention: number;
  stability: number;
  last_reviewed_at: string;
  next_review_at: string;
  risk_level: "low" | "medium" | "high" | "critical";
}

interface RiskArea {
  topic_id: string;
  retention: number;
  days_until_critical: number;
  risk_level: string;
}

interface CalendarItem {
  topicId: string;
  scheduledAt: string;
  retention: number;
  riskLevel: string;
}

interface MemoryLabData {
  memory_health_score: number;
  risk_areas: RiskArea[];
  retention_scores: RetentionScore[];
  calendar_items: CalendarItem[];
  review_suggestions: Array<{ topic_id: string; title: string; action_url: string }>;
}

export default function MemoryLabPage() {
  const [data, setData] = useState<MemoryLabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMemoryLab = useCallback(async () => {
    try {
      setErrorStatus(null);
      const labRes = await apiFetch<MemoryLabData>("/memory/lab");
      setData(labRes.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorStatus(err.status);
      } else {
        setErrorStatus(500);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchMemoryLab();
  }, [fetchMemoryLab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchMemoryLab();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-elevated rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-bg-secondary rounded-xl border border-border" />
            <div className="h-64 col-span-2 bg-bg-secondary rounded-xl border border-border" />
          </div>
        </div>
      </div>
    );
  }

  // Premium 402 Gate
  if (errorStatus === 402) {
    return (
      <div className="p-8 min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-secondary border border-border rounded-2xl p-8 max-w-lg text-center relative overflow-hidden"
        >
          {/* Subtle glow effect */}
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-accent-purple/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-brand-cyan/10 blur-3xl" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-purple to-brand-cyan mx-auto flex items-center justify-center shadow-lg mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-heading font-bold text-white mb-2">Memory Lab</h2>
          <span className="inline-block px-3 py-1 bg-accent-purple/20 border border-accent-purple/30 text-accent-purple rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            ✨ Premium Feature
          </span>

          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            The Memory Lab uses spaced repetition science and forgetting curves to predict exactly when you are about to forget key coding topics. Access personalized review schedules, decay risk grids, and reinforcement heatmaps.
          </p>

          <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
            {[
              "Track topic-level retention decay in real time",
              "Personalized daily reinforcement calendar",
              "Critical low-retention dashboard alerts",
              "Interactive knowledge grid visualization",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                <span className="text-accent-green">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button className="w-full py-3 bg-brand-cyan hover:bg-brand-cyan/90 text-bg-primary font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-cyan/20">
            Unlock Memory Lab (Upgrade)
          </button>
        </motion.div>
      </div>
    );
  }

  if (errorStatus || !data) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-accent-red mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Failed to load Memory Lab</h3>
        <p className="text-text-secondary text-sm mb-4">An error occurred while loading your memory data.</p>
        <button onClick={handleRefresh} className="px-4 py-2 bg-bg-elevated border border-border text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  // Define color mappings for the heatmap based on risk levels
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-accent-red border-accent-red/40 hover:bg-accent-red/90";
      case "high":
        return "bg-accent-orange border-accent-orange/40 hover:bg-accent-orange/90";
      case "medium":
        return "bg-yellow-500 border-yellow-500/40 hover:bg-yellow-500/90";
      default:
        return "bg-accent-green border-accent-green/40 hover:bg-accent-green/90";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-1 flex items-center gap-3">
            <Brain className="w-8 h-8 text-brand-cyan" />
            Memory Lab
          </h1>
          <p className="text-text-secondary text-sm">
            Leverage memory science to achieve perfect topic retention.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2.5 bg-bg-secondary hover:bg-bg-elevated border border-border text-text-secondary hover:text-white rounded-xl transition-colors relative"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Memory Health Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-secondary border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <h3 className="text-text-secondary text-sm font-medium self-start mb-6">Overall Health</h3>
          <div className="relative w-44 h-44 flex items-center justify-center mb-4">
            {/* SVG circular track and fill */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="74"
                className="stroke-bg-elevated fill-none"
                strokeWidth="12"
              />
              <motion.circle
                cx="88"
                cy="88"
                r="74"
                className="stroke-brand-cyan fill-none"
                strokeWidth="12"
                strokeDasharray={465}
                initial={{ strokeDashoffset: 465 }}
                animate={{ strokeDashoffset: 465 - (465 * data.memory_health_score) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-heading font-bold text-white">
                {data.memory_health_score}%
              </span>
              <span className="text-xs text-text-muted mt-1 uppercase font-semibold">Retention</span>
            </div>
          </div>
          <p className="text-text-secondary text-xs mt-2 leading-relaxed">
            Your memory retention index across all target curriculum topics.
          </p>
        </motion.div>

        {/* Heatmap Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-secondary border border-border rounded-2xl p-6 lg:col-span-2 flex flex-col relative overflow-hidden"
        >
          <h3 className="text-text-secondary text-sm font-medium mb-4">Knowledge Retention Heatmap</h3>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {data.retention_scores.length === 0 ? (
              <div className="col-span-full flex items-center justify-center text-text-muted text-sm py-12">
                No active topic scores found. Complete lessons to track.
              </div>
            ) : (
              data.retention_scores.map((score) => (
                <div
                  key={score.topic_id}
                  className="bg-bg-elevated border border-border/60 rounded-xl p-3.5 flex flex-col justify-between hover:border-brand-cyan/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-text-secondary truncate max-w-[90px]">
                      {score.topic_id}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${getRiskColor(score.risk_level)}`} />
                  </div>
                  <div>
                    <p className="text-lg font-mono font-bold text-white">
                      {Math.round(score.retention * 100)}%
                    </p>
                    <p className="text-[10px] text-text-muted">Stability: {Math.round(score.stability)}d</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-secondary border border-border rounded-2xl p-6"
        >
          <h3 className="text-text-secondary text-sm font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent-orange" />
            Attention Areas
          </h3>
          <div className="space-y-3">
            {data.risk_areas.length === 0 ? (
              <p className="text-text-muted text-xs py-8 text-center">
                🎉 Excellent! No topics are currently at decay risk.
              </p>
            ) : (
              data.risk_areas.map((area) => (
                <div key={area.topic_id} className="p-3 bg-bg-elevated rounded-xl border border-border/80 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{area.topic_id}</p>
                    <p className="text-xs text-text-muted">Critical in {area.days_until_critical} days</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                    area.risk_level === "critical"
                      ? "bg-accent-red/20 text-accent-red"
                      : "bg-accent-orange/20 text-accent-orange"
                  }`}>
                    {Math.round(area.retention * 100)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Calendar & Next Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-secondary border border-border rounded-2xl p-6 lg:col-span-2 relative overflow-hidden"
        >
          <h3 className="text-text-secondary text-sm font-medium mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-cyan" />
            Reinforcement Schedule
          </h3>
          <div className="space-y-3">
            {data.calendar_items.length === 0 ? (
              <p className="text-text-muted text-xs py-8 text-center">
                No scheduled reviews. Keep exploring and completing lessons.
              </p>
            ) : (
              data.calendar_items.slice(0, 4).map((item, index) => {
                const date = new Date(item.scheduledAt);
                return (
                  <div key={index} className="p-3 bg-bg-elevated rounded-xl border border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-secondary flex flex-col items-center justify-center text-center text-text-secondary font-mono border border-border">
                        <span className="text-[10px] uppercase font-semibold leading-none mb-0.5">
                          {date.toLocaleString("default", { month: "short" })}
                        </span>
                        <span className="text-sm font-bold leading-none">{date.getDate()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white capitalize">{item.topicId}</p>
                        <p className="text-xs text-text-muted">
                          Next scheduled review: {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-brand-cyan/10 text-brand-cyan rounded-lg border border-brand-cyan/20">
                      Spaced Review
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
