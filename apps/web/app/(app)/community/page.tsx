"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Trophy,
  UserPlus,
  ShieldAlert,
  Flame,
  Globe,
  School,
  Copy,
  Plus
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface TeamMember {
  userId: string;
  name: string;
  role: string;
  streakCount: number;
  xpTotal: number;
  level: number;
  overallMastery: number;
}

interface TeamData {
  id: string;
  name: string;
  inviteCode: string;
  members: TeamMember[];
}

interface LeaderboardUser {
  userId: string;
  name: string;
  streakCount: number;
  xpTotal: number;
  level: number;
}

interface LeaderboardData {
  global: LeaderboardUser[];
  cohort: LeaderboardUser[];
}

export default function CommunityPage() {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [hasTeam, setHasTeam] = useState<boolean>(false);
  const [leaderboardTab, setLeaderboardTab] = useState<"global" | "cohort">("global");
  const [leaderboards, setLeaderboards] = useState<LeaderboardData>({ global: [], cohort: [] });
  const [loading, setLoading] = useState<boolean>(true);

  // Forms states
  const [newTeamName, setNewTeamName] = useState("");
  const [joinInviteCode, setJoinInviteCode] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);

  // Report Modal states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTargetType, setReportTargetType] = useState<"USER" | "MENTOR_PROFILE" | "INTERVIEW_SESSION">("USER");
  const [reportTargetId, setReportTargetId] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchCommunityData = useCallback(async () => {
    try {
      const [teamRes, leaderRes] = await Promise.all([
        apiFetch<{ hasTeam: boolean; data: TeamData | null }>("/community/teams/me").catch(() => null),
        apiFetch<LeaderboardData>("/community/leaderboards").catch(() => null),
      ]);

      if (teamRes) {
        setHasTeam(teamRes.data.hasTeam);
        setTeam(teamRes.data.data);
      }
      if (leaderRes) {
        setLeaderboards(leaderRes.data);
      }
    } catch (error) {
      console.error("Community data error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCommunityData();
  }, [fetchCommunityData]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setCreatingTeam(true);
    try {
      const res = await apiFetch<TeamData>("/community/teams", {
        method: "POST",
        body: JSON.stringify({ name: newTeamName }),
      });

      if (res.success) {
        toast.success("Team created successfully!");
        setNewTeamName("");
        await fetchCommunityData();
      }
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to create team");
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInviteCode.trim()) return;

    setJoiningTeam(true);
    try {
      const res = await apiFetch<TeamData>("/community/teams/join", {
        method: "POST",
        body: JSON.stringify({ inviteCode: joinInviteCode }),
      });

      if (res.success) {
        toast.success("Joined team successfully!");
        setJoinInviteCode("");
        await fetchCommunityData();
      }
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to join team");
    } finally {
      setJoiningTeam(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (!team) return;
    navigator.clipboard.writeText(team.inviteCode);
    toast.success("Invite code copied to clipboard!");
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetId.trim() || !reportReason.trim()) {
      toast.error("Please fill in all report fields");
      return;
    }

    setSubmittingReport(true);
    try {
      const res = await apiFetch("/community/reports", {
        method: "POST",
        body: JSON.stringify({
          targetType: reportTargetType,
          targetId: reportTargetId,
          reason: reportReason,
        }),
      });

      if (res.success) {
        toast.success("Report submitted successfully for review");
        setReportTargetId("");
        setReportReason("");
        setIsReportOpen(false);
      }
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-elevated rounded w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-bg-secondary rounded-xl border border-border" />
            <div className="h-96 bg-bg-secondary rounded-xl border border-border" />
          </div>
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
          <h1 className="text-3xl font-heading font-bold text-white mb-1">Community Hub</h1>
          <p className="text-text-secondary text-sm">
            Collaborate in study teams, climb the competitive leaderboards, and support platform integrity.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsReportOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-accent-red/30 hover:border-accent-red bg-accent-red/10 hover:bg-accent-red/20 text-accent-red rounded-lg transition-all text-sm font-semibold"
        >
          <ShieldAlert className="w-4 h-4" />
          Flag a Violation
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Team Section */}
        <div className="lg:col-span-2 space-y-8">
          {hasTeam && team ? (
            /* Active Team Dashboard */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold text-white">{team.name}</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Study Team</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-bg-elevated px-3 py-1.5 rounded-lg border border-border font-mono text-xs">
                  <span className="text-text-muted">Invite:</span>
                  <span className="text-white font-bold">{team.inviteCode}</span>
                  <button
                    onClick={handleCopyInviteCode}
                    className="text-brand-cyan hover:text-white transition-colors ml-1"
                    title="Copy Invite Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-4">
                <h3 className="text-xs text-text-muted uppercase font-bold tracking-wider">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.members.map((m) => (
                    <div
                      key={m.userId}
                      className="p-4 bg-bg-elevated rounded-xl border border-border hover:border-brand-cyan/10 transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate max-w-[150px]">{m.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-accent-purple/20 text-accent-purple border border-accent-purple/25">
                          {m.role}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-bg-secondary rounded p-1.5">
                          <p className="text-[9px] text-text-secondary uppercase">Level</p>
                          <p className="font-mono font-bold text-white mt-0.5">{m.level}</p>
                        </div>
                        <div className="bg-bg-secondary rounded p-1.5">
                          <p className="text-[9px] text-text-secondary uppercase">XP</p>
                          <p className="font-mono font-bold text-brand-cyan mt-0.5">{m.xpTotal}</p>
                        </div>
                        <div className="bg-bg-secondary rounded p-1.5">
                          <p className="text-[9px] text-text-secondary uppercase">Streak</p>
                          <p className="font-mono font-bold text-accent-orange mt-0.5">🔥 {m.streakCount}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] text-text-muted mb-1">
                          <span>Mastery</span>
                          <span>{Math.round(m.overallMastery * 100)}%</span>
                        </div>
                        <div className="w-full bg-bg-secondary rounded-full h-1">
                          <div
                            className="bg-accent-green h-1 rounded-full"
                            style={{ width: `${Math.round(m.overallMastery * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Forms to Create or Join a Team */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Team Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col justify-between min-h-[250px]"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-accent-purple" />
                  </div>
                  <h2 className="text-lg font-heading font-bold text-white">Create a Team</h2>
                  <p className="text-xs text-text-secondary leading-normal">
                    Form a study team with friends. Enforce a one active team per user policy.
                  </p>
                </div>

                <form onSubmit={handleCreateTeam} className="mt-6 flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Team Name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan font-sans"
                  />
                  <button
                    type="submit"
                    disabled={creatingTeam}
                    className="w-full py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-bg-primary font-semibold text-sm rounded-lg transition-all"
                  >
                    {creatingTeam ? "Creating..." : "Create Team"}
                  </button>
                </form>
              </motion.div>

              {/* Join Team Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col justify-between min-h-[250px]"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <h2 className="text-lg font-heading font-bold text-white">Join a Team</h2>
                  <p className="text-xs text-text-secondary leading-normal">
                    Enter a secure invite code from an existing team to join their board.
                  </p>
                </div>

                <form onSubmit={handleJoinTeam} className="mt-6 flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Invite Code"
                    value={joinInviteCode}
                    onChange={(e) => setJoinInviteCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan font-mono"
                  />
                  <button
                    type="submit"
                    disabled={joiningTeam}
                    className="w-full py-2 border border-brand-cyan text-brand-cyan hover:bg-brand-cyan/10 font-semibold text-sm rounded-lg transition-all"
                  >
                    {joiningTeam ? "Joining..." : "Join Team"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </div>

        {/* Right Column: Standings Leaderboard */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-6"
          >
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-orange/20 border border-accent-orange/30 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-accent-orange" />
                </div>
                <h2 className="text-lg font-heading font-bold text-white">Standings</h2>
              </div>
            </div>

            {/* Standings Tab Buttons */}
            <div className="flex bg-bg-elevated p-1 rounded-lg border border-border">
              <button
                onClick={() => setLeaderboardTab("global")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  leaderboardTab === "global" ? "bg-bg-secondary text-white font-bold" : "text-text-secondary hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Global
              </button>
              <button
                onClick={() => setLeaderboardTab("cohort")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  leaderboardTab === "cohort" ? "bg-bg-secondary text-white font-bold" : "text-text-secondary hover:text-white"
                }`}
              >
                <School className="w-3.5 h-3.5" />
                Cohort
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-3">
              {leaderboards[leaderboardTab].length === 0 ? (
                <p className="text-text-muted text-xs text-center py-8">No leaderboard data found</p>
              ) : (
                leaderboards[leaderboardTab].map((u, index) => (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between p-3 bg-bg-elevated/40 border border-border/40 rounded-lg hover:border-brand-cyan/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-mono font-bold text-text-secondary">
                        {index + 1}.
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{u.name}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-text-muted font-mono">
                          <span>Level {u.level}</span>
                          <span>•</span>
                          <span>{u.xpTotal} XP</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-accent-orange font-mono font-bold">
                      <Flame className="w-3.5 h-3.5" />
                      {u.streakCount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Moderation Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2 text-accent-red">
                  <ShieldAlert className="w-5 h-5" />
                  <h2 className="text-lg font-heading font-bold text-white">Flag a Violation</h2>
                </div>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="text-text-muted hover:text-white transition-colors font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4">
                <div>
                  <label className="block text-xs text-text-secondary uppercase font-bold tracking-wider mb-1.5">
                    Target Type
                  </label>
                  <select
                    value={reportTargetType}
                    onChange={(e) => setReportTargetType(e.target.value as "USER" | "MENTOR_PROFILE" | "INTERVIEW_SESSION")}
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="USER">User / Student Profile</option>
                    <option value="MENTOR_PROFILE">Mentor Profile</option>
                    <option value="INTERVIEW_SESSION">Interview Session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-text-secondary uppercase font-bold tracking-wider mb-1.5">
                    Target Entity ID (UUID)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter the UUID of the target"
                    value={reportTargetId}
                    onChange={(e) => setReportTargetId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-text-secondary uppercase font-bold tracking-wider mb-1.5">
                    Violation Reason / Context
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe the violation in detail..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan font-sans"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="flex-1 py-2 border border-border text-text-secondary hover:text-white rounded-lg transition-all text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="flex-1 py-2 bg-accent-red hover:bg-accent-red/90 text-white rounded-lg transition-all text-sm font-semibold"
                  >
                    {submittingReport ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
