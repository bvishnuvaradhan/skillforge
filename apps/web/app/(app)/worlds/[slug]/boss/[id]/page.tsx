"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Sword,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  AlertCircle,
  Timer,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface BossQuestion {
  id: string;
  text: string;
  options: string[];
}

interface BossDetail {
  id: string;
  name: string;
  level: string;
  pass_threshold: number;
  xp_reward: number;
  questions: BossQuestion[];
  badge: { id: string; name: string; rarity: string; image_url: string } | null;
  on_cooldown: boolean;
}

interface BossResult {
  score: number;
  passed: boolean;
  xp_earned: number;
  attempt_number: number;
  correct_answers: number;
  total_questions: number;
  badge_earned: { id: string; name: string; rarity: string } | null;
  feedback: string;
}

function RarityBadge({ rarity }: { rarity: string }) {
  const styles: Record<string, string> = {
    common: "text-text-secondary border-border",
    rare: "text-brand-cyan border-brand-cyan/30",
    epic: "text-accent-purple border-accent-purple/30",
    legendary: "text-accent-orange border-accent-orange/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[rarity] ?? styles.common}`}>
      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
    </span>
  );
}

function ParticleBurst() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);

  useEffect(() => {
    const colors = ["#00B4D8", "#7B2FBE", "#06D6A0", "#FF6B35", "#EF4444"];
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500 - 50,
      color: colors[Math.floor(Math.random() * colors.length)] ?? "#00B4D8",
      size: Math.random() * 8 + 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: 0.1,
            opacity: 0,
          }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}

