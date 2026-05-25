import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/react";
import { Toaster } from "sonner";

import App from "./App";
import { clerkAppearance } from "./lib/clerk";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Telemetry data ages slowly; 30s stale-while-revalidate keeps the UI
      // snappy without hammering the API.  Pages that want live updates
      // override `refetchInterval` per query.
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  // Surface the misconfiguration loudly: every route is gated behind Clerk
  // so launching without a key would just produce a blank screen.
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY -- copy .env.example to .env.local and paste your key from https://dashboard.clerk.com",
  );
}

/**
 * ClerkProvider must live *inside* <BrowserRouter> so it can use the
 * router's `navigate` for internal redirects (post sign-in / sign-up,
 * MFA challenge, account portal links, etc.).
 */
function ClerkProviderWithRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      // Sign-ups are closed; only `signInUrl` is wired so Clerk never
      // tries to bounce a user into a non-existent /sign-up flow.
      signInUrl="/sign-in"
      signInFallbackRedirectUrl="/"
      afterSignOutUrl="/sign-in"
      appearance={clerkAppearance}
    >
      {children}
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProviderWithRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster
            theme="dark"
            position="bottom-right"
            richColors
            closeButton
          />
        </QueryClientProvider>
      </ClerkProviderWithRouter>
    </BrowserRouter>
  </React.StrictMode>,
);
