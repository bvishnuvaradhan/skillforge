import React from "react";
import Link from "next/link";
import { SignupForm } from "../../../components/auth/SignupForm";
import { ROUTES } from "../../../constants/routes";

export const metadata = {
  title: "Sign Up — SkillForge",
  description: "Create your SkillForge programmer growth account.",
};

export default function SignupPage() {
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-heading font-extrabold text-text-primary tracking-tight">
          Create account
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Join SkillForge to forge your programming career
        </p>
      </div>

      <SignupForm />

      <div className="text-center mt-6">
        <p className="text-xs text-text-secondary">
          Already have an account?{" "}
          <Link href={ROUTES.LOGIN} className="text-brand-cyan hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </>
  );
}
