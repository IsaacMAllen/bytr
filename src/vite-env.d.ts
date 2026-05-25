/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute URL of the m4l-telemetry-api, e.g. `https://telemetry.bugbytz.com`.
   * Read at BUILD time (Vite inlines it).  In dev this is unused -- the dev
   * server proxies `/api/*` to whatever backend `vite.config.ts` points at.
   */
  readonly VITE_API_URL?: string;

  /**
   * Clerk publishable key (`pk_test_…` for dev, `pk_live_…` for prod).
   * Required: the app refuses to mount without it because every route is
   * auth + MFA gated.  Get one from https://dashboard.clerk.com.
   */
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css" {
  const content: string;
  export default content;
}
