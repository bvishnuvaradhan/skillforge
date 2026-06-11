import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            "inline-flex items-center justify-center rounded-xl font-heading font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
            // Variant Styles
            {
              "bg-brand-cyan text-bg-primary hover:bg-[#00d0f5] hover:shadow-[0_0_15px_rgba(0,180,216,0.4)]":
                variant === "primary",
              "bg-bg-elevated text-text-primary hover:bg-[#252c4a] border border-border":
                variant === "secondary",
              "bg-transparent text-brand-cyan border border-brand-cyan/30 hover:border-brand-cyan hover:bg-brand-cyan/10":
                variant === "outline",
              "bg-accent-red text-text-primary hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]":
                variant === "danger",
            },
            // Size Styles
            {
              "text-xs px-3 py-1.5 h-8": size === "sm",
              "text-sm px-4 py-2.5 h-11": size === "md",
              "text-base px-6 py-3.5 h-14": size === "lg",
            },
            className
          )
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-1 h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText || "Please wait..."}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