function TickUpXP({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value <= 0) return;
    let start = 0;
    const duration = 1500;
    const steps = Math.min(value, 30);
    const stepValue = Math.ceil(value / steps);
    const stepTime = duration / steps;
    
    const timer = setInterval(() => {
      start += stepValue;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return <span className="font-mono font-bold text-accent-orange">+{displayValue}</span>;
}

export default function BossBattlePage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const [boss, setBoss] = useState<BossDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BossResult | null>(null);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (!id) return;
    apiFetch<BossDetail>(`/boss/${id}`)
      .then((res: { data: BossDetail }) => setBoss(res.data))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error("This world is locked.");
          router.push(`/worlds`);
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!boss) return;
    const answerList = boss.questions.map((q) => ({
      question_id: q.id,
      answer: answers[q.id] ?? "",
    }));

    const timeSeconds = Math.round((Date.now() - startTime) / 1000);
    setSubmitting(true);

    try {
      const res = await apiFetch<BossResult>(`/boss/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers: answerList, time_seconds: timeSeconds }),
      });
      setResult(res.data);
      if (res.data.passed) {
        toast.success(`Boss defeated! +${res.data.xp_earned} XP 🏆`);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error("Boss is on cooldown. Wait before trying again.");
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = boss?.questions.length ?? 0;

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-bg-elevated rounded w-40 mb-6" />
        <div className="h-96 bg-bg-secondary rounded-2xl border border-border" />
      </div>
    );
  }

  if (!boss) return null;

  if (boss.on_cooldown) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="bg-bg-secondary border border-border rounded-2xl p-10">
          <Clock className="w-12 h-12 text-accent-orange mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Boss on Cooldown</h2>
          <p className="text-text-secondary mb-6">
            You need to wait before challenging this boss again. Take some time to study!
          </p>
          <Link
            href={`/worlds/${slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-cyan text-bg-primary rounded-xl font-medium hover:bg-brand-cyan/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to World
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="p-8 max-w-2xl mx-auto relative">
        {result.passed && <ParticleBurst />}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-bg-secondary border rounded-2xl p-8 text-center relative z-10 ${
            result.passed ? "border-accent-green/30" : "border-accent-red/30"
          }`}
        >
          <div className="mb-4">
            {result.passed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <CheckCircle className="w-16 h-16 text-accent-green mx-auto filter drop-shadow-[0_0_8px_rgba(6,214,160,0.5)]" />
              </motion.div>
            ) : (
              <XCircle className="w-16 h-16 text-accent-red mx-auto" />
            )}
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">
            {result.passed ? "Boss Defeated! 🏆" : "Defeated..."}
          </h2>
          <p className="text-text-secondary mb-6">{result.feedback}</p>
 
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-bg-elevated rounded-xl p-4">
              <p className="text-2xl font-mono font-bold text-white">{Math.round(result.score * 100)}%</p>
              <p className="text-xs text-text-muted mt-1">Score</p>
            </div>
            <div className="bg-bg-elevated rounded-xl p-4">
              <p className="text-2xl font-mono font-bold text-white">{result.correct_answers}/{result.total_questions}</p>
              <p className="text-xs text-text-muted mt-1">Correct</p>
            </div>
            {result.passed && (
              <div className="bg-bg-elevated rounded-xl p-4">
                <p className="text-2xl font-mono font-bold">
                  <TickUpXP value={result.xp_earned} />
                </p>
                <p className="text-xs text-text-muted mt-1">XP Earned</p>
              </div>
            )}
          </div>
 
          {/* Badge earned */}
          {result.badge_earned && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
              className="mb-6 p-4 bg-accent-purple/10 border border-accent-purple/20 rounded-xl relative overflow-hidden"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Trophy className="w-10 h-10 text-accent-purple mx-auto mb-2 filter drop-shadow-[0_0_8px_rgba(123,47,190,0.5)]" />
              </motion.div>
              <p className="text-sm font-medium text-white mb-1">{result.badge_earned.name} badge earned!</p>
              <RarityBadge rarity={result.badge_earned.rarity} />
            </motion.div>
          )}
 
          <Link
            href={`/worlds/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan text-bg-primary rounded-xl font-semibold hover:bg-brand-cyan/90 transition-colors"
          >
            {result.passed ? "Continue World" : "Back to World"}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href={`/worlds/${slug}`}
        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to World
      </Link>

      {/* Boss header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary border border-accent-red/20 rounded-2xl p-6 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/10 to-accent-red/5" />
        <div className="relative flex items-center gap-4">
          <div className="text-5xl">👹</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sword className="w-4 h-4 text-accent-red" />
              <span className="text-xs text-text-muted uppercase tracking-wider">Boss Battle</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">{boss.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Pass threshold: {Math.round(boss.pass_threshold * 100)}%
              </span>
              <span className="text-accent-orange">+{boss.xp_reward} XP</span>
              {boss.badge && (
                <span className="flex items-center gap-1 text-accent-purple">
                  <Trophy className="w-3.5 h-3.5" />
                  {boss.badge.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-text-muted mb-4">
        <span className="flex items-center gap-1.5">
          <Timer className="w-4 h-4" />
          {answeredCount}/{totalQuestions} answered
        </span>
        <div className="w-32 bg-bg-elevated rounded-full h-1.5">
          <div
            className="bg-brand-cyan h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        <AnimatePresence>
          {boss.questions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-bg-secondary border border-border rounded-xl p-5"
            >
              <p className="text-sm font-medium text-white mb-4">
                <span className="text-text-muted mr-2 font-mono">Q{idx + 1}.</span>
                {q.text}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(q.id, opt)}
                    className={`px-4 py-2.5 rounded-lg text-sm text-left transition-all duration-150 border ${
                      answers[q.id] === opt
                        ? "bg-brand-cyan/10 border-brand-cyan text-white"
                        : "bg-bg-elevated border-border text-text-secondary hover:border-brand-cyan/30 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button
          onClick={() => void handleSubmit()}
          disabled={answeredCount < totalQuestions || submitting}
          className="w-full py-4 bg-accent-red text-white font-semibold text-base rounded-xl hover:bg-accent-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Sword className="w-5 h-5" />
          {submitting ? "Fighting boss..." : "Submit & Fight!"}
        </button>
        {answeredCount < totalQuestions && (
          <p className="text-text-muted text-xs text-center mt-2">
            Answer all {totalQuestions} questions to proceed
          </p>
        )}
      </div>
    </div>
  );
}
