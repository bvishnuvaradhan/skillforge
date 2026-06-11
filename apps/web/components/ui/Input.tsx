import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-heading font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={twMerge(
            clsx(
              "w-full bg-bg-secondary border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted transition-all duration-300 focus:outline-none",
              error
                ? "border-accent-red/50 focus:border-accent-red focus:ring-1 focus:ring-accent-red/20"
                : "border-border focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 focus:shadow-[0_0_10px_rgba(0,180,216,0.15)]"
            ),
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-accent-red font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
