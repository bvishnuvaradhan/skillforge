import React from "react";
import Link from "next/link";
import { ROUTES } from "../../constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden bg-grid select-none">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-cyan/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-accent-purple/5 blur-[80px] pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-[440px] bg-bg-secondary border border-border rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,180,216,0.04)] relative z-10">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-brand-cyan to-accent-purple flex items-center justify-center">
              <span className="text-bg-primary font-heading font-extrabold text-sm">S</span>
            </div>
            <span className="font-heading font-bold text-base text-text-primary tracking-tight">
              Skill<span className="bg-gradient-to-r from-brand-cyan to-accent-purple bg-clip-text text-transparent">Forge</span>
            </span>
          </Link>
        </div>

        {/* Form Slot */}
        {children}
      </div>
    </div>
  );
}
