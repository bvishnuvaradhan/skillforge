"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import { 
  Target, 
  Bot, 
  Award, 
  ArrowRight, 
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Custom SVG icon for LinkedIn (since brand icons are removed in lucide-react v1.x)
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface ReadinessData {
  codingReadiness: number;
  interviewReadiness: number;
  resumeScore: number;
  overallReadiness: number;
  tiers: {
    faang: number;
    product: number;
    startup: number;
    service: number;
  };
}

export default function CareerReadinessHub() {
  const router = useRouter();
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);

  // LinkedIn Bio optimizer states
  const [bioText, setBioText] = useState("");
  const [linkedinResult, setLinkedinResult] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    fetchReadinessData();
  }, []);

  const fetchReadinessData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<ReadinessData>("/career/readiness");
      setData(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load career readiness metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeLinkedIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioText.trim()) return;

    try {
      setOptimizing(true);
      toast.info("Optimizing LinkedIn profile keywords...");
      const res = await apiFetch<any>("/career/linkedin/analyze", {
        method: "POST",
        body: JSON.stringify({ bioText }),
      });
      setLinkedinResult(res.data);
      toast.success("LinkedIn profile suggestions generated!");
    } catch (err: any) {
      toast.error(err.message || "LinkedIn analysis failed");
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 bg-bg-secondary rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-bg-secondary rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-bg-secondary rounded-2xl"></div>
      </div>
    );
  }

  const tiersList = [
    {
      name: "FAANG & Tier-1",
      description: "Google, Meta, Apple, Netflix, Uber, Stripe",
      score: data?.tiers.faang ?? 0,
      color: "from-brand-cyan to-blue-500",
      criteria: "Requires Mastery > 85%, completed DSA assessment & high mock interview scores",
    },
    {
      name: "Product Companies",
      description: "Fast-growing unicorns, Airbnb, Lyft, Coinbase",
      score: data?.tiers.product ?? 0,
      color: "from-accent-purple to-pink-500",
      criteria: "Requires Mastery > 75% & completed mock interview",
    },
    {
      name: "High Growth Startups",
      description: "YCombinator seed/Series-A startups, tech studios",
      score: data?.tiers.startup ?? 0,
      color: "from-accent-orange to-red-500",
      criteria: "Requires Mastery > 70% & project-rich resume",
    },
    {
      name: "IT Services & Solutions",
      description: "TCS, Infosys, Wipro, Accenture, Cognizant",
      score: data?.tiers.service ?? 0,
      color: "from-accent-green to-emerald-500",
      criteria: "Requires Mastery > 60%",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Top Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight font-display bg-gradient-to-r from-brand-cyan to-accent-purple bg-clip-text text-transparent">
          Career & Placement Readiness
        </h1>
        <p className="text-text-secondary mt-2">
          Monitor your suitability across four market segments based on your current coding masteries, exam evaluations, and resume score.
        </p>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Overall Readiness", value: `${data?.overallReadiness}%`, icon: Target, color: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20" },
          { label: "Coding Mastery", value: `${data?.codingReadiness}%`, icon: Award, color: "text-accent-purple bg-accent-purple/10 border-accent-purple/20" },
          { label: "Interview Pacing", value: `${data?.interviewReadiness}%`, icon: Bot, color: "text-accent-green bg-accent-green/10 border-accent-green/20" },
          { label: "ATS Resume Grade", value: `${data?.resumeScore}%`, icon: FileText, color: "text-accent-orange bg-accent-orange/10 border-accent-orange/20" },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-5 flex items-center justify-between shadow-lg bg-bg-secondary ${item.color.split(" ")[2]}`}
          >
            <div>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{item.label}</span>
              <p className="text-3xl font-extrabold text-text-primary font-mono mt-1">{item.value}</p>
            </div>
            <div className={`p-3 rounded-xl border ${item.color.split(" ").slice(0, 2).join(" ")}`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Segment Readiness Tiers */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl space-y-6">
        <h2 className="text-2xl font-bold font-display text-text-primary">Target Placement Suitability</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiersList.map((tier, idx) => (
            <div key={idx} className="bg-bg-elevated border border-border rounded-xl p-5 space-y-4 hover:border-brand-cyan/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-text-primary text-base leading-tight font-display">{tier.name}</h3>
                    <p className="text-xs text-text-muted mt-1 leading-normal">{tier.description}</p>
                  </div>
                  <span className="text-2xl font-extrabold text-text-primary font-mono bg-bg-secondary border border-border px-3 py-1 rounded-lg">
                    {tier.score}%
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-3 italic leading-relaxed border-l-2 border-border/80 pl-2">
                  {tier.criteria}
                </p>
              </div>

              <div className="space-y-1.5 pt-4">
                <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden border border-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tier.score}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full bg-gradient-to-r ${tier.color} rounded-full`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Action Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Card: Dynamic Resume prefill */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-brand-cyan/20 text-brand-cyan rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-text-primary">Prefilled Resume Builder</h3>
                <p className="text-xs text-text-secondary">Prefill verified metrics from DLT State</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Create an ATS-friendly resume dynamically synced with your verified masteries, achievements, and badges. Run the LLM reviewer to get optimization suggestions instantly.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/career/resume")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-cyan to-blue-500 text-bg-primary font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-brand-cyan/30 transition-all text-sm w-full"
          >
            Open Resume Builder
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Right Card: LinkedIn optimizer */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-accent-purple/20 text-accent-purple rounded-xl">
              <LinkedinIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-text-primary">LinkedIn bio Optimizer</h3>
              <p className="text-xs text-text-secondary">SEO keyword matching analyzes</p>
            </div>
          </div>

          <form onSubmit={handleOptimizeLinkedIn} className="space-y-4">
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Paste your current LinkedIn summary/bio text here..."
              rows={3}
              className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-brand-cyan text-sm resize-none"
            />
            
            <motion.button
              whileHover={{ scale: optimizing ? 1 : 1.02 }}
              whileTap={{ scale: optimizing ? 1 : 0.98 }}
              type="submit"
              disabled={optimizing}
              className="flex items-center justify-center gap-2 bg-accent-purple text-text-primary font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all text-sm w-full"
            >
              {optimizing ? "Optimizing Profile..." : "Optimize Summary"}
            </motion.button>
          </form>

          {/* Results Display */}
          {linkedinResult && (
            <div className="mt-6 border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-text-secondary">Visibility Score:</span>
                <span className="text-brand-cyan font-mono">{(linkedinResult.visibilityScore * 100).toFixed(0)}%</span>
              </div>

              <div className="bg-bg-elevated border border-border rounded-xl p-4 text-xs space-y-2">
                <span className="text-[10px] text-accent-purple uppercase tracking-wider block font-bold">
                  Suggested Rewrite
                </span>
                <p className="text-text-primary leading-relaxed whitespace-pre-wrap select-all cursor-pointer bg-bg-secondary p-2.5 rounded border border-border">
                  {linkedinResult.optimizedText}
                </p>
                <span className="text-[9px] text-text-muted block text-right mt-1">Click text box to copy</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
