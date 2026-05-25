import { useAuth } from "@clerk/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthLoading } from "./AuthLoading";

/**
 * First-stage gate: blocks rendering until Clerk has hydrated, then bounces
 * anyone who isn't signed in to `/sign-in` (preserving the original URL on
 * `location.state.from` so we can return them after auth).
 *
 * MFA enforcement lives in the nested `<RequireMfa>` guard so the
 * `/mfa-setup` page itself can sit *inside* this guard (signed-in users only)
 * but *outside* the MFA check (otherwise they could never reach it).
 */
export function RequireAuth() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) return <AuthLoading />;

  if (!isSignedIn) {
    return (
      <Navigate
        to="/sign-in"
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  return <Outlet />;
}
