import React from "react";
import Link from "next/link";
import { LoginForm } from "../../../components/auth/LoginForm";
import { ROUTES } from "../../../constants/routes";

export const metadata = {
  title: "Sign In — SkillForge",
  description: "Sign in to your SkillForge growth ecosystem account.",
};

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-heading font-extrabold text-text-primary tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Enter your credentials to access your growth workspace
        </p>
      </div>

      <LoginForm />

      <div className="text-center mt-6">
        <p className="text-xs text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href={ROUTES.SIGNUP} className="text-brand-cyan hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
}
