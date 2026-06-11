"use client";

import React from "react";
import Link from "next/link";
import { ROUTES } from "../../constants/routes";
import { Button } from "../ui/Button";

export const Navbar = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg-primary/85 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-cyan to-accent-purple flex items-center justify-center shadow-[0_0_15px_rgba(0,180,216,0.3)] group-hover:scale-105 transition-transform duration-300">
            <span className="text-bg-primary font-heading font-extrabold text-base">S</span>
          </div>
          <span className="font-heading font-bold text-lg text-text-primary tracking-tight">
            Skill<span className="bg-gradient-to-r from-brand-cyan to-accent-purple bg-clip-text text-transparent">Forge</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-brand-cyan transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("workflow")}
            className="hover:text-brand-cyan transition-colors"
          >
            How it Works
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="hover:text-brand-cyan transition-colors"
          >
            Pricing
          </button>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link href={ROUTES.LOGIN}>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href={ROUTES.SIGNUP}>
            <Button variant="primary" size="sm" className="hidden sm:inline-flex">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
