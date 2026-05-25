import { useUser } from "@clerk/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthLoading } from "./AuthLoading";
import { NotAuthorized } from "@/pages/NotAuthorized";
import { isEmailAllowed } from "@/lib/access";

/**
 * Single auth gate for the entire app.
 *
 * Three outcomes after Clerk hydrates:
 *  1. Not signed in           → redirect to /sign-in (preserve return URL)
 *  2. Signed in, email allowed → render the protected outlet
 *  3. Signed in, email *not* allowed → render <NotAuthorized/>
 *
 * Outcome 3 is the free-tier substitute for Clerk's paid allowlist
 * feature.  See `src/lib/access.ts` for the email list.
 */
export function RequireAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  if (!isLoaded) return <AuthLoading />;

  if (!isSignedIn || !user) {
    return (
      <Navigate
        to="/sign-in"
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  if (!isEmailAllowed(user.primaryEmailAddress?.emailAddress)) {
    return <NotAuthorized />;
  }

  return <Outlet />;
}
