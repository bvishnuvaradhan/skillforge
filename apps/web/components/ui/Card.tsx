import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            "bg-bg-secondary border border-border rounded-2xl p-6 transition-all duration-300",
            hoverEffect &&
              "hover:border-brand-cyan/30 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,180,216,0.05)]"
          ),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
