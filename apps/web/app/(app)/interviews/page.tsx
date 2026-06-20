"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../../../lib/api";
import { 
  Video, 
  Bot, 
  Calendar, 
  Star, 
  ArrowRight, 
  User, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Sparkles,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";

interface Mentor {
  id: string;
  userId: string;
  bio: string;
  headline: string;
  expertise: string[];
  experienceYears: number;
  sessionPrice: string | number;
  sessionDurationMinutes: number;
  ratingAverage: number;
  ratingCount: number;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface InterviewSession {
  id: string;
  type: "ai" | "human";
  interviewType: string;
  targetCompany: string | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledAt: string | null;
  pricePaid: string | number | null;
  createdAt: string;
  mentor?: {
    name: string;
    avatarUrl: string | null;
  };
  feedback?: {
    overallScore: number;
  };
}

export default function InterviewsDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Interview Launcher states
  const [aiType, setAiType] = useState<"dsa" | "coding" | "system_design" | "behavioral" | "hr">("coding");
  const [aiCompany, setAiCompany] = useState("");
  const [launchingAi, setLaunchingAi] = useState(false);

  // Mentor Booking states
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [bookingType, setBookingType] = useState<"dsa" | "coding" | "system_design" | "behavioral" | "hr">("coding");
  const [bookingCompany, setBookingCompany] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bypassPayment, setBypassPayment] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Review states
  const [reviewingSessionId, setReviewingSessionId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sessRes, mentRes] = await Promise.all([
        apiFetch<InterviewSession[]>("/interviews"),
        apiFetch<Mentor[]>("/interviews/mentors"),
      ]);
      setSessions(sessRes.data);
      setMentors(mentRes.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load interview dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchAiInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLaunchingAi(true);
      toast.info("Initializing your AI Interviewer. Please wait...");
      const res = await apiFetch<{ session: { id: string } }>("/interviews/ai/start", {
        method: "POST",
        body: JSON.stringify({
          interviewType: aiType,
          targetCompany: aiCompany || undefined,
        }),
      });
      toast.success("AI interview session started!");
      router.push(`/interviews/ai?session_id=${res.data.session.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to start AI interview");
    } finally {
      setLaunchingAi(false);
    }
  };

  const handleBookMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    if (!bookingDate) {
      toast.error("Please select a booking date and time");
      return;
    }

    try {
      setBookingLoading(true);
      toast.info("Processing booking session...");
      const res = await apiFetch<{ sessionId: string; checkoutUrl?: string; bypass?: boolean }>(
        "/interviews/bookings/checkout-session",
        {
          method: "POST",
          body: JSON.stringify({
            mentorId: selectedMentor.userId,
            scheduledAt: new Date(bookingDate).toISOString(),
            interviewType: bookingType,
            targetCompany: bookingCompany || undefined,
            bypassPayment,
          }),
        }
      );

      if (res.data.bypass) {
        toast.success("Mentor session booked successfully (bypass payment mode)!");
        setSelectedMentor(null);
        fetchDashboardData();
      } else if (res.data.checkoutUrl) {
        toast.success("Checkout session created! Redirecting to payment...");
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSessionId) return;

    try {
      setSubmittingReview(true);
      await apiFetch(`/interviews/${reviewingSessionId}/review`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      toast.success("Thank you for your feedback review!");
      setReviewingSessionId(null);
      setComment("");
      setRating(5);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight font-display bg-gradient-to-r from-brand-cyan to-accent-purple bg-clip-text text-transparent">
            Interview Prep Center
          </h1>
          <p className="text-text-secondary mt-2">
            Sharpen your coding, data structures, and architectural communication with AI mentors or verified industry engineers.
          </p>
        </div>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Launch AI Interview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-brand-cyan/20 text-brand-cyan rounded-xl">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary">
                  AI Mock Interview
                </h2>
                <p className="text-xs text-text-secondary">AI-powered evaluation loops</p>
              </div>
            </div>

            <form onSubmit={handleLaunchAiInterview} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
                  Interview Category
                </label>
                <select
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value as any)}
                  className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-cyan text-sm"
                >
                  <option value="coding">Coding & DS / Algorithms</option>
                  <option value="dsa">Advanced DSA & Complexity</option>
                  <option value="system_design">System Design & Architecture</option>
                  <option value="behavioral">Behavioral (Leadership/STAR)</option>
                  <option value="hr">HR & Career Placement</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
                  Target Company (Optional)
                </label>
                <input
                  type="text"
                  value={aiCompany}
                  onChange={(e) => setAiCompany(e.target.value)}
                  placeholder="e.g. Google, Meta, Netflix"
                  className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-brand-cyan text-sm"
                />
              </div>

              <motion.button
                whileHover={{ scale: launchingAi ? 1 : 1.02 }}
                whileTap={{ scale: launchingAi ? 1 : 0.98 }}
                type="submit"
                disabled={launchingAi}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-cyan to-accent-purple text-bg-primary font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/30 transition-all text-sm mt-6"
              >
                {launchingAi ? "Generating Session..." : "Start AI Interview"}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          </div>

          {/* DLT Interview Insights */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-accent-purple" />
              <h3 className="text-lg font-bold font-display text-text-primary">Practice Insights</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              SkillForge AI builds mock questions using your DLT performance. Masteries below <span className="text-accent-purple font-semibold">75%</span> will automatically be selected for coding assessments.
            </p>
          </div>
        </div>

        {/* Right Side: Active / Completed Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold font-display text-text-primary mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-cyan" />
              Your Interview Sessions
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-bg-elevated animate-pulse rounded-xl border border-border"></div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
                <AlertCircle className="w-8 h-8 text-text-muted mb-2" />
                <p className="text-text-secondary text-sm">No scheduled or completed sessions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-bg-elevated border border-border rounded-xl hover:border-brand-cyan/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${sess.type === "ai" ? "bg-brand-cyan/10 text-brand-cyan" : "bg-accent-purple/10 text-accent-purple"}`}>
                        {sess.type === "ai" ? <Bot className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-text-primary capitalize">
                            {sess.type === "ai" ? "AI Interviewer" : `Mentor: ${sess.mentor?.name ?? "Assigned Mentor"}`}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            sess.status === "completed" 
                              ? "bg-accent-green/20 text-accent-green" 
                              : sess.status === "cancelled" 
                              ? "bg-accent-red/20 text-accent-red" 
                              : "bg-brand-cyan/20 text-brand-cyan"
                          }`}>
                            {sess.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                          Type: <span className="capitalize">{sess.interviewType}</span>
                          {sess.targetCompany && ` | Target: ${sess.targetCompany}`}
                          {sess.scheduledAt && ` | Scheduled: ${new Date(sess.scheduledAt).toLocaleString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {sess.status === "in_progress" && sess.type === "ai" && (
                        <button
                          onClick={() => router.push(`/interviews/ai?session_id=${sess.id}`)}
                          className="bg-brand-cyan text-bg-primary font-bold text-xs px-4 py-2 rounded-lg hover:scale-105 transition-all"
                        >
                          Resume
                        </button>
                      )}

                      {sess.status === "scheduled" && sess.type === "human" && (
                        <button
                          onClick={() => router.push(`/interviews/${sess.id}`)}
                          className="bg-accent-purple text-text-primary font-bold text-xs px-4 py-2 rounded-lg hover:scale-105 transition-all"
                        >
                          Enter Live Room
                        </button>
                      )}

                      {sess.status === "completed" && (
                        <div className="flex items-center gap-2">
                          {sess.feedback && (
                            <button
                              onClick={() => router.push(`/interviews/feedback/${sess.id}`)}
                              className="border border-border text-brand-cyan hover:bg-brand-cyan/10 font-semibold text-xs px-4 py-2 rounded-lg transition-all"
                            >
                              Report ({(sess.feedback.overallScore * 100).toFixed(0)}%)
                            </button>
                          )}
                          
                          {sess.type === "human" && (
                            <button
                              onClick={() => setReviewingSessionId(sess.id)}
                              className="border border-border text-text-primary hover:bg-bg-elevated font-semibold text-xs px-4 py-2 rounded-lg transition-all"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mentor Marketplace Booking Section */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold font-display text-text-primary mb-2 flex items-center gap-2">
          <User className="w-6 h-6 text-accent-purple" />
          Mentor Marketplace
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          Book mock interviews with verified principal architects, engineers, and competitive programmers. 15% commission is handled automatically.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-bg-elevated animate-pulse rounded-xl border border-border"></div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
            <User className="w-8 h-8 text-text-muted mb-2" />
            <p className="text-text-secondary text-sm">No approved mentors are currently online in the marketplace.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-bg-elevated border border-border rounded-xl p-5 hover:border-accent-purple/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-accent-purple/20 text-accent-purple rounded-full flex items-center justify-center font-bold text-lg border border-accent-purple/40">
                      {mentor.user.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary leading-tight">{mentor.user.name}</h3>
                      <p className="text-xs text-brand-cyan font-semibold mt-0.5">{mentor.headline}</p>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                    {mentor.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mentor.expertise.map((exp, idx) => (
                      <span key={idx} className="bg-bg-secondary text-text-secondary text-[10px] font-semibold px-2 py-0.5 rounded border border-border">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-text-muted">Rate</span>
                    <p className="font-extrabold text-text-primary text-lg font-mono">
                      ${Number(mentor.sessionPrice).toFixed(0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-accent-orange text-xs gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {mentor.ratingAverage > 0 ? mentor.ratingAverage.toFixed(1) : "N/A"}
                    </div>

                    <button
                      onClick={() => setSelectedMentor(mentor)}
                      className="bg-accent-purple text-text-primary font-bold text-xs py-2 px-4 rounded-lg hover:scale-105 transition-all"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-secondary border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <h3 className="text-xl font-bold font-display text-text-primary mb-2">
                Book Session with {selectedMentor.user.name}
              </h3>
              <p className="text-xs text-text-secondary mb-6">
                Price: <span className="text-text-primary font-bold font-mono">${Number(selectedMentor.sessionPrice).toFixed(2)}</span> | Commission included.
              </p>

              <form onSubmit={handleBookMentor} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase block mb-2">
                    Interview Type
                  </label>
                  <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value as any)}
                    className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-cyan text-sm"
                  >
                    <option value="coding">Coding & DS / Algorithms</option>
                    <option value="dsa">Advanced DSA & Complexity</option>
                    <option value="system_design">System Design & Architecture</option>
                    <option value="behavioral">Behavioral (Leadership/STAR)</option>
                    <option value="hr">HR & Placement</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase block mb-2">
                    Target Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookingCompany}
                    onChange={(e) => setBookingCompany(e.target.value)}
                    placeholder="e.g. Netflix, Amazon"
                    className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-brand-cyan text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase block mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-cyan text-sm"
                  />
                </div>

                {/* Test Mode Bypass (only in development) */}
                {process.env.NODE_ENV !== "production" && (
                  <div className="flex items-center gap-2.5 p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl">
                    <input
                      type="checkbox"
                      id="bypass"
                      checked={bypassPayment}
                      onChange={(e) => setBypassPayment(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-cyan focus:ring-0 accent-brand-cyan bg-bg-primary border-border"
                    />
                    <label htmlFor="bypass" className="text-xs font-bold text-brand-cyan cursor-pointer">
                      Bypass payment validation (Test Mode)
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="flex-1 border border-border text-text-secondary hover:bg-bg-elevated font-semibold py-3 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 bg-accent-purple text-text-primary font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {bookingLoading ? "Booking..." : "Checkout"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Dialog */}
      <AnimatePresence>
        {reviewingSessionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-secondary border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold font-display text-text-primary mb-4">
                Rate & Review Session
              </h3>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase block mb-2">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-all focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? "text-accent-orange fill-current" : "text-text-muted"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase block mb-2">
                    Comment / Feedback
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide a brief review of your experience with this mentor..."
                    rows={4}
                    className="w-full bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-brand-cyan text-sm resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setReviewingSessionId(null)}
                    className="flex-1 border border-border text-text-secondary hover:bg-bg-elevated font-semibold py-3 rounded-xl text-sm"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 bg-accent-purple text-text-primary font-bold py-3 rounded-xl text-sm"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
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
