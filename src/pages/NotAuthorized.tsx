import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import { ShieldX, LogOut } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";

/**
 * Terminal state for a signed-in Clerk user whose primary email is *not*
 * on bytr's `ALLOWED_EMAILS` list.  We intentionally don't auto-sign-out
 * (some users may want to read the message and copy the support email
 * first), but a single click flushes the session.
 *
 * This page is the last line of defence: even if someone bypasses
 * Clerk's `sign_up_mode: "restricted"` they cannot see any data here.
 */
export function NotAuthorized() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  // Cosmetic: gently reduce the email surface area in the UI.
  const email = user?.primaryEmailAddress?.emailAddress ?? "your account";

  // Auto-sign-out after 30s so an unattended browser tab doesn't sit
  // with a half-authenticated session forever.
  useEffect(() => {
    const t = window.setTimeout(() => {
      void signOut({ redirectUrl: "/sign-in" });
    }, 30_000);
    return () => window.clearTimeout(t);
  }, [signOut]);

  return (
    <AuthShell
      title="Not authorised"
      subtitle="bytr is a single-tenant tool and this account isn't on its allow-list."
    >
      <div className="w-full rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-200">
        <div className="flex items-start gap-2.5">
          <ShieldX size={16} className="mt-0.5 shrink-0 text-rose-400" />
          <div className="space-y-1">
            <p className="font-medium">Access denied for {email}.</p>
            <p className="text-xs text-rose-200/80">
              If you believe this is a mistake, contact the bytr operator.
              You will be signed out automatically in 30 seconds.
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={signingOut}
        onClick={async () => {
          setSigningOut(true);
          try {
            await signOut({ redirectUrl: "/sign-in" });
          } finally {
            setSigningOut(false);
          }
        }}
      >
        <LogOut size={12} />
        {signingOut ? "signing out…" : "sign out"}
      </Button>
    </AuthShell>
  );
}
