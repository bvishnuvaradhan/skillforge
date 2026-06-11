"use client";

import React from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ROUTES } from "../../constants/routes";

export const Pricing = () => {
  const tiers = [
    {
      name: "Free Plan",
      price: "$0",
      description: "Essential tools to start mapping your programming foundations.",
      ctaText: "Start Learning Free",
      ctaLink: ROUTES.SIGNUP,
      variant: "outline" as const,
      features: [
        { name: "Adaptive Learning Roadmap", included: true },
        { name: "Basic Coding Assessments", included: true },
        { name: "Global Leaderboards & Stats", included: true },
        { name: "AI Mentor Assistance", included: false },
        { name: "Career Center & Resume Optimizer", included: false },
        { name: "Mock Interviews & Placement Support", included: false },
      ],
    },
    {
      name: "Premium Pro",
      price: "$29",
      period: "/ month",
      description: "Full career acceleration ecosystem with complete AI mentoring.",
      ctaText: "Unlock Career Growth",
      ctaLink: ROUTES.SIGNUP,
      variant: "primary" as const,
      popular: true,
      features: [
        { name: "Adaptive Learning Roadmap", included: true },
        { name: "Premium Interactive Games & Boss Battles", included: true },
        { name: "Unlimited AI Mentor Queries", included: true },
        { name: "DLT Twin Diagnostics & Decay curves", included: true },
        { name: "AI Resume Builder & LinkedIn Optimizer", included: true },
        { name: "Mock Interviews & Placement Readiness", included: true },
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-bg-primary border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-text-primary tracking-tight mb-4">
            Transparent, Simple{" "}
            <span className="bg-gradient-to-r from-brand-cyan to-accent-purple bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Choose the plan that matches your current coding velocity and career goals.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {tiers.map((tier, idx) => (
            <Card
              key={idx}
              className={`relative flex flex-col justify-between h-full transition-all duration-300 ${
                tier.popular
                  ? "border-brand-cyan/40 bg-bg-elevated shadow-[0_15px_40px_rgba(0,180,216,0.05)] scale-[1.02] md:scale-[1.03]"
                  : "border-border"
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 right-6">
                  <Badge variant="cyan">Most Popular</Badge>
                </div>
              )}

              {/* Top Section */}
              <div>
                <h3 className="font-heading font-bold text-lg text-text-primary mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-heading font-extrabold text-text-primary">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-text-secondary font-medium">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                  {tier.description}
                </p>

                {/* Features List */}
                <ul className="flex flex-col gap-3.5 mb-8">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-text-primary" : "text-text-muted"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button */}
              <Link href={tier.ctaLink}>
                <Button variant={tier.variant} className="w-full">
                  {tier.ctaText}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
