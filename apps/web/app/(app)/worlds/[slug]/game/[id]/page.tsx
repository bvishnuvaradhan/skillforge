"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle,
  XCircle,
  Zap,
  RotateCcw,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface GameConfig {
  id: string;
  name: string;
  game_type: string;
  config: Record<string, unknown>;
  topic_tags: string[];
  xp_reward: number;
  mastery_contribution: number;
}

interface SubmitResult {
  score: number;
  passed: boolean;
  xp_earned: number;
  attempt_number: number;
  feedback: string;
}

// ──────────────────────────────────────────────
// Logic Builder Game (drag-and-drop blocks UI)
// ──────────────────────────────────────────────
function LogicBuilderGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const availableBlocks = (config.available_blocks as string[]) ?? [
    "declare_variable",
    "assign_value",
    "print_output",
    "if_condition",
    "end_if",
  ];

  const [placed, setPlaced] = useState<string[]>([]);

  const addBlock = (block: string) => setPlaced((prev) => [...prev, block]);
  const removeBlock = (idx: number) => setPlaced((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    const payload = {
      blocks: placed,
      connections: [] as Array<{ from: number; to: number }>,
      output_node: placed[placed.length - 1] ?? null,
      time_seconds: 60,
      hints_used: 0,
    };
    onSubmit(payload);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Available Blocks */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">Available Blocks</h3>
          <div className="space-y-2">
            {availableBlocks.map((block) => (
              <button
                key={block}
                onClick={() => addBlock(block)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-white hover:border-brand-cyan/40 hover:bg-brand-cyan/5 transition-all text-left"
              >
                <Plus className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                {block.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Program Canvas */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">Your Program</h3>
          <div className="min-h-48 bg-bg-elevated border border-dashed border-border rounded-lg p-3 space-y-2">
            <AnimatePresence>
              {placed.map((block, idx) => (
                <motion.div
                  key={`${block}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-brand-cyan/20 rounded-lg text-sm"
                >
                  <span className="text-xs text-text-muted font-mono w-4">{idx + 1}</span>
                  <span className="flex-1 text-white">{block.replace(/_/g, " ")}</span>
                  {idx > 0 && (
                    <ArrowRight className="w-3 h-3 text-brand-cyan mx-1 shrink-0" />
                  )}
                  <button
                    onClick={() => removeBlock(idx)}
                    className="text-text-muted hover:text-accent-red transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {placed.length === 0 && (
              <p className="text-text-muted text-sm text-center py-8">
                Click blocks on the left to add them here
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={placed.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Solution
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// If-Else Constructor
// ──────────────────────────────────────────────
function IfElseGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [condition, setCondition] = useState("");
  const [trueBranch, setTrueBranch] = useState("");
  const [falseBranch, setFalseBranch] = useState("");

  const handleSubmit = () => {
    onSubmit({
      condition_blocks: condition ? [condition] : [],
      true_branch: trueBranch ? [trueBranch] : [],
      false_branch: falseBranch ? [falseBranch] : [],
      time_seconds: 60,
      hints_used: 0,
    });
  };

  const placeholder = config.description as string | undefined;

  return (
    <div className="space-y-4">
      {placeholder && (
        <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg text-sm text-text-secondary">
          {placeholder}
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "IF condition", value: condition, set: setCondition, placeholder: "e.g. x > 0" },
          { label: "THEN (true branch)", value: trueBranch, set: setTrueBranch, placeholder: "e.g. print('positive')" },
          { label: "ELSE (false branch)", value: falseBranch, set: setFalseBranch, placeholder: "e.g. print('negative')" },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-xs text-text-muted mb-1.5 block">{field.label}</label>
            <textarea
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-muted resize-none focus:outline-none focus:border-brand-cyan/50 h-24 font-mono"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!condition}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Solution
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Loop Builder
// ──────────────────────────────────────────────
function LoopBuilderGame({
  onSubmit,
}: {
  config?: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [loopType, setLoopType] = useState("for");
  const [iterations, setIterations] = useState(5);
  const [bodyBlocks, setBodyBlocks] = useState<string[]>([]);

  const addBodyBlock = () => setBodyBlocks((prev) => [...prev, "print(i)"]);
  const removeBodyBlock = (idx: number) => setBodyBlocks((prev) => prev.filter((_, i) => i !== idx));
  const updateBodyBlock = (idx: number, val: string) =>
    setBodyBlocks((prev) => prev.map((b, i) => (i === idx ? val : b)));

  const handleSubmit = () => {
    onSubmit({
      loop_type: loopType,
      iteration_count: iterations,
      body_blocks: bodyBlocks,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-text-muted mb-1.5 block">Loop Type</label>
          <select
            value={loopType}
            onChange={(e) => setLoopType(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
          >
            <option value="for">for loop</option>
            <option value="while">while loop</option>
            <option value="do_while">do-while loop</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1.5 block">Iterations / Count</label>
          <input
            type="number"
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value, 10))}
            min={1}
            max={100}
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan/50"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-text-muted">Loop Body</label>
          <button
            onClick={addBodyBlock}
            className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add statement
          </button>
        </div>
        <div className="space-y-2 min-h-16">
          {bodyBlocks.map((block, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={block}
                onChange={(e) => updateBodyBlock(idx, e.target.value)}
                className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan/50"
              />
              <button onClick={() => removeBodyBlock(idx)} className="text-text-muted hover:text-accent-red transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {bodyBlocks.length === 0 && (
            <p className="text-text-muted text-xs text-center py-3">No statements yet. Click &ldquo;Add statement&rdquo; above.</p>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={bodyBlocks.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Solution
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Result Screen
// ──────────────────────────────────────────────
function ResultScreen({ result, onRetry, worldSlug }: { result: SubmitResult; onRetry: () => void; worldSlug: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="mb-4">
        {result.passed ? (
          <CheckCircle className="w-16 h-16 text-accent-green mx-auto" />
        ) : (
          <XCircle className="w-16 h-16 text-accent-red mx-auto" />
        )}
      </div>
      <h2 className="text-2xl font-heading font-bold text-white mb-2">
        {result.passed ? "Challenge Cleared! 🎉" : "Not Quite..."}
      </h2>
      <p className="text-text-secondary mb-2">{result.feedback}</p>
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-white">{Math.round(result.score * 100)}%</p>
          <p className="text-xs text-text-muted">Score</p>
        </div>
        {result.passed && (
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-accent-orange">+{result.xp_earned}</p>
            <p className="text-xs text-text-muted">XP earned</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-text-secondary">#{result.attempt_number}</p>
          <p className="text-xs text-text-muted">Attempt</p>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        {!result.passed && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-text-secondary hover:text-white hover:border-white/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        )}
        <Link
          href={`/worlds/${worldSlug}`}
          className="px-5 py-2.5 rounded-xl bg-brand-cyan text-bg-primary font-medium hover:bg-brand-cyan/90 transition-colors"
        >
          {result.passed ? "Continue World" : "Back to World"}
        </Link>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Main Game Arena Page
// ──────────────────────────────────────────────
export default function GameArenaPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const [game, setGame] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<GameConfig>(`/games/${id}`)
      .then((res: { data: GameConfig }) => setGame(res.data))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error("This game is locked. Unlock the world first.");
          router.push(`/worlds`);
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<SubmitResult>(`/games/${id}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(res.data);
      if (res.data.passed) {
        toast.success(`Game completed! +${res.data.xp_earned} XP 🎉`);
      }
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-bg-elevated rounded w-40 mb-6" />
        <div className="h-96 bg-bg-secondary rounded-2xl border border-border" />
      </div>
    );
  }

  if (!game) return null;

  const renderGame = () => {
    if (submitting) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Evaluating your solution...</p>
        </div>
      );
    }

    if (result) {
      return <ResultScreen result={result} onRetry={() => setResult(null)} worldSlug={slug} />;
    }

    switch (game.game_type) {
      case "ifelse_constructor":
        return <IfElseGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "loop_builder":
        return <LoopBuilderGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      default:
        // logic_builder and all others
        return <LogicBuilderGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href={`/worlds/${slug}`}
        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to World
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary border border-border rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-accent-purple/10 to-brand-cyan/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-accent-purple" />
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  {game.game_type.replace(/_/g, " ")}
                </span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-white">{game.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {game.topic_tags.map((tag) => (
                  <span key={tag} className="text-xs bg-bg-elevated text-text-muted px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                <span className="text-xs text-accent-orange font-mono">+{game.xp_reward} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={result ? "result" : "game"}>
              {renderGame()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
