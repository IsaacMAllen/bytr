import { CircleDot, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { UserButton } from "@clerk/react";
import { Button } from "@/components/ui/Button";
import { useHealth } from "@/lib/queries";
import { clerkAppearance } from "@/lib/clerk";
import { cn } from "@/lib/utils";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { data, isError, isLoading } = useHealth();
  const qc = useQueryClient();

  const ok = !isError && data?.status === "ok";
  const tone = isLoading
    ? "text-slate-400"
    : ok
      ? "text-emerald-400"
      : "text-rose-400";
  const label = isLoading ? "checking…" : ok ? "API healthy" : "API unreachable";

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/30 px-6 py-3.5 backdrop-blur-sm">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-slate-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <CircleDot size={11} className={cn(tone, ok && "live-dot")} />
          <span className={cn("font-medium", tone)}>{label}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => qc.invalidateQueries()}
          title="Refetch all queries"
        >
          <RefreshCw size={12} /> refresh
        </Button>
        <div className="ml-1 flex items-center border-l border-slate-800 pl-3">
          <UserButton
            appearance={{
              ...clerkAppearance,
              elements: {
                ...clerkAppearance.elements,
                userButtonAvatarBox: "h-7 w-7",
              },
            }}
            userProfileProps={{ appearance: clerkAppearance }}
          />
        </div>
      </div>
    </header>
  );
}
