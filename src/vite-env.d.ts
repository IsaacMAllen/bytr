/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute URL of the m4l-telemetry-api, e.g. `https://telemetry.bugbytz.com`.
   * Read at BUILD time (Vite inlines it).  In dev this is unused -- the dev
   * server proxies `/api/*` to whatever backend `vite.config.ts` points at.
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css" {
  const content: string;
  export default content;
}
