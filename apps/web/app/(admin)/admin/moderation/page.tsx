"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserX,
  CheckCircle,
  AlertTriangle,
  Clock,
  ThumbsUp
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string; // pending, resolved, dismissed, invalid_target
  actionTaken: string | null;
  createdAt: string;
  reporter: {
    name: string;
    email: string;
  };
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal / state
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [resolveActionText, setResolveActionText] = useState("");
  const [resolving, setResolving] = useState(false);

  // Suspension confirmation
  const [suspendingUser, setSuspendingUser] = useState<string | null>(null);
  const [suspending, setSuspending] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await apiFetch<Report[]>("/admin/reports");
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to load moderation queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport || !resolveActionText.trim()) return;

    setResolving(true);
    try {
      const res = await apiFetch(`/admin/reports/${activeReport.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ actionTaken: resolveActionText }),
      });

      if (res.success) {
        toast.success("Report resolved successfully!");
        setResolveActionText("");
        setActiveReport(null);
        await fetchReports();
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to resolve report");
    } finally {
      setResolving(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    setSuspending(true);
    try {
      const res = await apiFetch(`/admin/users/${userId}/suspend`, {
        method: "POST",
      });

      if (res.success) {
        toast.success("User account suspended and active sessions revoked!");
        setSuspendingUser(null);
        await fetchReports();
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to suspend user");
    } finally {
      setSuspending(false);
    }
  };

  const pendingReports = reports.filter((r) => r.status === "pending");
  const processedReports = reports.filter((r) => r.status !== "pending");

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-elevated rounded w-48" />
          <div className="h-96 bg-bg-secondary rounded-xl border border-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-heading font-bold text-white mb-1">Moderation Queue</h1>
          <p className="text-text-secondary text-sm">
            Investigate flag violations, review automated plagiarism warnings, and enforce security policies.
          </p>
        </motion.div>
      </div>

      {/* AST Plagiarism Notice Alert (Compliance Plagiarism Notice) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary border-l-4 border-accent-orange p-4 rounded-r-xl border border-border flex gap-3 mb-8"
      >
        <AlertTriangle className="w-5 h-5 text-accent-orange shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-white mb-1">AST Plagiarism Warning Guidance</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Please review similarity matches with care. AST structure matches indicate structural correlation (ignoring variable names and comments).
            This is a **flag for review**, not structural proof of cheating. Inspect the code structure manually before executing account suspensions.
          </p>
        </div>
      </motion.div>

      {/* Moderation Queue */}
      <div className="grid grid-cols-1 gap-8">
        {/* Pending Reports Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-orange" />
              <h2 className="text-lg font-heading font-bold text-white">Pending Moderation Requests</h2>
            </div>
            <span className="text-xs px-2 py-0.5 bg-accent-orange/20 border border-accent-orange/30 text-accent-orange rounded font-mono font-bold">
              {pendingReports.length} Active Flags
            </span>
          </div>

          <div className="space-y-4">
            {pendingReports.length === 0 ? (
              <div className="text-center py-12 text-sm text-text-muted flex flex-col items-center justify-center gap-2">
                <ThumbsUp className="w-8 h-8 text-accent-green" />
                <span>Moderation queue is fully cleared! No pending flags.</span>
              </div>
            ) : (
              pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 bg-bg-elevated rounded-xl border border-border flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-brand-cyan/20 transition-all"
                >
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 bg-accent-red/20 text-accent-red border border-accent-red/35 rounded font-mono font-bold uppercase">
                          Target: {report.targetType}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono truncate max-w-[180px]">
                          ID: {report.targetId}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">•</span>
                        <span className="text-[10px] text-text-secondary">
                          Reporter: {report.reporter?.name || "System"}
                        </span>
                      </div>

                      <div className="p-3 bg-bg-secondary rounded-lg border border-border/40 text-sm text-white font-sans whitespace-pre-wrap leading-relaxed">
                        {report.reason}
                      </div>

                      <p className="text-[10px] text-text-muted font-mono">
                        Flagged At: {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-36">
                      <button
                        onClick={() => setActiveReport(report)}
                        className="flex-1 py-1.5 bg-brand-cyan hover:bg-brand-cyan/90 text-bg-primary font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve
                      </button>

                      {report.targetType === "USER" && (
                        <button
                          onClick={() => setSuspendingUser(report.targetId)}
                          className="flex-1 py-1.5 border border-accent-red text-accent-red hover:bg-accent-red/10 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Suspend User
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </motion.div>

        {/* Processed History Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-text-secondary" />
            <h2 className="text-base font-heading font-bold text-white">Processed Reports History</h2>
          </div>

          <div className="overflow-x-auto">
            {processedReports.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted border border-border/20 rounded-lg">
                No resolution logs logged
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-text-secondary uppercase font-mono">
                    <th className="py-2.5 px-2">Target</th>
                    <th className="py-2.5 px-2">Reason</th>
                    <th className="py-2.5 px-2">Resolution Action</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-2 text-right">Resolved At</th>
                  </tr>
                </thead>
                <tbody>
                  {processedReports.map((r) => (
                    <tr key={r.id} className="border-b border-border/20 text-text-secondary">
                      <td className="py-2.5 px-2 font-bold text-white">{r.targetType}</td>
                      <td className="py-2.5 px-2 max-w-xs truncate">{r.reason}</td>
                      <td className="py-2.5 px-2 font-mono">{r.actionTaken || "N/A"}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            r.status === "resolved"
                              ? "bg-accent-green/20 text-accent-green"
                              : "bg-text-muted/20 text-text-secondary"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-[10px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>

      {/* Resolution Dialog */}
      <AnimatePresence>
        {activeReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2 text-brand-cyan">
                  <CheckCircle className="w-5 h-5" />
                  <h2 className="text-lg font-heading font-bold text-white">Resolve Report</h2>
                </div>
                <button
                  onClick={() => {
                    setActiveReport(null);
                    setResolveActionText("");
                  }}
                  className="text-text-muted hover:text-white transition-colors font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleResolveReport} className="space-y-4">
                <div className="p-3 bg-bg-elevated rounded-lg text-xs border border-border">
                  <span className="text-text-secondary font-semibold block mb-1">Reason Logged:</span>
                  <p className="text-white whitespace-pre-wrap">{activeReport.reason}</p>
                </div>

                <div>
                  <label className="block text-xs text-text-secondary uppercase font-bold tracking-wider mb-1.5">
                    Action Taken / Resolution Summary
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Warning issued to student. Code review confirmed idiomatic duplicate."
                    value={resolveActionText}
                    onChange={(e) => setResolveActionText(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan font-sans"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReport(null);
                      setResolveActionText("");
                    }}
                    className="flex-1 py-2 border border-border text-text-secondary hover:text-white rounded-lg transition-all text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resolving}
                    className="flex-1 py-2 bg-brand-cyan text-bg-primary hover:bg-brand-cyan/90 rounded-lg transition-all text-sm font-semibold"
                  >
                    {resolving ? "Resolving..." : "Confirm Resolve"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Suspension Confirmation Dialog */}
      <AnimatePresence>
        {suspendingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-2.5 text-accent-red border-b border-border/40 pb-3">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-lg font-heading font-bold text-white">Suspend Account?</h2>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-white leading-relaxed">
                  Are you sure you want to suspend user ID:
                </p>
                <p className="text-xs bg-bg-elevated p-2 rounded border border-border font-mono text-center text-accent-red font-semibold select-all">
                  {suspendingUser}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  This updates user status to <span className="font-bold">suspended</span>, deletes active refresh sessions, and blacklists their ID in Redis for O(1) request-time blocks.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSuspendingUser(null)}
                  className="flex-1 py-2 border border-border text-text-secondary hover:text-white rounded-lg transition-all text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSuspendUser(suspendingUser)}
                  disabled={suspending}
                  className="flex-1 py-2 bg-accent-red hover:bg-accent-red/90 text-white rounded-lg transition-all text-sm font-semibold"
                >
                  {suspending ? "Suspending..." : "Confirm Suspend"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
