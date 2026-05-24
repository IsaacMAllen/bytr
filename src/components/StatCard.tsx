import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { fmtCompact } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  loading,
  children,
}: {
  label: string;
  value: number | null | undefined;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "default" | "danger" | "warn" | "good";
  loading?: boolean;
  children?: React.ReactNode;
}) {
  const ringTone =
    tone === "danger"
      ? "from-rose-500/20"
      : tone === "warn"
        ? "from-amber-500/20"
        : tone === "good"
          ? "from-emerald-500/20"
          : "from-sky-500/20";

  return (
    <Card className="relative overflow-hidden">
      <div
        className={cn(
          "pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl",
          ringTone,
        )}
      />
      <div className="px-4 py-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-wider text-slate-400">
            {label}
          </span>
          {icon && <span className="text-slate-500">{icon}</span>}
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">
          {loading ? <Skeleton className="h-7 w-20" /> : fmtCompact(value)}
        </div>
        {hint && (
          <div className="mt-1 text-[11px] text-slate-500">{hint}</div>
        )}
        {children}
      </div>
    </Card>
  );
}
