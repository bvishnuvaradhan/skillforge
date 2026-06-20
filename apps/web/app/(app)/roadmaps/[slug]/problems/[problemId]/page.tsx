"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Send, Loader2, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

interface ProblemDetail {
  id: string;
  title: string;
  description: string;
  starter_code: string;
  saved_code: string | null;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  sample_test_cases: Array<{ input: string; output: string }>;
  xp_reward: number;
  completed: boolean;
}

interface WorldDetail {
  id: string;
  name: string;
  progress: {
    status: string;
    lessons_completed: number;
    games_completed: number;
    xp_earned: number;
  };
  original_problems: ProblemDetail[];
}

export default function ProblemDetailPage() {
  const { slug, problemId } = useParams<{ slug: string; problemId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [world, setWorld] = useState<WorldDetail | null>(null);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [userTrack, setUserTrack] = useState<string>("JAVASCRIPT");
  const [code, setCode] = useState<string>("");
  
  // Execution states
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    passed: boolean;
    compileError?: string | null;
    testResults?: Array<{ input: string; expected: string; actual: string; passed: boolean; error?: string }>;
    error?: { code: string; message: string; details?: any } | null;
  } | null>(null);

  const [savingStatus, setSavingStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastAction, setLastAction] = useState<"run" | "submit" | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!slug || !problemId) return;

    Promise.all([
      apiFetch<WorldDetail>(`/worlds/${slug}`),
      apiFetch<{ user: { languageTrack: string } }>("/users/me").catch(() => null)
    ])
      .then(([worldRes, userRes]) => {
        const wData = worldRes.data;
        setWorld(wData);
        
        const track = userRes?.data?.user?.languageTrack || "JAVASCRIPT";
        setUserTrack(track);

        const prob = wData.original_problems.find((p) => p.id === problemId);
        if (prob) {
          setProblem(prob);
          setCode(prob.saved_code || prob.starter_code);
        } else {
          toast.error("Problem not found in this module.");
          router.push(`/roadmaps/${slug}`);
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load problem details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, problemId, router]);

  // Debounced auto-saving
  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || "";
    setCode(newCode);
    setSavingStatus("unsaved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setSavingStatus("saving");
      apiFetch(`/worlds/${slug}/problems/original/${problemId}/save`, {
        method: "POST",
        body: JSON.stringify({ code: newCode }),
      })
        .then(() => {
          setSavingStatus("saved");
        })
        .catch((err) => {
          setSavingStatus("unsaved");
          console.error("Auto-save failed:", err);
        });
    }, 1500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const getMonacoLanguage = (track: string) => {
    switch (track.toUpperCase()) {
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

  const handleRun = async () => {
    if (running || submitting) return;
    setRunning(true);
    setResults(null);
    setLastAction("run");
    try {
      const res = await apiFetch<any>(`/worlds/${slug}/problems/original/${problemId}/run`, {
        method: "POST",
        body: JSON.stringify({ code, language: userTrack }),
      });
      if (res.success) {
        setResults(res.data);
        if (res.data.passed) {
          toast.success("Sample tests passed! Submit your solution.");
        } else {
          toast.error(res.data.error?.message || "Failed sample test cases.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to run code.");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (running || submitting) return;
    setSubmitting(true);
    setResults(null);
    setLastAction("submit");
    try {
      const res = await apiFetch<any>(`/worlds/${slug}/problems/original/${problemId}/complete`, {
        method: "POST",
        body: JSON.stringify({ code, language: userTrack }),
      });
      if (res.success) {
        setResults(res.data);
        if (res.data.passed === false) {
          toast.error(res.data.error?.message || "Submit failed on test cases.");
        } else {
          toast.success(res.data.message || "Problem solved and completed!");
          setTimeout(() => {
            router.push(`/roadmaps/${slug}`);
          }, 3000);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit code.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] p-6 space-y-6 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
        <p className="text-text-secondary text-sm font-medium animate-pulse">Loading problem environment...</p>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-text-primary flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-[#1E2B45] bg-[#111827] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/roadmaps/${slug}`}
            className="p-2 bg-[#1A1F35] border border-[#1E2B45] rounded-xl hover:bg-[#1A1F35]/80 transition-colors text-text-secondary hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              {problem.title}
              {problem.completed && (
                <span className="text-[10px] bg-accent-green/20 text-accent-green px-2 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">
                  Solved
                </span>
              )}
            </h1>
            <p className="text-xs text-text-secondary">
              Module: <span className="text-white font-medium">{world?.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto-save Status Indicator */}
          <span className="text-xs text-text-muted flex items-center gap-1.5 font-mono">
            {savingStatus === "saving" && (
              <>
                <RefreshCw className="w-3 h-3 text-brand-cyan animate-spin" />
                Saving...
              </>
            )}
            {savingStatus === "saved" && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                Draft Saved
              </>
            )}
            {savingStatus === "unsaved" && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
                Unsaved Changes
              </>
            )}
          </span>

          <span className="text-xs bg-[#1A1F35] border border-[#1E2B45] text-accent-orange px-3 py-1.5 rounded-xl font-mono">
            +{problem.xp_reward} XP
          </span>
          <span className="text-xs bg-[#1A1F35] border border-[#1E2B45] text-brand-cyan px-3 py-1.5 rounded-xl font-mono uppercase font-bold">
            {userTrack}
          </span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-73px)]">
        
        {/* Left Column: Description & Specs */}
        <div className="p-6 overflow-y-auto h-full max-h-[calc(100vh-73px)] space-y-6 border-r border-[#1E2B45] bg-[#0A0E1A]">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider text-text-secondary">
              Problem Statement
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed bg-[#111827] border border-[#1E2B45] p-4 rounded-xl">
              {problem.description}
            </p>
          </div>

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider text-text-secondary">
                Constraints
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-text-secondary bg-[#111827] border border-[#1E2B45] p-4 rounded-xl font-mono">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-heading text-white uppercase tracking-wider text-text-secondary">
                Examples
              </h3>
              {problem.examples.map((ex, i) => (
                <div
                  key={i}
                  className="bg-[#111827] border border-[#1E2B45] p-4 rounded-xl space-y-2.5 font-mono text-xs"
                >
                  <p className="font-sans font-bold text-white text-xs border-b border-[#1E2B45]/50 pb-1">
                    Example {i + 1}
                  </p>
                  <div>
                    <span className="text-text-muted">Input:</span> <span className="text-white">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Output:</span> <span className="text-accent-green font-bold">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-text-secondary border-t border-[#1E2B45]/20 pt-2 font-sans text-xs italic">
                      <span className="font-bold text-text-muted">Explanation:</span> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Results */}
        <div className="flex flex-col h-full max-h-[calc(100vh-73px)] bg-[#111827] overflow-hidden min-h-0">
          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-0 relative border-b border-[#1E2B45]">
            <Editor
              height="100%"
              language={getMonacoLanguage(userTrack)}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Actions & Results Console */}
          <div className="bg-[#0A0E1A] border-t border-[#1E2B45] p-4 space-y-4 flex-shrink-0">
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted font-mono">
                Press Run to check sample test cases.
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRun}
                  disabled={running || submitting}
                  className="px-5 py-2 text-sm border border-[#1E2B45] hover:border-brand-cyan/40 bg-[#1A1F35] text-text-primary rounded-xl font-semibold transition-colors flex items-center gap-2 hover:bg-[#1A1F35]/85"
                >
                  {running ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-cyan" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Run
                    </>
                  )}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={running || submitting}
                  className="px-5 py-2 text-sm bg-brand-cyan text-[#0A0E1A] hover:bg-brand-cyan/90 rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Results Output Console */}
            {results && (
              <div className="border border-[#1E2B45] rounded-xl overflow-hidden bg-[#111827]">
                <div className="bg-[#1A1F35] px-4 py-2 border-b border-[#1E2B45] flex items-center justify-between">
                  <span className="text-xs font-bold font-heading text-white">
                    {lastAction === "run" ? "Sample Run Results" : "Submission Results"}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      results.passed
                        ? "bg-accent-green/20 text-accent-green"
                        : "bg-accent-red/20 text-accent-red"
                    }`}
                  >
                    {results.passed ? "All Passed" : "Failed"}
                  </span>
                </div>

                <div className="p-4 max-h-[260px] overflow-y-auto space-y-3 font-mono text-xs">
                  {/* Compilation Error Output */}
                  {results.error?.code === "COMPILE_ERROR" && (
                    <div className="bg-accent-red/10 border border-accent-red/20 p-3 rounded-lg text-accent-red whitespace-pre-wrap leading-relaxed">
                      <p className="font-bold mb-1">Compilation Failure:</p>
                      {results.error?.details?.compile_error || results.compileError}
                    </div>
                  )}

                  {/* Empty Submission Error */}
                  {results.error?.code === "EMPTY_SUBMISSION" && (
                    <p className="text-accent-orange leading-relaxed">
                      ⚠️ {results.error?.message || "Empty submission. You must write code."}
                    </p>
                  )}

                  {/* Individual Test Cases Results for Run */}
                  {results.testResults && results.testResults.length > 0 && lastAction === "run" && (
                    <div className="space-y-2.5">
                      {results.testResults.map((r, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                            r.passed
                              ? "bg-accent-green/5 border-accent-green/20 text-accent-green"
                              : "bg-accent-red/5 border-accent-red/20 text-accent-red"
                          }`}
                        >
                          <div className="flex justify-between font-bold text-xs uppercase">
                            <span>Test Case {i + 1}</span>
                            <span>{r.passed ? "PASSED" : "FAILED"}</span>
                          </div>
                          <div className="text-text-secondary leading-normal text-xs font-mono">
                            <div>
                              Input: <span className="text-white">{r.input}</span>
                            </div>
                            <div>
                              Expected Output: <span className="text-white">{r.expected}</span>
                            </div>
                            <div>
                              Your Output:{" "}
                              <span className={r.passed ? "text-accent-green" : "text-accent-red"}>
                                {r.error ? `Error: ${r.error}` : r.actual}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Individual Test Cases Results for Submit (CodeChef style) */}
                  {results.testResults && results.testResults.length > 0 && lastAction === "submit" && (() => {
                    const testResults = results.testResults || [];
                    const firstFailIdx = testResults.findIndex((r) => !r.passed);
                    return (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 items-center">
                          {testResults.map((_, i) => {
                            let status: "passed" | "failed" | "skipped" = "passed";
                            if (firstFailIdx !== -1) {
                              if (i === firstFailIdx) {
                                status = "failed";
                              } else if (i > firstFailIdx) {
                                status = "skipped";
                              }
                            }
                            return (
                              <div
                                key={i}
                                className={`px-3 py-2 rounded-lg border font-mono font-bold text-xs flex flex-col items-center gap-1 min-w-[65px] ${
                                  status === "passed"
                                    ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
                                    : status === "failed"
                                    ? "bg-accent-red/10 border-accent-red/30 text-accent-red"
                                    : "bg-[#1A1F35] border-[#1E2B45] text-text-muted opacity-60"
                                }`}
                              >
                                <span>T{i + 1}</span>
                                <span className="text-[10px] uppercase font-sans">
                                  {status === "passed" ? "AC" : status === "failed" ? "WA" : "SKIP"}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {firstFailIdx !== -1 && (() => {
                           const failedTest = testResults[firstFailIdx];
                           if (!failedTest) return null;
                           return (
                             <div className="p-3 rounded-lg border bg-accent-red/5 border-accent-red/20 text-accent-red flex flex-col gap-1.5 font-mono">
                               <div className="font-bold text-xs uppercase flex justify-between font-sans">
                                 <span>Failed Test Details (Test {firstFailIdx + 1})</span>
                                 <span className="text-accent-red">WA (Wrong Answer)</span>
                                </div>
                                <div className="text-text-secondary leading-normal text-xs font-mono">
                                  <div>
                                    Input: <span className="text-white">{failedTest.input}</span>
                                  </div>
                                  <div>
                                    Expected Output: <span className="text-white">{failedTest.expected}</span>
                                  </div>
                                  <div>
                                    Your Output:{" "}
                                    <span className="text-accent-red">
                                      {failedTest.error
                                        ? `Error: ${failedTest.error}`
                                        : failedTest.actual}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                        {firstFailIdx === -1 && (
                          <p className="text-accent-green font-bold text-sm">
                            🎉 All test cases successfully passed!
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {(!results.testResults || results.testResults.length === 0) && !results.error && (
                    <p className="text-text-secondary">Execution finished successfully.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
