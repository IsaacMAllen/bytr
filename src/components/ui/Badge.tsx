import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border",
  {
    variants: {
      tone: {
        slate:
          "bg-slate-800/60 text-slate-200 border-slate-700",
        sky:
          "bg-sky-500/10 text-sky-300 border-sky-500/30",
        violet:
          "bg-violet-500/10 text-violet-300 border-violet-500/30",
        amber:
          "bg-amber-500/10 text-amber-300 border-amber-500/30",
        red:
          "bg-red-500/10 text-red-300 border-red-500/30",
        rose:
          "bg-rose-500/10 text-rose-300 border-rose-500/30",
        emerald:
          "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      },
    },
    defaultVariants: { tone: "slate" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badge>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}
