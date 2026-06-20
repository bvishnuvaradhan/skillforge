"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import { 
  FileText, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Exam {
  id: string;
  title: string;
  description: string;
  category: "adaptive" | "full_dsa" | "competitive" | "company";
  durationMinutes: number;
  totalQuestions: number;
}

interface Attempt {
  id: string;
  examId: string;
  examType: string;
  score: number | null;
  passed: boolean;
  timeSeconds: number | null;
  submittedAt: string;
}

export default function ExamsCatalog() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExamsData();
  }, []);

  const fetchExamsData = async () => {
    try {
      setLoading(true);
      const [exRes, attRes] = await Promise.all([
        apiFetch<Exam[]>("/exams"),
        apiFetch<Attempt[]>("/exams/history"),
      ]);
      setExams(exRes.data);
      setAttempts(attRes.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId: string) => {
    try {
      setStartingId(examId);
      toast.info("Preparing exam room. Please wait...");
      const res = await apiFetch<{ attemptId: string }>(`/exams/${examId}/start`, {
        method: "POST",
      });
      toast.success("Exam started! Good luck.");
      router.push(`/exams/${res.data.attemptId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to start exam");
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Top Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight font-display bg-gradient-to-r from-brand-cyan to-accent-purple bg-clip-text text-transparent">
          Exams & Assessments
        </h1>
        <p className="text-text-secondary mt-2">
          Test your conceptual depth and problem-solving speed. Complete adaptive assessments to directly increment your DLT scores.
        </p>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-bg-secondary animate-pulse rounded-2xl border border-border"></div>
          ))
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-bg-secondary border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-brand-cyan/40 transition-all shadow-2xl relative overflow-hidden"
            >
              {exam.category === "adaptive" && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-brand-cyan to-accent-purple text-bg-primary font-bold text-[9px] px-3 py-1 uppercase tracking-wider rounded-bl-xl shadow-md">
                  Adaptive
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold font-display text-text-primary mb-2 leading-tight">
                  {exam.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  {exam.description}
                </p>

                <div className="flex gap-4 mb-6">
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock className="w-4 h-4" />
                    {exam.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <FileText className="w-4 h-4" />
                    {exam.totalQuestions} Questions
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartExam(exam.id)}
                disabled={startingId !== null}
                className="w-full flex items-center justify-center gap-2 bg-bg-elevated border border-border text-text-primary hover:border-brand-cyan hover:text-brand-cyan font-bold py-3 px-6 rounded-xl transition-all text-xs"
              >
                {startingId === exam.id ? "Initializing..." : "Start Assessment"}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          ))
        )}
      </div>

      {/* Attempts History */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold font-display text-text-primary mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-accent-purple" />
          Attempt History
        </h2>

        {loading ? (
          <div className="space-y-4">
            <div className="h-16 bg-bg-elevated animate-pulse rounded-xl"></div>
          </div>
        ) : attempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
            <AlertCircle className="w-8 h-8 text-text-muted mb-2" />
            <p className="text-text-secondary text-sm">No exam attempts recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-4 bg-bg-elevated border border-border rounded-xl"
              >
                <div>
                  <h4 className="font-semibold text-text-primary capitalize">
                    {att.examType.replace("_", " ")} Assessment
                  </h4>
                  <p className="text-xs text-text-muted mt-1">
                    Submitted: {new Date(att.submittedAt).toLocaleDateString()}
                    {att.timeSeconds && ` | Duration: ${Math.round(att.timeSeconds / 60)}m`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase block text-right">Score</span>
                    <p className="font-bold font-mono text-sm text-text-primary">
                      {att.score !== null ? `${(att.score * 100).toFixed(0)}%` : "N/A"}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    att.passed ? "bg-accent-green/20 text-accent-green" : "bg-accent-red/20 text-accent-red"
                  }`}>
                    {att.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
