"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ROUTES } from "../../constants/routes";

// Inline SVGs for brand icons removed from lucide-react v1.x
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);


export const Footer = () => {
  return (
    <footer className="bg-[#070b14] border-t border-border py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Branding */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-brand-cyan to-accent-purple flex items-center justify-center">
              <span className="text-bg-primary font-heading font-extrabold text-xs">S</span>
            </div>
            <span className="font-heading font-bold text-base text-text-primary tracking-tight">
              Skill<span className="bg-gradient-to-r from-brand-cyan to-accent-purple bg-clip-text text-transparent">Forge</span>
            </span>
          </Link>
          <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
            SkillForge is an AI-powered programmer growth ecosystem that guides learners from complete beginners to industry-ready software engineers and competitive programmers.
          </p>
          <p className="text-[10px] text-text-muted">
            &copy; {new Date().getFullYear()} SkillForge. All rights reserved.
          </p>
        </div>

        {/* Center: Quick Links */}
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">Product</h4>
            <ul className="flex flex-col gap-2 text-xs text-text-secondary font-medium">
              <li>
                <span className="hover:text-brand-cyan cursor-pointer transition-colors">Features</span>
              </li>
              <li>
                <span className="hover:text-brand-cyan cursor-pointer transition-colors">Pricing</span>
              </li>
              <li>
                <span className="hover:text-brand-cyan cursor-pointer transition-colors font-semibold flex items-center gap-1">
                  Memory Lab <Sparkles className="w-3 h-3 text-accent-purple" />
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">Legal</h4>
            <ul className="flex flex-col gap-2 text-xs text-text-secondary font-medium">
              <li>
                <span className="hover:text-brand-cyan cursor-pointer transition-colors">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-brand-cyan cursor-pointer transition-colors">Terms of Service</span>
              </li>
              <li>
                <span className="hover:text-brand-cyan cursor-pointer transition-colors">Security Checklist</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Social links */}
        <div className="md:col-span-3 flex flex-col gap-3.5 md:items-end">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Connect With Us</h4>
          <div className="flex gap-3">
            <a
              href="https://github.com/bvishnuvaradhan/skillforge"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-bg-secondary hover:bg-brand-cyan/15 border border-border hover:border-brand-cyan/30 text-text-secondary hover:text-brand-cyan transition-all duration-300"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="p-2.5 rounded-lg bg-bg-secondary hover:bg-brand-cyan/15 border border-border hover:border-brand-cyan/30 text-text-secondary hover:text-brand-cyan transition-all duration-300"
            >
              <XIcon className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="p-2.5 rounded-lg bg-bg-secondary hover:bg-brand-cyan/15 border border-border hover:border-brand-cyan/30 text-text-secondary hover:text-brand-cyan transition-all duration-300"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
