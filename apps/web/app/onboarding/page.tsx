import React from "react";
import Link from "next/link";
import { OnboardingWizard } from "../../components/features/onboarding/OnboardingWizard";
import { ROUTES } from "../../constants/routes";

export const metadata = {
  title: "Onboarding — SkillForge",
  description: "Configure your goals and initialize your Digital Learning Twin.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden bg-grid select-none">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-accent-purple/5 blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center gap-2 mb-6 text-center relative z-10">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-brand-cyan to-accent-purple flex items-center justify-center">
            <span className="text-bg-primary font-heading font-extrabold text-base">S</span>
          </div>
          <span className="font-heading font-bold text-lg text-text-primary tracking-tight">
            Skill<span className="bg-gradient-to-r from-brand-cyan to-accent-purple bg-clip-text text-transparent">Forge</span>
          </span>
        </Link>
      </div>

      {/* Onboarding Wizard Card */}
      <div className="relative z-10 w-full flex justify-center">
        <OnboardingWizard />
      </div>
    </div>
  );
}
