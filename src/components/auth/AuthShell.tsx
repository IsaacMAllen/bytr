import type { ReactNode } from "react";

/**
 * Centered single-card layout used by `/sign-in`, `/sign-up` and `/mfa-setup`.
 * Mirrors the radial-gradient backdrop on `.app-shell` so the unauthenticated
 * surface visually belongs to the same product.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-sky-400 to-violet-500 text-slate-950 font-black">
            b
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight text-slate-100">
              bytr
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              telemetry inspector
            </div>
          </div>
        </div>

        {(title || subtitle) && (
          <div className="text-center">
            {title && (
              <h1 className="text-lg font-semibold tracking-tight text-slate-100">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
