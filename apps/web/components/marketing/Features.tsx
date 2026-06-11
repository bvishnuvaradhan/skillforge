"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Compass, Cpu, Briefcase } from "lucide-react";
import { Card } from "../ui/Card";

export const Features = () => {
  const features = [
    {
      icon: <Gamepad2 className="w-6 h-6 text-brand-cyan" />,
      title: "Game-Based Learning",
      description:
        "Master DSA concepts and coding patterns through visual puzzles, coding games, and intense boss battle challenges.",
    },
    {
      icon: <Compass className="w-6 h-6 text-accent-purple" />,
      title: "Adaptive Roadmaps",
      description:
        "AI dynamically structures your curriculum based on your career targets, recalculating paths on goal adjustments.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-accent-green" />,
      title: "Digital Learning Twin",
      description:
        "An intelligent profiling engine mapping your exact concept mastery, strengths, and projected retention decay curves.",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-accent-orange" />,
      title: "Career & Interview Center",
      description:
        "Build resumes, prepare with company-specific tracks, take adaptive coding exams, and practice mock sessions.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-bg-primary border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-text-primary tracking-tight mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-brand-cyan to-accent-purple bg-clip-text text-transparent">
              Excel
            </span>
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            SkillForge combines memory science, gaming psychology, and AI mentoring into a single unified workspace.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card hoverEffect className="h-full flex flex-col items-start gap-4">
                <div className="p-3 rounded-xl bg-bg-elevated border border-border">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
