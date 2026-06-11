import React from "react";
import { twMerge } from "tailwind-merge";

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider = ({ className, orientation = "horizontal", children, ...props }: DividerProps) => {
  if (orientation === "vertical") {
    return (
      <div
        className={twMerge("w-[1px] bg-border self-stretch", className)}
        {...props}
      />
    );
  }

  return (
    <div
      className={twMerge("flex items-center w-full my-4", className)}
      {...props}
    >
      <div className="flex-grow h-[1px] bg-border" />
      {children && (
        <span className="px-3 text-xs font-semibold text-text-muted select-none uppercase tracking-wider">
          {children}
        </span>
      )}
      <div className="flex-grow h-[1px] bg-border" />
    </div>
  );
};

export default Divider;
