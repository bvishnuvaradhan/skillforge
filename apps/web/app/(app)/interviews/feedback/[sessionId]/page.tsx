"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../../lib/api";
import { 
  Award, 
  Bot, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface FeedbackData {
  session: {
    id: string;
    interviewType: string;
    targetCompany: string | null;
    status: string;
    createdAt: string;
  };
  feedback: {
    id: string;
    technicalScore: number;
    problemSolvingScore: number;
    communicationScore: number;
    confidenceScore: number;
    overallScore: number;
    strengths: string;
    improvements: string;
    nextSteps: string;
    recommendation: string;
    createdAt: string;
  };
}

export default function InterviewFeedbackReport() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchFeedbackReport();
    }
  }, [sessionId]);

  const fetchFeedbackReport = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<FeedbackData>(`/interviews/${sessionId}/feedback`);
      setData(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load feedback report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-10 bg-bg-secondary animate-pulse rounded-lg w-1/3"></div>
        <div className="h-64 bg-bg-secondary animate-pulse rounded-2xl"></div>
        <div className="h-44 bg-bg-secondary animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  if (!data || !data.feedback) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-accent-orange mx-auto" />
        <h2 className="text-xl font-bold text-text-primary font-display">No Feedback Report</h2>
        <p className="text-sm text-text-secondary">
          No feedback has been computed for this interview session. Ensure it was completed successfully.
        </p>
        <button
          onClick={() => router.push("/interviews")}
          className="bg-brand-cyan text-bg-primary font-bold text-xs py-2.5 px-4 rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { feedback, session } = data;

  const scoreMetrics = [
    { label: "Technical Competency", score: feedback.technicalScore, color: "from-brand-cyan to-blue-500" },
    { label: "Problem Decomposition", score: feedback.problemSolvingScore, color: "from-accent-purple to-pink-500" },
    { label: "Communication Closeness", score: feedback.communicationScore, color: "from-accent-green to-emerald-500" },
    { label: "Confidence & Articulation", score: feedback.confidenceScore, color: "from-accent-orange to-red-500" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/interviews")}
            className="text-text-secondary hover:text-text-primary p-2 bg-bg-secondary rounded-xl border border-border"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">
              Interview Evaluation Report
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Category: <span className="capitalize">{session.interviewType}</span>
              {session.targetCompany && ` | Target: ${session.targetCompany}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Feedback report link copied!");
          }}
          className="flex items-center gap-2 border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
        >
          <Share2 className="w-4 h-4" />
          Share Report
        </button>
      </div>

      {/* Main Score Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Circle */}
        <div className="md:col-span-1 bg-bg-secondary border border-border rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/10 rounded-full blur-xl"></div>
          <Award className="w-10 h-10 text-brand-cyan mb-2" />
          <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider">Overall Score</h3>
          <p className="text-5xl font-extrabold text-text-primary font-mono mt-4">
            {(feedback.overallScore * 100).toFixed(0)}%
          </p>
          <span className="text-[10px] bg-accent-green/20 text-accent-green font-bold px-2 py-0.5 rounded-full mt-3 uppercase tracking-wider">
            {feedback.recommendation.replace('_', ' ')}
          </span>
        </div>

        {/* Detailed Metrics Bars */}
        <div className="md:col-span-2 bg-bg-secondary border border-border rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-2">Evaluation Breakdown</h3>
          <div className="space-y-4">
            {scoreMetrics.map((metric, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text-secondary">{metric.label}</span>
                  <span className="text-text-primary font-mono">{(metric.score * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden border border-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score * 100}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Strengths, Improvements, Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths & Positives */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold font-display text-accent-green flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Key Strengths
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {feedback.strengths}
          </p>
        </div>

        {/* Suggested Improvements */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold font-display text-accent-orange flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Areas for Improvement
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {feedback.improvements}
          </p>
        </div>
      </div>

      {/* Recommended Roadmap/Next Steps */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-xl"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-accent-purple/20 text-accent-purple rounded-xl border border-accent-purple/30">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-text-primary">Recommended Next Steps</h3>
            <p className="text-xs text-text-secondary">AI-personalized placement roadmap suggestions</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line pl-2 border-l-2 border-accent-purple">
          {feedback.nextSteps}
        </p>
      </div>
    </div>
  );
}
