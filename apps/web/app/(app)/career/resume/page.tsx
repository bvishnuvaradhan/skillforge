"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";
import { 
  FileText, 
  ChevronLeft, 
  Sparkles, 
  Award, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  TrendingUp, 
  FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Resume {
  id: string;
  name: string;
  template: "ats" | "product" | "fresher" | "experienced";
  content: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      github: string;
      linkedin: string;
    };
    skills: string[];
    experience: Array<{
      role: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      school: string;
      duration: string;
      details: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
    }>;
    achievements: string[];
  };
  scores: Array<{
    overallScore: number;
    atsScore: number;
    technicalScore: number;
    projectScore: number;
    completenessScore: number;
    interviewReadinessScore: number;
    suggestions: string[];
  }>;
}

export default function ResumeBuilder() {
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    fetchOrCreateResume();
  }, []);

  const fetchOrCreateResume = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<Resume[]>("/resumes");
      if (res.data.length > 0) {
        setResume(res.data[0] ?? null);
      } else {
        // Create prefilled resume
        const newResume = await apiFetch<Resume>("/resumes", {
          method: "POST",
          body: JSON.stringify({ template: "ats", name: "My Prefilled ATS Resume" }),
        });
        setResume(newResume.data);
        toast.success("Successfully generated a resume pre-filled from your DLT profile!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load resume");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResume = async () => {
    if (!resume) return;

    try {
      setSaving(true);
      await apiFetch(`/resumes/${resume.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: resume.name,
          template: resume.template,
          content: resume.content,
        }),
      });
      toast.success("Resume saved successfully!");
      fetchOrCreateResume();
    } catch (err: any) {
      toast.error(err.message || "Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const handleScoreResume = async () => {
    if (!resume) return;

    try {
      setScoring(true);
      toast.info("Analyzing resume content across 6 dimensions...");
      const res = await apiFetch<any>(`/resumes/${resume.id}/score`, {
        method: "POST",
      });
      toast.success("Scoring complete!");
      fetchOrCreateResume();
    } catch (err: any) {
      toast.error(err.message || "Failed to grade resume");
    } finally {
      setScoring(false);
    }
  };

  // Form helpers
  const handlePersonalInfoChange = (field: string, value: string) => {
    if (!resume) return;
    setResume({
      ...resume,
      content: {
        ...resume.content,
        personalInfo: {
          ...resume.content.personalInfo,
          [field]: value,
        },
      },
    });
  };

  const handleTemplateChange = (template: "ats" | "product" | "fresher" | "experienced") => {
    if (!resume) return;
    setResume({ ...resume, template });
  };

  const handleSkillsChange = (val: string) => {
    if (!resume) return;
    setResume({
      ...resume,
      content: {
        ...resume.content,
        skills: val.split(",").map((s) => s.trim()).filter(Boolean),
      },
    });
  };

  // Printing Trigger
  const handlePrint = () => {
    window.print();
  };

  if (loading || !resume) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-10 bg-bg-secondary animate-pulse rounded-lg w-1/3"></div>
        <div className="h-96 bg-bg-secondary animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  const latestScore = resume.scores?.[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 screen-only">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/career")}
            className="text-text-secondary hover:text-text-primary p-2 bg-bg-secondary rounded-xl border border-border"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">Resume Builder & Reviewer</h1>
            <p className="text-xs text-text-secondary mt-1">
              Currently editing: <span className="text-brand-cyan font-semibold">{resume.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={resume.template}
            onChange={(e) => handleTemplateChange(e.target.value as any)}
            className="bg-bg-secondary border border-border text-text-primary rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-cyan"
          >
            <option value="ats">ATS Classic Template</option>
            <option value="product">Product Designer Template</option>
            <option value="fresher">Fresher Resume Layout</option>
            <option value="experienced">Senior Engineering Template</option>
          </select>

          <button
            onClick={handleSaveResume}
            disabled={saving}
            className="flex items-center gap-2 bg-bg-secondary border border-border text-text-primary font-semibold text-xs py-2.5 px-4 rounded-xl hover:bg-bg-elevated transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Resume"}
          </button>

          <button
            onClick={handleScoreResume}
            disabled={scoring}
            className="flex items-center gap-2 bg-accent-purple text-text-primary font-bold text-xs py-2.5 px-4 rounded-xl hover:scale-105 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            {scoring ? "Scoring..." : "Check ATS Score"}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-brand-cyan text-bg-primary font-bold text-xs py-2.5 px-4 rounded-xl hover:scale-105 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print PDF
          </button>
        </div>
      </div>

      {/* Editor & Scorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Form Editor (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold font-display text-text-primary mb-6 flex items-center gap-2 border-b border-border pb-3">
            <FileText className="w-5 h-5 text-brand-cyan" />
            Resume Content Editor
          </h2>

          <div className="space-y-6">
            
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resume.content.personalInfo.name}
                    onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                    className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    value={resume.content.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                    className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1">Phone</label>
                  <input
                    type="text"
                    value={resume.content.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                    className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase block mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={resume.content.personalInfo.github}
                    onChange={(e) => handlePersonalInfoChange("github", e.target.value)}
                    className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Skills & Expertise</h3>
              <div>
                <label className="text-[10px] text-text-muted uppercase block mb-1">Skills (Comma Separated)</label>
                <input
                  type="text"
                  defaultValue={resume.content.skills.join(", ")}
                  onBlur={(e) => handleSkillsChange(e.target.value)}
                  placeholder="e.g. Arrays, Recursion, Python, NestJS"
                  className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            {/* Experience (Simplified) */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Experience</h3>
              {resume.content.experience.map((exp, idx) => (
                <div key={idx} className="bg-bg-elevated border border-border rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Role"
                      value={exp.role}
                      onChange={(e) => {
                        const newExp = [...resume.content.experience];
                        newExp[idx].role = e.target.value;
                        setResume({ ...resume, content: { ...resume.content, experience: newExp } });
                      }}
                      className="bg-bg-secondary border border-border text-text-primary rounded-lg px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...resume.content.experience];
                        newExp[idx].company = e.target.value;
                        setResume({ ...resume, content: { ...resume.content, experience: newExp } });
                      }}
                      className="bg-bg-secondary border border-border text-text-primary rounded-lg px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={exp.duration}
                      onChange={(e) => {
                        const newExp = [...resume.content.experience];
                        newExp[idx].duration = e.target.value;
                        setResume({ ...resume, content: { ...resume.content, experience: newExp } });
                      }}
                      className="bg-bg-secondary border border-border text-text-primary rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <textarea
                    placeholder="Description of accomplishments..."
                    rows={3}
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...resume.content.experience];
                      newExp[idx].description = e.target.value;
                      setResume({ ...resume, content: { ...resume.content, experience: newExp } });
                    }}
                    className="w-full bg-bg-secondary border border-border text-text-primary rounded-lg px-3 py-2 text-xs resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: ATS Score Dashboard (1 Col) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Dashboard Gauges */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/10 rounded-full blur-xl"></div>
            <h2 className="text-lg font-bold font-display text-text-primary mb-6 flex items-center gap-2 border-b border-border pb-3">
              <FileCheck className="w-5 h-5 text-accent-purple" />
              ATS Scorer Panel
            </h2>

            {latestScore ? (
              <div className="space-y-6">
                <div className="text-center py-4 bg-bg-elevated border border-border rounded-xl relative">
                  <span className="text-xs text-text-secondary uppercase block font-semibold">Overall ATS Grade</span>
                  <p className="text-4xl font-extrabold text-text-primary font-mono mt-2">
                    {(latestScore.overallScore * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Technical Keyword Match", val: latestScore.technicalScore },
                    { label: "ATS Formatting", val: latestScore.atsScore },
                    { label: "Project Bullet Impact", val: latestScore.projectScore },
                    { label: "Resume Completeness", val: latestScore.completenessScore },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="text-text-primary font-mono">{(item.val * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-accent-purple rounded-full"
                          style={{ width: `${item.val * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestions List */}
                {latestScore.suggestions.length > 0 && (
                  <div className="border-t border-border pt-4 mt-4 space-y-3">
                    <h4 className="text-xs font-bold text-accent-orange flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Actionable Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {latestScore.suggestions.map((sug, i) => (
                        <li key={i} className="text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                          <span className="text-accent-purple font-bold">•</span>
                          {sug}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="w-8 h-8 text-text-muted mb-2 animate-bounce" />
                <p className="text-xs text-text-secondary">
                  Click check ATS Score to grade your resume and get bullet suggestions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Print stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .screen-only, header, nav, sidebar, main > *:not(.print-root) {
            display: none !important;
          }
          .print-root {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}</style>

    </div>
  );
}
