import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "cyan" | "purple" | "green" | "orange" | "red" | "default";
}

export const Badge = ({ className, variant = "default", children, ...props }: BadgeProps) => {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border",
          {
            "bg-[#1e2b45]/30 text-text-secondary border-border": variant === "default",
            "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20": variant === "cyan",
            "bg-accent-purple/10 text-accent-purple border-accent-purple/20": variant === "purple",
            "bg-accent-green/10 text-accent-green border-accent-green/20": variant === "green",
            "bg-accent-orange/10 text-accent-orange border-accent-orange/20": variant === "orange",
            "bg-accent-red/10 text-accent-red border-accent-red/20": variant === "red",
          }
        ),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
