/**
 * App-level email allowlist.
 *
 * Clerk's native allowlist feature is a Pro-tier ($25/mo) feature on
 * production instances, so we enforce the single-user constraint in
 * application code instead.  This runs on every render of `<RequireAuth>`
 * and is robust even if Clerk's `sign_up_mode` is flipped to `public`
 * by accident -- an unauthorised account simply can't see any page.
 *
 * To add a teammate later:
 *  1. Add their primary email below.
 *  2. Either also add them to the (paid) Clerk allowlist, OR flip
 *     `sign_up_mode` to `public` briefly while they sign in, then flip
 *     back to `restricted`.
 *
 * Email comparison is case-insensitive and trimmed; Clerk normalises
 * emails to lower-case on its side but defence in depth is cheap.
 */
export const ALLOWED_EMAILS: readonly string[] = [
  "isaac@isaacallen.dev",
];

const ALLOWED_SET = new Set(
  ALLOWED_EMAILS.map((e) => e.trim().toLowerCase()),
);

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_SET.has(email.trim().toLowerCase());
}
