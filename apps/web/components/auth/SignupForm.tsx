"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signupSchema, SignupInput } from "../../lib/validations/auth";
import { registerUser } from "../../lib/auth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Divider } from "../ui/Divider";
import { ROUTES } from "../../constants/routes";
import { env } from "../../env";

export const SignupForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });


  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "student", // Only students can self-register; mentor accounts are created by Admin
      });
      toast.success("Account created successfully! Welcome to SkillForge!");

      // New users always direct to onboarding first
      router.push(ROUTES.ONBOARDING);
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      toast.error(errorMessage || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getOAuthUrl = (provider: "google" | "github") => {
    const baseUrl = env.NEXT_PUBLIC_API_URL.endsWith("/")
      ? env.NEXT_PUBLIC_API_URL.slice(0, -1)
      : env.NEXT_PUBLIC_API_URL;
    return `${baseUrl}/auth/oauth/${provider}`;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Student-only info note */}
      <div className="flex items-start gap-2 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl px-3.5 py-2.5">
        <svg className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        </svg>
        <p className="text-xs text-text-secondary leading-relaxed">
          Student accounts are open to everyone.{" "}
          <span className="text-text-primary font-semibold">Mentor accounts</span> are created by an Admin — contact your administrator to get mentor access.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Name input */}
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          disabled={isLoading}
          {...register("name")}
        />

        {/* Email input */}
        <Input
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          error={errors.email?.message}
          disabled={isLoading}
          {...register("email")}
        />


        {/* Passwords */}
        <Input
          type="password"
          label="Password"
          placeholder="Min 8 chars, uppercase, symbol"
          error={errors.password?.message}
          disabled={isLoading}
          {...register("password")}
        />

        <Input
          type="password"
          label="Confirm Password"
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          disabled={isLoading}
          {...register("confirmPassword")}
        />

        {/* Terms checkbox */}
        <div className="flex flex-col gap-1">
          <label className="inline-flex items-start gap-2.5 cursor-pointer mt-1 select-none">
            <input
              type="checkbox"
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-border text-brand-cyan bg-bg-secondary focus:ring-brand-cyan/20 focus:ring-offset-bg-primary"
              {...register("terms")}
            />
            <span className="text-xs text-text-secondary leading-normal">
              I agree to the{" "}
              <span className="text-brand-cyan hover:underline">Terms of Service</span>{" "}
              and{" "}
              <span className="text-brand-cyan hover:underline">Privacy Policy</span>.
            </span>
          </label>
          {errors.terms && (
            <span className="text-xs text-accent-red font-medium mt-0.5">
              {errors.terms.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          loadingText="Creating account..."
        >
          Create Account
        </Button>
      </form>

      <Divider>Or sign up with</Divider>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={getOAuthUrl("google")}
          className="flex items-center justify-center gap-2 bg-bg-secondary hover:bg-[#1e2b45]/30 border border-border hover:border-brand-cyan/30 text-text-primary text-sm font-semibold rounded-xl py-2.5 transition-all duration-300 active:scale-95"
        >
          {/* Custom Google Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </a>

        <a
          href={getOAuthUrl("github")}
          className="flex items-center justify-center gap-2 bg-bg-secondary hover:bg-[#1e2b45]/30 border border-border hover:border-brand-cyan/30 text-text-primary text-sm font-semibold rounded-xl py-2.5 transition-all duration-300 active:scale-95"
        >
          {/* Custom GitHub Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"
            />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  );
};
