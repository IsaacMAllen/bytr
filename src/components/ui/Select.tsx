import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, ...props }, ref) => {
    const inner = (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-9 w-full appearance-none rounded-md border border-slate-800 bg-slate-900/70 pl-3 pr-8 text-sm text-slate-100 focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/40 transition-colors",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          size={14}
        />
      </div>
    );
    if (!label) return inner;
    return (
      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-400">
        {label}
        {inner}
      </label>
    );
  },
);
Select.displayName = "Select";
