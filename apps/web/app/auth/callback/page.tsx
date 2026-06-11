"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCurrentUser } from "../../../lib/auth";
import { ROUTES } from "../../../constants/routes";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const user = await getCurrentUser();
        
        if (user.onboardingComplete) {
          router.push(ROUTES.DASHBOARD);
        } else {
          router.push(ROUTES.ONBOARDING);
        }
        router.refresh();
      } catch (err: unknown) {
        console.error("Session verification failed on callback:", err);
        const errorMessage = err instanceof Error ? err.message : "Authentication failed";
        toast.error(`${errorMessage}. Please try signing in again.`);
        router.push(ROUTES.LOGIN);
      }
    };

    verifySession();
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 bg-grid">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Loading Spinner */}
        <div className="w-10 h-10 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
        
        <div>
          <h2 className="font-heading font-bold text-lg text-text-primary">
            Signing you in...
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Loading your workspace and preparing your Digital Twin
          </p>
        </div>
      </div>
    </div>
  );
}
