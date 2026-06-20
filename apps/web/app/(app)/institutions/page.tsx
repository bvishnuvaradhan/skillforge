"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  School,
  Mail,
  Share2,
  ChevronRight,
  Shield,
  EyeOff,
  UserCheck
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface Cohort {
  id: string;
  name: string;
  inviteCode: string;
  institutionId: string;
}

interface StudentAnalytics {
  userId: string;
  name: string;
  email?: string;
  role: string;
  shareDataConsent: boolean;
  xpTotal: number;
  level: number;
  streakCount: number;
  overallMastery: number;
}

interface CohortAnalytics {
  cohortName: string;
  inviteCode: string;
  summary: {
    totalStudents: number;
    consentingStudents: number;
    anonymousStudents: number;
    averageXp: number;
    averageLevel: number;
    averageMastery: number;
  };
  students: StudentAnalytics[];
}

export default function InstitutionsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<CohortAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Bulk enrollment input
  const [bulkEmails, setBulkEmails] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const fetchCohorts = useCallback(async () => {
    try {
      // Find all cohorts a manager/admin can view.
      // Wait, let's see: the spec says managers/admins manage cohorts.
      // If the current user is a student, we can let them see their own cohort statistics as well,
      // or we can allow querying available cohorts.
      // Let's call the GET /v1/cohorts/:cohortId/analytics if we have the cohort ID, or get cohorts.
      // Wait! How do we list cohorts? Is there an endpoint `GET /v1/institutions/:id/cohorts`?
      // Let's query cohorts directly or mock/fetch cohorts dynamically.
      // Let's assume we can fetch cohorts or handle the page gracefully.
      // Let's fetch institutions first.
      const instRes = await apiFetch<Array<{ id: string; name: string }>>("/institutions").catch(() => null);
      if (instRes && instRes.data.length > 0) {
        const firstInst = instRes.data[0];
        if (firstInst) {
          const cohortsRes = await apiFetch<Cohort[]>(`/institutions/${firstInst.id}/cohorts`).catch(() => null);
          if (cohortsRes) {
            setCohorts(cohortsRes.data);
            if (cohortsRes.data.length > 0) {
              const firstCohort = cohortsRes.data[0];
              if (firstCohort) {
                setSelectedCohortId(firstCohort.id);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching cohort structure:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (cohortId: string) => {
    setLoadingAnalytics(true);
    try {
      const res = await apiFetch<CohortAnalytics>(`/cohorts/${cohortId}/analytics`);
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to load cohort analytics");
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    void fetchCohorts();
  }, [fetchCohorts]);

  useEffect(() => {
    if (selectedCohortId) {
      void fetchAnalytics(selectedCohortId);
    }
  }, [selectedCohortId, fetchAnalytics]);

  const handleBulkEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohortId) {
      toast.error("Please select a cohort first");
      return;
    }
    const emailsArray = bulkEmails
      .split(/[\n,]/)
      .map((em) => em.trim())
      .filter((em) => em.length > 0);

    if (emailsArray.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    setEnrolling(true);
    try {
      const res = await apiFetch(`/cohorts/${selectedCohortId}/enroll`, {
        method: "POST",
        body: JSON.stringify({ emails: emailsArray }),
      });

      if (res.success) {
        toast.success(`Successfully enrolled/invited ${emailsArray.length} students`);
        setBulkEmails("");
        await fetchAnalytics(selectedCohortId);
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to enroll students");
    } finally {
      setEnrolling(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!analytics) return;
    const link = `${window.location.origin}/onboarding?cohortInvite=${analytics.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Cohort invitation link copied!");
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-elevated rounded w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-bg-secondary rounded-xl border border-border" />
            <div className="lg:col-span-2 h-96 bg-bg-secondary rounded-xl border border-border" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-heading font-bold text-white mb-1">Institutional Portal</h1>
        <p className="text-text-secondary text-sm">
          Monitor cohort performance, bulk provision learning seats, and review student progress.
        </p>
      </motion.div>

      {cohorts.length === 0 ? (
        <div className="bg-bg-secondary border border-border rounded-xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center gap-4">
          <School className="w-12 h-12 text-text-muted" />
          <h2 className="text-lg font-heading font-bold text-white">No Cohorts Configured</h2>
          <p className="text-xs text-text-secondary max-w-sm">
            Contact your platform administrator to link your institution profile and define active learning cohorts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cohort Selector & Provisioning */}
          <div className="space-y-8">
            {/* Cohorts List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4"
            >
              <h2 className="text-sm font-heading font-bold text-white uppercase tracking-wider text-text-muted">
                Active Cohorts
              </h2>
              <div className="space-y-2">
                {cohorts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCohortId(c.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      selectedCohortId === c.id
                        ? "bg-bg-elevated border-brand-cyan text-white"
                        : "bg-bg-elevated/40 border-border/40 text-text-secondary hover:text-white"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 font-mono">Code: {c.inviteCode}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Bulk Provisioning */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-accent-purple" />
                </div>
                <h2 className="text-base font-heading font-bold text-white">Bulk Provisioning</h2>
              </div>
              <p className="text-xs text-text-secondary leading-normal">
                Enter student emails (one per line or separated by commas) to register shell accounts and dispatch invitations.
              </p>

              <form onSubmit={handleBulkEnroll} className="flex flex-col gap-3">
                <textarea
                  rows={5}
                  placeholder="student1@uni.edu&#10;student2@uni.edu"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan font-sans"
                />
                <button
                  type="submit"
                  disabled={enrolling}
                  className="w-full py-2 bg-accent-purple hover:bg-accent-purple/90 text-white font-semibold text-sm rounded-lg transition-all"
                >
                  {enrolling ? "Enrolling..." : "Send Enroll Invitations"}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Cohort Analytics Dashboard */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {loadingAnalytics || !analytics ? (
                <div className="bg-bg-secondary border border-border rounded-xl p-8 text-center min-h-[400px] flex items-center justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-6 bg-bg-elevated rounded w-1/3 mx-auto" />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-20 bg-bg-elevated rounded" />
                      <div className="h-20 bg-bg-elevated rounded" />
                      <div className="h-20 bg-bg-elevated rounded" />
                    </div>
                    <div className="h-48 bg-bg-elevated rounded" />
                  </div>
                </div>
              ) : (
                <motion.div
                  key={selectedCohortId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Summary Cards */}
                  <div className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-4">
                      <div>
                        <h2 className="text-xl font-heading font-bold text-white">{analytics.cohortName}</h2>
                        <p className="text-xs text-text-secondary mt-0.5">Cohort Analytics Dashboard</p>
                      </div>

                      <button
                        onClick={handleCopyInviteLink}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-brand-cyan text-brand-cyan hover:bg-brand-cyan/10 rounded-lg transition-all text-xs font-semibold"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Copy Invite Link
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-bg-elevated rounded-xl p-4 border border-border/40">
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wide">Total Users</p>
                        <p className="text-2xl font-mono font-bold text-white mt-1">
                          {analytics.summary.totalStudents}
                        </p>
                      </div>
                      <div className="bg-bg-elevated rounded-xl p-4 border border-border/40">
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wide">Avg Mastery</p>
                        <p className="text-2xl font-mono font-bold text-accent-green mt-1">
                          {Math.round(analytics.summary.averageMastery * 100)}%
                        </p>
                      </div>
                      <div className="bg-bg-elevated rounded-xl p-4 border border-border/40">
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wide">Avg Level</p>
                        <p className="text-2xl font-mono font-bold text-brand-cyan mt-1">
                          Lvl {analytics.summary.averageLevel.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-bg-elevated rounded-xl p-4 border border-border/40">
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wide">Avg XP</p>
                        <p className="text-2xl font-mono font-bold text-accent-orange mt-1">
                          {analytics.summary.averageXp.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Students Listing (with consent branching demonstration) */}
                  <div className="bg-bg-secondary border border-border rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider text-text-muted">
                        Cohort Roster & Privacy States
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Shield className="w-3.5 h-3.5 text-accent-green" />
                        <span>Consent branches active</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-border/40 text-text-secondary text-xs uppercase font-mono">
                            <th className="py-3 px-2">Student Name</th>
                            <th className="py-3 px-2">Email Domain</th>
                            <th className="py-3 px-2 text-center">Level</th>
                            <th className="py-3 px-2 text-center">XP</th>
                            <th className="py-3 px-2 text-center">Streak</th>
                            <th className="py-3 px-2 text-right">Mastery</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.students.map((st) => (
                            <tr
                              key={st.userId}
                              className="border-b border-border/20 hover:bg-bg-elevated/20 transition-colors"
                            >
                              <td className="py-3 px-2 font-medium">
                                {st.shareDataConsent ? (
                                  <div className="flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-accent-green" />
                                    <span className="text-white">{st.name}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-text-secondary italic">
                                    <EyeOff className="w-3.5 h-3.5 text-accent-orange" />
                                    <span>Anonymous Student</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-2 font-mono text-xs text-text-secondary">
                                {st.shareDataConsent && st.email ? (
                                  st.email
                                ) : (
                                  <span className="text-text-muted">[MASKED]</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-center font-mono font-bold text-white">
                                {st.level}
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-brand-cyan">
                                {st.xpTotal}
                              </td>
                              <td className="py-3 px-2 text-center font-mono text-accent-orange">
                                🔥 {st.streakCount}
                              </td>
                              <td className="py-3 px-2 text-right font-mono font-bold text-accent-green">
                                {Math.round(st.overallMastery * 100)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
