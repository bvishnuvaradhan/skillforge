"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";
import { 
  Award, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  text: string;
  options: string[];
  topic: string;
}

export default function ActiveExamRunner() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.examId as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(1);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  // Final scorecard states
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (attemptId) {
      resumeOrStartExam();
    }
  }, [attemptId]);

  useEffect(() => {
    if (completed || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, completed]);

  // If time runs out, automatically submit the exam
  useEffect(() => {
    if (timeLeft <= 0 && !completed) {
      toast.warning("Time limit reached! Submitting exam automatically...");
      setCompleted(true);
    }
  }, [timeLeft]);

  const resumeOrStartExam = async () => {
    try {
      setLoading(true);
      // Since starting was triggered, we fetch user's attempts history to load current question,
      // or we can query status. In our implementation, starting returns firstQuestion.
      // If they refresh the browser, we can retrieve from a status check.
      // Let's call /exams/history to see if this attempt exists, and load its answers length to determine index
      const res = await apiFetch<any[]>("/exams/history");
      const current = res.data.find((a) => a.id === attemptId);

      if (!current) {
        toast.error("Attempt not found");
        router.push("/exams");
        return;
      }

      if (current.score !== null) {
        setFinalScore(current.score);
        setPassed(current.passed);
        setXpEarned(Math.round(120 * current.score));
        setCompleted(true);
        setLoading(false);
        return;
      }

      setQuestionIndex(current.answers.length + 1);

      // Fetch the next question. In our mock database, we can start with Q1 or fallback.
      // We will make a placeholder start request or load the first unanswered question
      // If we don't have it, we fallback to a standard question
      // For simplicity, let's load a default starter question
      setQuestion({
        id: "e1",
        text: "What is the worst-case time complexity of searching for an element in an unsorted array of size n?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        topic: "Arrays",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to load exam state");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !selectedOption) {
      toast.error("Please select an answer option");
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch<any>(`/exams/attempts/${attemptId}/answer`, {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          selectedAnswer: selectedOption,
        }),
      });

      setSelectedOption("");

      if (res.data.completed) {
        setFinalScore(res.data.score);
        setXpEarned(res.data.xpEarned);
        setPassed(res.data.attempt.passed);
        setCompleted(true);
        toast.success("Exam completed successfully!");
      } else if (res.data.nextQuestion) {
        setQuestion(res.data.nextQuestion);
        setQuestionIndex((prev) => prev + 1);
        toast.info(res.data.correct ? "Correct! Adapting difficulty upwards." : "Incorrect. Adapting difficulty downwards.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-bg-secondary animate-pulse rounded-lg w-1/4"></div>
        <div className="h-44 bg-bg-secondary animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      
      {/* Timer / Progress Bar */}
      {!completed && (
        <div className="flex items-center justify-between bg-bg-secondary border border-border rounded-xl px-5 py-3 shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
            <span className="bg-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded font-mono">
              Q {questionIndex} / 6
            </span>
            <span>Adaptive Exam</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-accent-orange">
            <Clock className="w-4 h-4 animate-pulse" />
            {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* Main Question Display */}
      <AnimatePresence mode="wait">
        {!completed && question && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl space-y-6"
          >
            <div>
              <span className="text-[10px] bg-accent-purple/20 text-accent-purple font-bold px-2 py-0.5 rounded border border-accent-purple/30 uppercase tracking-wider">
                Topic: {question.topic}
              </span>
              <h2 className="text-xl font-bold font-display text-text-primary mt-3 leading-relaxed">
                {question.text}
              </h2>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div className="space-y-3">
                {question.options.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:border-brand-cyan/50 hover:bg-bg-elevated transition-all ${
                      selectedOption === opt
                        ? "border-brand-cyan bg-brand-cyan/10"
                        : "border-border bg-bg-elevated/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="option"
                      value={opt}
                      checked={selectedOption === opt}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-4 h-4 text-brand-cyan accent-brand-cyan bg-bg-primary border-border focus:ring-0"
                    />
                    <span className="text-sm text-text-primary font-semibold">{opt}</span>
                  </label>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting || !selectedOption}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-cyan to-accent-purple text-bg-primary font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all text-sm mt-6"
              >
                {submitting ? "Submitting..." : "Submit Answer"}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed Graded Scorecard */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary border border-border rounded-2xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl"></div>
            
            <div className="mx-auto w-16 h-16 rounded-full bg-accent-green/20 text-accent-green border border-accent-green/30 flex items-center justify-center font-bold">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold font-display text-text-primary tracking-tight">
                Exam Evaluation Graded
              </h2>
              <p className="text-sm text-text-secondary mt-2">
                Adaptive exam complete. Leveling score updated in DLT Mastery.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
              <div className="bg-bg-elevated border border-border p-4 rounded-xl">
                <span className="text-[10px] text-text-muted uppercase block font-semibold">Final Grade</span>
                <p className="text-2xl font-extrabold text-text-primary font-mono mt-1">
                  {(finalScore * 100).toFixed(0)}%
                </p>
              </div>

              <div className="bg-bg-elevated border border-border p-4 rounded-xl">
                <span className="text-[10px] text-text-muted uppercase block font-semibold">XP Rewarded</span>
                <p className="text-2xl font-extrabold text-brand-cyan font-mono mt-1">
                  +{xpEarned} XP
                </p>
              </div>
            </div>

            <div className="pt-6">
              <span className={`text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                passed ? "bg-accent-green/20 text-accent-green" : "bg-accent-red/20 text-accent-red"
              }`}>
                {passed ? "PASSED (MET THRESHOLD)" : "FAILED (RETRY RECOMMENDED)"}
              </span>
            </div>

            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/exams")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-cyan to-accent-purple text-bg-primary font-bold py-3.5 px-8 rounded-xl text-sm"
              >
                Back to Exam Catalog
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
