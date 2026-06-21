/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Sword,
  Trophy,
  Timer,
  Heart,
  RotateCcw,
  ChevronRight
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

interface BossQuestion {
  id: string;
  text: string;
  options: string[];
  topic?: string;
}

interface BossSessionData {
  userId: string;
  bossId: string;
  lives: number;
  currentLevel: number;
  level1: {
    type: string;
    questions: BossQuestion[];
  };
  level2: {
    type: string;
    prompt: string;
    pairs: string[];
    fullPairs: Array<{ left: string; right: string }>;
  };
  level2MatchedPairs: Array<{ left: string; right: string }>;
  level3PartialCode: string;
}

interface BossDetail {
  id: string;
  name: string;
  level: string;
  pass_threshold: number;
  xp_reward: number;
  questions: any;
  badge: { id: string; name: string; rarity: string; image_url: string } | null;
}

const getMonacoLanguage = (track: string) => {
  switch ((track || "JAVASCRIPT").toUpperCase()) {
    case "C":
    case "CPP":
      return "cpp";
    case "JAVA":
      return "java";
    case "PYTHON":
      return "python";
    default:
      return "javascript";
  }
};

export default function BossBattlePage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  
  const [boss, setBoss] = useState<BossDetail | null>(null);
  const [session, setSession] = useState<BossSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Game states
  const [submitting, setSubmitting] = useState(false);
  const [victoryResult, setVictoryResult] = useState<any>(null);
  const [userTrack, setUserTrack] = useState<string>("JAVASCRIPT");
  
  // Level 1: Quiz states
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [incorrectQuestions, setIncorrectQuestions] = useState<string[]>([]);
  
  // Level 2: Matching states
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [tempMatches, setTempMatches] = useState<Array<{ left: string; right: string }>>([]);

  // Level 3: Coding & Timer states
  const [code, setCode] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes (300s)
  const [runResult, setRunResult] = useState<any>(null);
  const [bossHp, setBossHp] = useState(100);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<BossDetail>(`/boss/${id}`),
      apiFetch<any>(`/boss/${id}/session/status`),
      apiFetch<{ user: { languageTrack: string } }>("/users/me").catch(() => null)
    ])
      .then(([bossRes, sessionRes, userRes]) => {
        setBoss(bossRes.data);
        if (sessionRes.success && sessionRes.data) {
          const sData = sessionRes.data as BossSessionData;
          setSession(sData);
          setCode(sData.level3PartialCode || "");
          
          // Pre-populate locked matches
          setTempMatches(sData.level2MatchedPairs || []);
        } else {
          // Force start session if none exists
          handleStartSession();
        }

        if (userRes && userRes.data?.user) {
          setUserTrack(userRes.data.user.languageTrack || "JAVASCRIPT");
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error("World is locked.");
          router.push(`/roadmaps`);
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  // Coding timer countdown effect
  useEffect(() => {
    if (!session || session.currentLevel !== 3 || victoryResult) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeoutTrigger();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session, victoryResult]);

  const handleStartSession = async () => {
    try {
      const res: any = await apiFetch(`/boss/${id}/session/start`, { method: "POST" });
      if (res.success && res.data) {
        setSession(res.data);
        setCode(res.data.level3PartialCode || "");
        setTempMatches(res.data.level2MatchedPairs || []);
        setVictoryResult(null);
        setMcqAnswers({});
        setIncorrectQuestions([]);
        setTimerSeconds(300);
      }
    } catch (err: any) {
      const errMsg = err instanceof ApiError ? err.message : "Failed to start boss session.";
      toast.error(errMsg);
      if (err instanceof ApiError && err.status === 403) {
        router.push(`/roadmaps/${slug}`);
      }
    }
  };

  const handleTimeoutTrigger = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      const res: any = await apiFetch(`/boss/${id}/session/timeout`, {
        method: "POST",
        body: JSON.stringify({ partialCode: code }),
      });
      if (res.success && res.data) {
        const nextSession = res.data;
        if (nextSession.lives <= 0 || nextSession.reset) {
          toast.error("Timer expired! You lost all lives. Restarting from Level 1.");
          handleStartSession();
        } else {
          toast.error("Timer expired! You lost 1 life.");
          setSession(nextSession);
          setTimerSeconds(300);
        }
      }
    } catch (err) {
      toast.error("Error sending timeout status.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitLevel = async (payload: any) => {
    if (!session) return;
    setSubmitting(true);
    setRunResult(null);

    try {
      const res: any = await apiFetch(`/boss/${id}/session/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        const resultData = res.data;

        if (resultData.passed && resultData.success) {
          // LEVEL 3 VICTORY!
          setBossHp(0);
          setVictoryResult(resultData);
          toast.success("BOSS DEFEATED! Congratulations!");
        } else if (resultData.advanced) {
          // LEVEL ADVANCEMENT
          toast.success(resultData.feedback || "Advanced to next level!");
          setSession(resultData.session);
          setTempMatches(resultData.session.level2MatchedPairs || []);
        } else {
          // LEVEL FAILURE (losing 1 life)
          if (resultData.reset) {
            toast.error("You lost all lives! Starting over.");
            handleStartSession();
          } else {
            toast.error(resultData.feedback || "Incorrect submission. Life lost.");
            setSession(resultData.session);
            
            if (session.currentLevel === 1) {
              setIncorrectQuestions(resultData.incorrectQuestionIds || []);
              setMcqAnswers({});
            } else if (session.currentLevel === 2) {
              setTempMatches(resultData.level2MatchedPairs || []);
            } else if (session.currentLevel === 3) {
              setRunResult(resultData.runResult);
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = (questionId: string, option: string) => {
    setMcqAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  // Level 1 MCQ submit helper
  const handleMcqSubmit = () => {
    if (!session) return;
    const answers = Object.entries(mcqAnswers).map(([qid, ans]) => ({
      question_id: qid,
      answer: ans,
    }));
    submitLevel({ answers });
  };

  // Level 2 Matching helpers
  const handleLeftClick = (item: string) => {
    if (tempMatches.some((m) => m.left === item)) return; // Already matched
    setSelectedLeft(item);
    if (selectedRight) {
      makeMatch(item, selectedRight);
    }
  };

  const handleRightClick = (item: string) => {
    if (tempMatches.some((m) => m.right === item)) return; // Already matched
    setSelectedRight(item);
    if (selectedLeft) {
      makeMatch(selectedLeft, item);
    }
  };

  const makeMatch = (left: string, right: string) => {
    setTempMatches((prev) => [...prev, { left, right }]);
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const removeMatch = (left: string) => {
    // Check if match was already locked in previous attempt (cannot remove locked)
    if (session?.level2MatchedPairs.some((m) => m.left === left)) {
      toast.error("Correct match is locked and cannot be removed.");
      return;
    }
    setTempMatches((prev) => prev.filter((m) => m.left !== left));
  };

  const handleMatchingSubmit = () => {
    submitLevel({ matchedPairs: tempMatches });
  };

  // Level 3 Coding submit helper
  const handleCodeSubmit = () => {
    const timeUsed = 300 - timerSeconds;
    submitLevel({ code, language: userTrack, timeSeconds: timeUsed });
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 bg-bg-elevated rounded w-48" />
        <div className="h-96 bg-bg-secondary rounded-2xl border border-border" />
      </div>
    );
  }

  if (!boss || !session) return null;

  const totalQuestions = session.level1.questions.length;
  const answeredCount = Object.keys(mcqAnswers).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <Link
        href={`/roadmaps/${slug}`}
        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Module Details
      </Link>

      {/* Battle Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Monster Card */}
        <div className="md:col-span-2 bg-bg-secondary border border-accent-red/20 rounded-2xl p-6 relative overflow-hidden flex items-center gap-5 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-red/5 to-accent-orange/5" />
          <motion.div
            animate={bossHp > 0 ? { y: [0, -6, 0] } : { scale: 0 }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-6xl shrink-0 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            {bossHp > 0 ? "👹" : "💀"}
          </motion.div>
          
          <div className="relative flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <h1 className="text-xl font-heading font-bold text-white">{boss.name}</h1>
              <span className="text-xs text-text-muted font-mono">Level {session.currentLevel}/3</span>
            </div>
            
            {/* Monster HP Bar */}
            <div className="w-full bg-bg-elevated rounded-full h-3 border border-border overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-accent-red to-accent-orange h-3 rounded-full"
                animate={{ width: `${bossHp}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary mt-1">
              <span>HP: {bossHp}/100</span>
              <span className="text-accent-red uppercase tracking-wider font-bold">Boss Combatant</span>
            </div>
          </div>
        </div>

        {/* Lives & Status Card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-6 text-center space-y-3 relative overflow-hidden flex flex-col justify-center">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Lives Remaining</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-8 h-8 ${
                  heartIndex <= session.lives
                    ? "text-accent-red fill-accent-red filter drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                    : "text-text-muted opacity-30"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">
            {session.lives === 1 ? "⚠️ Critical Warning: 1 life left!" : "Defeat the boss in 3 levels"}
          </span>
        </div>
      </div>

      {/* Main Level Panel */}
      <AnimatePresence mode="wait">
        {victoryResult ? (
          /* Victory screen */
          <motion.div
            key="victory"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary border border-accent-green/30 rounded-2xl p-8 text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 to-brand-cyan/5 opacity-50" />
            <div className="relative">
              <Trophy className="w-16 h-16 text-accent-green mx-auto mb-4 filter drop-shadow-[0_0_12px_rgba(6,214,160,0.5)]" />
              <h2 className="text-2xl font-heading font-bold text-white mb-2">Victory! Boss Defeated!</h2>
              <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">{victoryResult.feedback}</p>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                <div className="bg-bg-elevated/60 border border-border p-4 rounded-xl text-center">
                  <p className="text-2xl font-mono font-bold text-white">+{victoryResult.xp_earned} XP</p>
                  <p className="text-xs text-text-muted mt-1">Reward Claimed</p>
                </div>
                <div className="bg-bg-elevated/60 border border-border p-4 rounded-xl text-center">
                  <p className="text-2xl font-mono font-bold text-white">100%</p>
                  <p className="text-xs text-text-muted mt-1">Grade Score</p>
                </div>
              </div>

              {victoryResult.badge_earned && (
                <div className="bg-bg-elevated border border-border rounded-xl p-4 max-w-sm mx-auto mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-3xl text-accent-purple shrink-0">
                    🏆
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{victoryResult.badge_earned.name}</p>
                    <p className="text-xs text-text-muted capitalize">{victoryResult.badge_earned.rarity} Badge Awarded</p>
                  </div>
                </div>
              )}

              <Link
                href={`/roadmaps/${slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors"
              >
                Continue Roadmap
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : session.currentLevel === 1 ? (
          /* Level 1: MCQ Quiz */
          <motion.div
            key="level1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-bg-secondary border border-border rounded-2xl p-6">
              <h2 className="text-lg font-heading font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-brand-cyan/20 text-brand-cyan flex items-center justify-center text-xs">1</span>
                Level 1: Concept Verification
              </h2>
              <p className="text-xs text-text-secondary">
                Answer at least 4 out of 5 questions correctly to advance to Level 2. Incorrect questions will be flagged on failure.
              </p>
            </div>

            <div className="space-y-4">
              {session.level1.questions.map((q, idx) => {
                const isIncorrectFlag = incorrectQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`bg-bg-secondary border rounded-2xl p-6 transition-all ${
                      isIncorrectFlag ? "border-accent-red/40 bg-accent-red/5" : "border-border"
                    }`}
                  >
                    <p className="text-sm font-medium text-white mb-4 flex items-start gap-2">
                      <span className="text-text-muted font-mono font-semibold shrink-0">Q{idx + 1}.</span>
                      <span>{q.text}</span>
                      {isIncorrectFlag && (
                        <span className="text-[10px] bg-accent-red/20 text-accent-red px-2 py-0.5 rounded-full font-bold border border-accent-red/20">
                          Incorrect
                        </span>
                      )}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(q.id, opt)}
                          className={`px-4 py-3 rounded-xl text-sm text-left transition-all border ${
                            mcqAnswers[q.id] === opt
                              ? "bg-brand-cyan/15 border-brand-cyan text-white font-medium shadow-[0_0_10px_rgba(0,180,216,0.1)]"
                              : "bg-bg-elevated/40 border-border/80 text-text-secondary hover:border-brand-cyan/30 hover:text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-bg-secondary border border-border rounded-2xl p-5 flex items-center justify-between">
              <span className="text-xs text-text-secondary font-mono">{answeredCount}/5 Questions Answered</span>
              <button
                onClick={handleMcqSubmit}
                disabled={answeredCount < totalQuestions || submitting}
                className="px-6 py-2.5 bg-brand-cyan text-bg-primary font-bold text-sm rounded-xl hover:bg-brand-cyan/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Grading..." : "Submit Level 1 Answers"}
              </button>
            </div>
          </motion.div>
        ) : session.currentLevel === 2 ? (
          /* Level 2: Matching Pairs */
          <motion.div
            key="level2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-bg-secondary border border-border rounded-2xl p-6">
              <h2 className="text-lg font-heading font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-accent-purple/20 text-accent-purple flex items-center justify-center text-xs">2</span>
                Level 2: Architecture & Flow Matching
              </h2>
              <p className="text-xs text-text-secondary">
                Match all 4 pairs correctly to unlock Level 3. Correctly matched pairs are **locked** on failure, so you only retry incorrect ones.
              </p>
            </div>

            {/* Matching Grid Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-bg-secondary border border-border rounded-2xl p-8">
              
              {/* Left Column choices */}
              <div className="space-y-3">
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Concepts</p>
                {session.level2.pairs.map((item) => {
                  const isMatched = tempMatches.some((m) => m.left === item);
                  const isLocked = session.level2MatchedPairs.some((m) => m.left === item);
                  const isSelected = selectedLeft === item;

                  return (
                    <button
                      key={item}
                      onClick={() => handleLeftClick(item)}
                      disabled={isMatched}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all ${
                        isLocked
                          ? "bg-accent-green/5 border-accent-green/20 text-accent-green cursor-not-allowed opacity-80"
                          : isMatched
                          ? "bg-bg-elevated/20 border-border text-text-muted opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "bg-accent-purple/10 border-accent-purple text-white shadow-lg shadow-accent-purple/5"
                          : "bg-bg-elevated/50 border-border text-text-secondary hover:border-accent-purple/35 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Right Column choices */}
              <div className="space-y-3">
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Iteration / Definitions</p>
                {session.level2.fullPairs.map((p) => {
                  const item = p.right;
                  const isMatched = tempMatches.some((m) => m.right === item);
                  const isLocked = session.level2MatchedPairs.some((m) => m.right === item);
                  const isSelected = selectedRight === item;

                  return (
                    <button
                      key={item}
                      onClick={() => handleRightClick(item)}
                      disabled={isMatched}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all ${
                        isLocked
                          ? "bg-accent-green/5 border-accent-green/20 text-accent-green cursor-not-allowed opacity-80"
                          : isMatched
                          ? "bg-bg-elevated/20 border-border text-text-muted opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "bg-accent-purple/10 border-accent-purple text-white shadow-lg shadow-accent-purple/5"
                          : "bg-bg-elevated/50 border-border text-text-secondary hover:border-accent-purple/35 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connection list / Matches visualizer */}
            <div className="bg-bg-secondary border border-border rounded-2xl p-6 space-y-4">
              <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Current Match Board</p>
              {tempMatches.length === 0 ? (
                <p className="text-sm text-text-muted italic text-center py-4">Click items in both columns to make connections.</p>
              ) : (
                <div className="space-y-2">
                  {tempMatches.map((match) => {
                    const isLocked = session.level2MatchedPairs.some((m) => m.left === match.left);
                    return (
                      <div
                        key={match.left}
                        className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                          isLocked
                            ? "bg-accent-green/5 border-accent-green/20 text-accent-green"
                            : "bg-bg-elevated/50 border-border text-text-secondary"
                        }`}
                      >
                        <span className="font-semibold">{match.left}</span>
                        <span className="text-text-muted text-xs mx-3">matched to</span>
                        <span className="font-semibold text-right">{match.right}</span>
                        
                        <button
                          onClick={() => removeMatch(match.left)}
                          disabled={isLocked}
                          className={`ml-4 text-xs font-bold text-text-muted hover:text-accent-red transition-colors shrink-0 ${
                            isLocked ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                        >
                          {isLocked ? "Match Locked" : "Reset Match"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Block */}
            <div className="bg-bg-secondary border border-border rounded-2xl p-5 flex items-center justify-between">
              <span className="text-xs text-text-secondary font-mono">{tempMatches.length}/4 Pairs Connected</span>
              <button
                onClick={handleMatchingSubmit}
                disabled={tempMatches.length < 4 || submitting}
                className="px-6 py-2.5 bg-accent-purple text-white font-bold text-sm rounded-xl hover:bg-accent-purple/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Checking Matches..." : "Validate Connections"}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Level 3: Coding Boss Fight */
          <motion.div
            key="level3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-bg-secondary border border-border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-heading font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-accent-red/20 text-accent-red flex items-center justify-center text-xs">3</span>
                  Level 3: Live Code Execution & Test Cases
                </h2>
                <p className="text-xs text-text-secondary">
                  Complete the function block inside the editor. Your code compiles and runs against 2-3 real tests.
                </p>
              </div>

              {/* Countdown timer */}
              <div className="bg-bg-elevated border border-border px-4 py-2 rounded-xl flex items-center gap-2 shrink-0">
                <Timer className={`w-4 h-4 ${timerSeconds < 60 ? "text-accent-red animate-pulse" : "text-brand-cyan"}`} />
                <span className={`font-mono text-sm font-bold ${timerSeconds < 60 ? "text-accent-red animate-pulse" : "text-white"}`}>
                  {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Prompt block */}
            <div className="bg-bg-secondary border border-border rounded-2xl p-6">
              <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Coding Problem Statement</p>
              <p className="text-sm text-white font-medium leading-relaxed">
                {boss.questions.level3?.challenges?.[(userTrack || "JAVASCRIPT").toUpperCase()]?.prompt || 
                  "Write a function to complete the challenge requirements."}
              </p>
            </div>

            {/* Monaco Editor Container */}
            <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-2xl">
              <Editor
                height="320px"
                language={getMonacoLanguage(userTrack)}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>

            {/* Run results / output logs */}
            {runResult && (
              <div className="bg-bg-secondary border border-border rounded-2xl p-6 space-y-4">
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Subprocess Execution Logs</p>
                {runResult.compileError ? (
                  <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre">
                    {runResult.compileError}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {runResult.testResults?.map((res: any, idx: number) => (
                      <div key={idx} className={`p-4 rounded-xl border font-mono text-xs flex flex-col gap-2 ${
                        res.passed ? "bg-accent-green/5 border-accent-green/20 text-accent-green" : "bg-accent-red/5 border-accent-red/20 text-accent-red"
                      }`}>
                        <div className="flex justify-between font-bold">
                          <span>Test Case {idx + 1}</span>
                          <span>{res.passed ? "PASSED" : "FAILED"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-text-secondary">
                          <div>Input: <span className="text-white">{res.input}</span></div>
                          <div>Expected: <span className="text-white">{res.expected}</span></div>
                          <div className="col-span-2">
                            Actual: <span className={res.passed ? "text-accent-green font-semibold" : "text-accent-red font-semibold"}>
                              {res.error ? `Error: ${res.error}` : res.actual || '""'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="bg-bg-secondary border border-border rounded-2xl p-5 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setCode(boss.questions.level3?.challenges?.[(userTrack || "JAVASCRIPT").toUpperCase()]?.starterCode || "")}
                  className="px-4 py-2 border border-border text-xs font-medium text-text-secondary hover:text-white rounded-xl transition-colors hover:bg-bg-elevated/30 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Starter Code
                </button>
              </div>

              <button
                onClick={handleCodeSubmit}
                disabled={submitting || !code.trim()}
                className="px-8 py-3 bg-accent-red hover:bg-accent-red/95 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sword className="w-4 h-4 animate-pulse" />
                {submitting ? "Executing Solution..." : "Execute & Fight!"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
