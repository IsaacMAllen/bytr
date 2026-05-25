import { SignIn } from "@clerk/react";
import { useLocation } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";

/**
 * `/sign-in/*` -- the only public entry point.
 *
 * Sign-ups are closed at the Clerk layer (`sign_up_mode: "restricted"`
 * with a single allowlisted email), so we deliberately do *not* pass
 * `signUpUrl` -- that suppresses the "Don't have an account? Sign up"
 * footer on Clerk's card.
 *
 * Auth is Apple-only.  Clerk's `<SignIn>` automatically renders just the
 * "Continue with Apple" button because every other strategy is disabled
 * in the instance config; nothing to do here on our side.
 */
export function SignInPage() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  return (
    <AuthShell
      title="Sign in to bytr"
      subtitle="Telemetry inspector — by invitation only."
    >
      <SignIn
        routing="path"
        path="/sign-in"
        fallbackRedirectUrl={from && from !== "/sign-in" ? from : "/"}
      />
    </AuthShell>
  );
}
