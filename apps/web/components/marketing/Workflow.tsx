"use client";

import React from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Play, Award } from "lucide-react";

export const Workflow = () => {
  const steps = [
    {
      icon: <ClipboardCheck className="w-5 h-5 text-brand-cyan" />,
      stepNum: "01",
      title: "Diagnostic Assessment",
      description:
        "Select your target track. Complete a 15-question diagnostic to benchmark topic mastery and initialize your twin.",
    },
    {
      icon: <Play className="w-5 h-5 text-accent-purple" />,
      stepNum: "02",
      title: "Gamified Learning",
      description:
        "Embark on personalized roadmaps. Fight boss battles, solve interactive puzzles, and practice coding platforms.",
    },
    {
      icon: <Award className="w-5 h-5 text-accent-green" />,
      stepNum: "03",
      title: "Clearing Interviews",
      description:
        "Polish resumes via AI assistance, practice realistic mock interviews, and build FAANG placement confidence.",
    },
  ];

  return (
    <section id="workflow" className="py-20 bg-[#0e1423] border-t border-border relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,47,190,0.03),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-text-primary tracking-tight mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-brand-cyan to-accent-green bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            SkillForge bridges the gap between study and professional success in three seamless steps.
          </p>
        </div>

        {/* Steps Flex/Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Horizontal Connector Line (desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-brand-cyan/20 via-accent-purple/20 to-accent-green/20 z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col items-center text-center relative z-10"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              {/* Connector dot container */}
              <div className="w-24 h-24 rounded-full bg-bg-primary border border-border flex items-center justify-center relative mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] group-hover:border-brand-cyan transition-colors duration-300">
                <div className="w-16 h-16 rounded-full bg-bg-secondary border border-border flex items-center justify-center">
                  {step.icon}
                </div>
                {/* Step badge */}
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-[10px] font-mono font-bold text-text-secondary">
                  {step.stepNum}
                </div>
              </div>

              {/* Step Title & Description */}
              <h3 className="font-heading font-bold text-lg text-text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-text-secondary text-xs sm:text-sm max-w-xs leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;
