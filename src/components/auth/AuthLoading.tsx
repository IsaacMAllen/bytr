import { Loader2 } from "lucide-react";

/**
 * Full-screen "Clerk is bootstrapping" / "checking session" indicator.
 * Used by route guards (`RequireAuth`, `RequireMfa`) while `isLoaded`
 * is false so we don't flash a redirect before the SDK has hydrated.
 */
export function AuthLoading({ label = "Checking session…" }: { label?: string }) {
  return (
    <div
      className="app-shell flex min-h-screen items-center justify-center text-slate-400"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm">
        <Loader2 size={16} className="animate-spin text-sky-400" />
        {label}
      </div>
    </div>
  );
}
