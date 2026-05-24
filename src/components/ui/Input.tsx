import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, ...props }, ref) => (
    <div
      className={cn(
        "flex h-9 items-center gap-2 rounded-md border border-slate-800 bg-slate-900/70 px-3 text-sm text-slate-100 focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/40 transition-colors",
        className,
      )}
    >
      {leftIcon && <span className="text-slate-400">{leftIcon}</span>}
      <input
        ref={ref}
        className="w-full bg-transparent placeholder:text-slate-500 focus:outline-none"
        {...props}
      />
    </div>
  ),
);
Input.displayName = "Input";
