"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Settings,
  Users,
  Eye,
  Activity,
  ToggleLeft,
  ToggleRight,
  Shield,
  FileCode,
  AlertTriangle,
  History
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface AdminStats {
  users: number;
  mentors: number;
  activeSessions: number;
  pendingReports: number;
  resumes: number;
  exams: number;
}

interface FeatureFlag {
  id: string;
  key: string;
  isEnabled: boolean;
  description: string;
}

interface AuditLog {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    name: string;
  };
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New flag form
  const [flagKey, setFlagKey] = useState("");
  const [flagDesc, setFlagDesc] = useState("");
  const [savingFlag, setSavingFlag] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        apiFetch<AdminStats>("/admin/dashboard/stats").catch(() => null),
        // Let's also query some default audit logs if available or mock them
        apiFetch<AuditLog[]>("/admin/audit-logs").catch(() => ({ success: true, data: [] })),
      ]);

      if (statsRes) setStats(statsRes.data);
      if (reportsRes) setAuditLogs(reportsRes.data);

      // Pre-seed some default feature flags from DB or local
      // Fetch feature flags
      const flagsRes = await apiFetch<FeatureFlag[]>("/admin/feature-flags").catch(() => null);
      if (flagsRes) {
        setFlags(flagsRes.data);
      } else {
        // Fallback pre-seed in state if endpoint not loaded
        setFlags([
          { id: "1", key: "dlt-decay-triggers", isEnabled: true, description: "Triggers review recommendation when DLT retention drops < 0.7" },
          { id: "2", key: "ai-mock-interviews", isEnabled: true, description: "Allows students to schedule automated AI mock interview sessions" },
          { id: "3", key: "stripe-bypass-dev", isEnabled: false, description: "Bypasses Stripe checkout logic when testing payments in non-production" },
        ]);
      }
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdminData();
  }, [fetchAdminData]);

  const handleToggleFlag = async (flag: FeatureFlag) => {
    const updatedStatus = !flag.isEnabled;
    try {
      const res = await apiFetch<FeatureFlag>("/admin/feature-flags", {
        method: "POST",
        body: JSON.stringify({
          key: flag.key,
          isEnabled: updatedStatus,
          description: flag.description,
        }),
      });

      if (res.success) {
        toast.success(`Feature flag '${flag.key}' set to ${updatedStatus ? "ENABLED" : "DISABLED"}`);
        setFlags((prev) =>
          prev.map((f) => (f.key === flag.key ? { ...f, isEnabled: updatedStatus } : f))
        );
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to update feature flag");
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagKey.trim()) return;

    setSavingFlag(true);
    try {
      const res = await apiFetch<FeatureFlag>("/admin/feature-flags", {
        method: "POST",
        body: JSON.stringify({
          key: flagKey.trim(),
          isEnabled: false,
          description: flagDesc.trim(),
        }),
      });

      if (res.success) {
        toast.success(`Feature flag '${flagKey}' created successfully`);
        setFlags((prev) => [...prev.filter((f) => f.key !== flagKey), res.data]);
        setFlagKey("");
        setFlagDesc("");
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to create feature flag");
    } finally {
      setSavingFlag(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-elevated rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-bg-secondary rounded-xl border border-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center">
          <Settings className="w-5 h-5 text-accent-purple" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-text-secondary text-sm">
            Control platform toggles, review system metrics, and audit administrative actions.
          </p>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-bg-secondary border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wide">Total Users</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-mono font-bold text-white">{stats.users}</span>
              <Users className="w-4 h-4 text-brand-cyan mb-1" />
            </div>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wide">Approved Mentors</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-mono font-bold text-white">{stats.mentors}</span>
              <Shield className="w-4 h-4 text-accent-green mb-1" />
            </div>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wide">Active Sessions</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-mono font-bold text-white">{stats.activeSessions}</span>
              <Activity className="w-4 h-4 text-accent-orange mb-1" />
            </div>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wide">Pending Violations</span>
            <div className="flex items-end justify-between mt-2">
              <span className={`text-2xl font-mono font-bold ${stats.pendingReports > 0 ? "text-accent-red" : "text-white"}`}>
                {stats.pendingReports}
              </span>
              <AlertTriangle className="w-4 h-4 text-accent-red mb-1" />
            </div>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wide">Resumes Tracked</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-mono font-bold text-white">{stats.resumes}</span>
              <FileCode className="w-4 h-4 text-accent-purple mb-1" />
            </div>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wide">Exams Taken</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-mono font-bold text-white">{stats.exams}</span>
              <Eye className="w-4 h-4 text-text-muted mb-1" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feature Flag controls */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="text-lg font-heading font-bold text-white">System Feature Flags</h2>
              <span className="text-[10px] px-2 py-0.5 bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan rounded font-mono font-bold uppercase">
                O(1) Redis Cached
              </span>
            </div>

            <div className="space-y-4">
              {flags.map((flag) => (
                <div
                  key={flag.id || flag.key}
                  className="flex items-start justify-between p-4 bg-bg-elevated rounded-xl border border-border hover:border-brand-cyan/10 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-mono text-sm font-bold text-white">{flag.key}</p>
                    <p className="text-xs text-text-secondary max-w-lg leading-normal">
                      {flag.description || "No description provided."}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(flag)}
                    className="text-text-muted hover:text-white transition-colors"
                  >
                    {flag.isEnabled ? (
                      <ToggleRight className="w-9 h-9 text-brand-cyan" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-text-muted" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs list */}
          <div className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-text-secondary" />
              <h2 className="text-base font-heading font-bold text-white">Recent System Audits</h2>
            </div>
            
            <div className="overflow-x-auto">
              {auditLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-text-muted font-sans border border-border/20 rounded-lg">
                  No admin audit logs tracked in this session yet
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-text-secondary uppercase font-mono">
                      <th className="py-2.5 px-2">Action</th>
                      <th className="py-2.5 px-2">Details</th>
                      <th className="py-2.5 px-2 text-center">IP Address</th>
                      <th className="py-2.5 px-2 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border/20 text-text-secondary">
                        <td className="py-2.5 px-2 font-bold text-white">{log.action}</td>
                        <td className="py-2.5 px-2 font-mono max-w-xs truncate">{JSON.stringify(log.details)}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{log.ipAddress || "system"}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-[10px]">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Register Feature Flag */}
        <div>
          <div className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4">
            <h2 className="text-base font-heading font-bold text-white">Register Feature Flag</h2>
            <p className="text-xs text-text-secondary leading-normal">
              Register a new routing or behavior gate key. Flags default to disabled state.
            </p>

            <form onSubmit={handleCreateFlag} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="block text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1">
                  Flag Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. adaptive-exams"
                  value={flagKey}
                  onChange={(e) => setFlagKey(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize flag purpose..."
                  value={flagDesc}
                  onChange={(e) => setFlagDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-cyan font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={savingFlag}
                className="w-full py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-bg-primary font-semibold text-sm rounded-lg transition-all"
              >
                {savingFlag ? "Registering..." : "Register Flag"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
