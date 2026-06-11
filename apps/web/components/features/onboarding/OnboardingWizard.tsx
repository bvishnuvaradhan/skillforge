"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import { Divider } from "../../ui/Divider";
import { ROUTES } from "../../../constants/routes";
import { apiFetch } from "../../../lib/api";
import { ASSESSMENT_QUESTIONS } from "@skillforge/types";

type Goal = "placements" | "competitive" | "dsa" | "interviews";

interface AssessmentAnswer {
  question_id: string;
  answer: string;
}

interface RoadmapStep {
  topic_id: string;
  title: string;
  status: string;
  estimated_days: number;
  mastery_required: number;
}

interface CompleteResponse {
  dlt: {
    overall_mastery: number;
    worlds_unlocked: string[];
  };
  roadmap: {
    steps: RoadmapStep[];
  };
}

export const OnboardingWizard = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form State
  // goal set on backend
  
  // Coding profiles linking state
  const [profiles, setProfiles] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
    github: "",
  });
  const [linkedProfiles, setLinkedProfiles] = useState<Record<string, boolean>>({});

  // Assessment state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAssessmentSkipped, setIsAssessmentSkipped] = useState<boolean>(false);

  // Calibration messages (Step 4)
  const [calibrationMessage, setCalibrationMessage] = useState<string>("Analyzing your profiles...");
  
  // Reveal state (Step 5 & 6)
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);

  // Step 4 Calibration animations
  useEffect(() => {
    if (currentStep !== 4) return;

    const messages = [
      "Analyzing your profiles...",
      "Calibrating your initial knowledge state...",
      "Structuring prerequisites in Knowledge Graph...",
      "Generating personalized roadmap paths...",
      "Synthesizing your Digital Learning Twin...",
    ];
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setCalibrationMessage(messages[msgIndex]!);
      }
    }, 700);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setCurrentStep(5);
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentStep]);

  // Step 1: Submit Goal
  const handleGoalSubmit = async (goal: Goal) => {
    setIsLoading(true);
    try {
      await apiFetch("/onboarding/goal", {
        method: "POST",
        body: JSON.stringify({ goal }),
      });
      setCurrentStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save learning goal";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Link Profile
  const handleLinkProfile = async (platform: string, username: string) => {
    if (!username.trim()) return;
    setIsLoading(true);
    try {
      await apiFetch("/users/me/coding-profiles", {
        method: "POST",
        body: JSON.stringify({ platform, username }),
      });
      setLinkedProfiles(prev => ({ ...prev, [platform]: true }));
      toast.success(`Linked ${platform} profile: ${username}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to link ${platform} profile`;
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Assessment options
  const handleAnswerSelect = (optionText: string) => {
    const activeQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
    if (activeQuestion) {
      setAnswers(prev => ({ ...prev, [activeQuestion.id]: optionText }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAllAnswers();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitAllAnswers = async () => {
    setIsLoading(true);
    try {
      const formattedAnswers: AssessmentAnswer[] = Object.entries(answers).map(([qid, ans]) => ({
        question_id: qid,
        answer: ans,
      }));

      await apiFetch("/onboarding/assessment", {
        method: "POST",
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      setCurrentStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit assessment answers";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAssessment = () => {
    setIsAssessmentSkipped(true);
    setCurrentStep(4);
  };

  // Step 5: Load roadmap data by completing onboarding
  const handleRevealComplete = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<CompleteResponse>("/onboarding/complete", {
        method: "POST",
      });
      setRoadmapSteps(res.data.roadmap.steps);
      setCurrentStep(6);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate your roadmap";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: Enter Dashboard
  const handleEnterDashboard = () => {
    toast.success("Welcome to SkillForge!");
    router.push(ROUTES.DASHBOARD);
    router.refresh();
  };

  return (
    <Card className="w-full max-w-2xl bg-bg-secondary border-border rounded-2xl p-8 shadow-xl">
      {/* Wizard Header Progress Bar */}
      {currentStep <= 3 && (
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs text-text-secondary mb-2">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-cyan transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 1: Goal Selection */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-heading font-extrabold text-text-primary">
              Choose your main learning target
            </h2>
            <p className="text-xs text-text-secondary mt-1.5">
              We will structure your worlds, roadmap nodes, and AI mock interviews based on this goal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <button
              onClick={() => handleGoalSubmit("placements")}
              disabled={isLoading}
              className="flex flex-col text-left p-5 bg-bg-primary/40 hover:bg-[#00B4D8]/5 border border-border hover:border-brand-cyan/40 rounded-xl transition-all duration-300 group"
            >
              <span className="text-sm font-semibold text-text-primary group-hover:text-brand-cyan transition-colors">
                💼 Placements Preparation
              </span>
              <span className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Curated DSA patterns, system design, mock HR/tech rounds, and resume-ready portfolios.
              </span>
            </button>

            <button
              onClick={() => handleGoalSubmit("competitive")}
              disabled={isLoading}
              className="flex flex-col text-left p-5 bg-bg-primary/40 hover:bg-[#00B4D8]/5 border border-border hover:border-brand-cyan/40 rounded-xl transition-all duration-300 group"
            >
              <span className="text-sm font-semibold text-text-primary group-hover:text-brand-cyan transition-colors">
                🏆 Competitive Programming
              </span>
              <span className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Advanced mathematical tricks, codeforces templates, fast I/O, and hard algorithms.
              </span>
            </button>

            <button
              onClick={() => handleGoalSubmit("dsa")}
              disabled={isLoading}
              className="flex flex-col text-left p-5 bg-bg-primary/40 hover:bg-[#00B4D8]/5 border border-border hover:border-brand-cyan/40 rounded-xl transition-all duration-300 group"
            >
              <span className="text-sm font-semibold text-text-primary group-hover:text-brand-cyan transition-colors">
                🧬 DSA Foundations
              </span>
              <span className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                For beginners wanting clean mental models, robust theory, visual runs, and core mastery.
              </span>
            </button>

            <button
              onClick={() => handleGoalSubmit("interviews")}
              disabled={isLoading}
              className="flex flex-col text-left p-5 bg-bg-primary/40 hover:bg-[#00B4D8]/5 border border-border hover:border-brand-cyan/40 rounded-xl transition-all duration-300 group"
            >
              <span className="text-sm font-semibold text-text-primary group-hover:text-brand-cyan transition-colors">
                🚀 Immediate Job Interviews
              </span>
              <span className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Fast-track cheat sheets, active recall cards, coding challenges, and mock loops.
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Link Coding Profiles */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-heading font-extrabold text-text-primary">
              Link your coding profile IDs
            </h2>
            <p className="text-xs text-text-secondary mt-1.5">
              Syncing accounts helps the DLT evaluate your coding solve counts and update your mastery scores.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {/* LeetCode */}
            <div className="flex items-end gap-3">
              <div className="flex-grow">
                <Input
                  label="LeetCode Username"
                  placeholder="e.g. janesmith"
                  value={profiles.leetcode}
                  onChange={e => setProfiles(prev => ({ ...prev, leetcode: e.target.value }))}
                  disabled={linkedProfiles.leetcode || isLoading}
                />
              </div>
              <Button
                variant={linkedProfiles.leetcode ? "secondary" : "outline"}
                disabled={linkedProfiles.leetcode || !profiles.leetcode || isLoading}
                onClick={() => handleLinkProfile("leetcode", profiles.leetcode)}
                className="mb-1"
              >
                {linkedProfiles.leetcode ? "Linked" : "Link"}
              </Button>
            </div>

            {/* Codeforces */}
            <div className="flex items-end gap-3">
              <div className="flex-grow">
                <Input
                  label="Codeforces Handle"
                  placeholder="e.g. tourist"
                  value={profiles.codeforces}
                  onChange={e => setProfiles(prev => ({ ...prev, codeforces: e.target.value }))}
                  disabled={linkedProfiles.codeforces || isLoading}
                />
              </div>
              <Button
                variant={linkedProfiles.codeforces ? "secondary" : "outline"}
                disabled={linkedProfiles.codeforces || !profiles.codeforces || isLoading}
                onClick={() => handleLinkProfile("codeforces", profiles.codeforces)}
                className="mb-1"
              >
                {linkedProfiles.codeforces ? "Linked" : "Link"}
              </Button>
            </div>

            {/* CodeChef */}
            <div className="flex items-end gap-3">
              <div className="flex-grow">
                <Input
                  label="CodeChef Username"
                  placeholder="e.g. chef_smith"
                  value={profiles.codechef}
                  onChange={e => setProfiles(prev => ({ ...prev, codechef: e.target.value }))}
                  disabled={linkedProfiles.codechef || isLoading}
                />
              </div>
              <Button
                variant={linkedProfiles.codechef ? "secondary" : "outline"}
                disabled={linkedProfiles.codechef || !profiles.codechef || isLoading}
                onClick={() => handleLinkProfile("codechef", profiles.codechef)}
                className="mb-1"
              >
                {linkedProfiles.codechef ? "Linked" : "Link"}
              </Button>
            </div>

            {/* GitHub */}
            <div className="flex items-end gap-3">
              <div className="flex-grow">
                <Input
                  label="GitHub Username"
                  placeholder="e.g. dev_jane"
                  value={profiles.github}
                  onChange={e => setProfiles(prev => ({ ...prev, github: e.target.value }))}
                  disabled={linkedProfiles.github || isLoading}
                />
              </div>
              <Button
                variant={linkedProfiles.github ? "secondary" : "outline"}
                disabled={linkedProfiles.github || !profiles.github || isLoading}
                onClick={() => handleLinkProfile("github", profiles.github)}
                className="mb-1"
              >
                {linkedProfiles.github ? "Linked" : "Link"}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(1)} disabled={isLoading}>
              Back
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(3)} disabled={isLoading}>
              Continue to Assessment
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Adaptive Assessment */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-heading font-extrabold text-text-primary">
                Adaptive Diagnostics
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Question {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
              </p>
            </div>
            <button
              onClick={handleSkipAssessment}
              disabled={isLoading}
              className="text-xs text-[#94A3B8] hover:text-[#00B4D8] underline transition-all"
            >
              Skip Assessment
            </button>
          </div>

          {/* Question Render Card */}
          <div className="p-6 bg-bg-primary/20 border border-border/80 rounded-xl flex flex-col gap-4 mt-2">
            <span className="text-xs font-semibold text-brand-cyan tracking-wider uppercase">
              Topic: {ASSESSMENT_QUESTIONS[currentQuestionIndex]?.topic}
            </span>
            <p className="text-sm font-semibold text-text-primary leading-relaxed">
              {ASSESSMENT_QUESTIONS[currentQuestionIndex]?.text}
            </p>
          </div>

          {/* Choices Grid */}
          <div className="grid grid-cols-1 gap-3">
            {ASSESSMENT_QUESTIONS[currentQuestionIndex]?.options.map((opt, idx) => {
              const activeQId = ASSESSMENT_QUESTIONS[currentQuestionIndex]!.id;
              const isSelected = answers[activeQId] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(opt)}
                  disabled={isLoading}
                  className={`w-full p-4 text-left text-sm rounded-xl border transition-all duration-300 active:scale-[0.99] ${
                    isSelected
                      ? "bg-[#00B4D8]/10 border-brand-cyan text-brand-cyan font-semibold shadow-sm"
                      : "bg-bg-primary/40 border-border hover:bg-bg-primary/60 hover:border-brand-cyan/25 text-text-primary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full border text-[10px] font-bold ${
                        isSelected
                          ? "bg-brand-cyan border-brand-cyan text-bg-primary"
                          : "border-text-muted text-text-muted"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(2)} disabled={isLoading}>
                Back Step
              </Button>
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0 || isLoading}
              >
                Previous Question
              </Button>
            </div>
            <Button
              variant="primary"
              onClick={handleNextQuestion}
              disabled={!answers[ASSESSMENT_QUESTIONS[currentQuestionIndex]!.id] || isLoading}
            >
              {currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1 ? "Submit Assessment" : "Next Question"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: DLT Calibration Loader */}
      {currentStep === 4 && (
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-brand-cyan/15 border-t-brand-cyan animate-spin" />
            <div className="absolute inset-2 w-12 h-12 rounded-full border-4 border-accent-purple/15 border-b-accent-purple animate-spin-reverse" />
          </div>

          <div className="text-center flex flex-col gap-2">
            <h3 className="text-lg font-heading font-extrabold text-text-primary tracking-tight">
              Calibrating Digital Twin
            </h3>
            <p className="text-xs text-brand-cyan font-mono animate-pulse min-h-[1.5rem]">
              {calibrationMessage}
            </p>
          </div>
        </div>
      )}

      {/* Step 5: DLT Reveal Screen */}
      {currentStep === 5 && (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <span className="text-[32px] select-none">🧬</span>
            <h2 className="text-xl font-heading font-extrabold text-text-primary mt-2">
              Your Digital Learning Twin is Ready!
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {isAssessmentSkipped
                ? "DltState baseline initialized at zero since diagnostic assessment was skipped."
                : "Initial knowledge graph baseline calculated based on diagnostic answers."}
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Calibrated Baselines
            </span>

            {/* Arrays */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-text-primary mb-1.5 font-mono">
                <span>Arrays & Vectors</span>
                <span>{isAssessmentSkipped ? "0%" : "70%"}</span>
              </div>
              <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-green rounded-full transition-all duration-1000 ease-out"
                  style={{ width: isAssessmentSkipped ? "0%" : "70%" }}
                />
              </div>
            </div>

            {/* Trees */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-text-primary mb-1.5 font-mono">
                <span>Binary Trees & BSTs</span>
                <span>{isAssessmentSkipped ? "0%" : "30%"}</span>
              </div>
              <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-red rounded-full transition-all duration-1000 ease-out"
                  style={{ width: isAssessmentSkipped ? "0%" : "30%" }}
                />
              </div>
            </div>
          </div>

          {/* Unlock Card Banner */}
          <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl flex items-center gap-3.5 mt-2">
            <span className="text-2xl select-none">👑</span>
            <div>
              <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">
                First Unlock!
              </span>
              <p className="text-xs text-text-primary font-semibold mt-0.5">
                Variables Kingdom is unlocked. Enter to begin your journey.
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={handleRevealComplete} isLoading={isLoading}>
              Reveal Personalized Roadmap
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Personalized Roadmap Preview */}
      {currentStep === 6 && (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-heading font-extrabold text-text-primary">
              Your Personalized Learning Roadmap
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              A sequence of learning worlds tailored to reach your target goals.
            </p>
          </div>

          {/* Roadmap Steps list */}
          <div className="flex flex-col gap-3.5 max-h-60 overflow-y-auto pr-2 mt-2">
            {roadmapSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-bg-primary/20 border border-border/80 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-mono ${
                      step.status === "in_progress"
                        ? "bg-brand-cyan text-bg-primary"
                        : "bg-bg-primary border border-border text-text-secondary"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {step.title}
                    </p>
                    <span className="text-[10px] text-text-secondary font-mono">
                      Req: {Math.round(step.mastery_required * 100)}% Mastery
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      step.status === "in_progress"
                        ? "bg-[#00B4D8]/10 text-brand-cyan border border-brand-cyan/20"
                        : "bg-[#1e2b45]/30 text-text-secondary border border-border/50"
                    }`}
                  >
                    {step.status === "in_progress" ? "Active" : "Locked"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Divider />

          {/* Final CTA */}
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-lg"
              onClick={handleEnterDashboard}
            >
              Enter Growth Workspace
            </Button>
            <p className="text-[10px] text-text-secondary">
              By entering, your Digital Learning Twin session becomes active.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
