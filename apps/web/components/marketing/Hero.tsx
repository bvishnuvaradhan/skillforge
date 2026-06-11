"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { Button } from "../ui/Button";

export const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-grid">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent-purple/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Side: Taglines and CTAs */}
        <motion.div
          className="lg:col-span-7 flex flex-col items-start text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-secondary border border-border text-xs font-semibold text-brand-cyan mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Learning Ecosystem
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-text-primary leading-[1.1] mb-6 tracking-tight"
          >
            Forge Your Career Path.{" "}
            <span className="bg-gradient-to-r from-brand-cyan via-accent-purple to-accent-orange bg-clip-text text-transparent">
              Guided by AI.
            </span>
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-text-secondary max-w-xl mb-8 leading-relaxed"
          >
            SkillForge guides you from complete beginner to industry-ready software engineer. Build topics through gamified worlds, optimize retention with memory science, and clear interviews with an intelligent Digital Learning Twin.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href={ROUTES.SIGNUP} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full gap-2">
                Start Learning Free
                <ArrowRight className="w-4.5 h-4.5" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View Pricing
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Side: Mock IDE Preview */}
        <motion.div
          className="lg:col-span-5 w-full flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative w-full max-w-[460px] bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,180,216,0.08)] group hover:border-brand-cyan/20 transition-all duration-300">
            {/* Top Bar */}
            <div className="h-10 bg-[#0e1423] border-b border-border px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/80" />
                <div className="w-3 h-3 rounded-full bg-[#eab308]/80" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]/80" />
              </div>
              <div className="text-xs font-mono text-text-muted flex items-center gap-1.5 select-none">
                <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
                dlt_engine.py
              </div>
              <div className="w-12" />
            </div>

            {/* Code Content */}
            <div className="p-5 font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto text-text-secondary select-none">
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">1</span>
                <span>
                  <span className="text-accent-purple">import</span>{" "}
                  dlt_twin, mastery_tracker
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">2</span>
                <span>
                  <span className="text-accent-purple">import</span> database_client
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">3</span>
                <span></span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">4</span>
                <span>
                  <span className="text-brand-cyan">def</span>{" "}
                  <span className="text-accent-green">analyze_mastery</span>(student_id):
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">5</span>
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;state = dlt_twin.load(student_id)
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">6</span>
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;history = database_client.fetch_solved(student_id)
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">7</span>
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-text-muted"># Calculate DLT decay curves</span>
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">8</span>
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;decay = state.compute_retention_decay()
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">9</span>
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-purple">if</span> decay.risk_level &gt;{" "}
                  <span className="text-accent-orange">0.70</span>:
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">10</span>
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mastery_tracker.trigger_review_nudge()
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-text-muted text-right w-4">11</span>
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-purple">return</span> state.mastery_scores
                </span>
              </div>
            </div>

            {/* Glowing bar overlay animation */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-cyan via-accent-purple to-accent-orange animate-pulse" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
