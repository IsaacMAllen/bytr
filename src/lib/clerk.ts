import { dark } from "@clerk/themes";
import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/react";

/**
 * Shared Clerk `appearance` config so every Clerk-rendered component
 * (`<SignIn>`, `<SignUp>`, `<UserButton>`, `<UserProfile>`) inherits the
 * same slate-950 + sky-400 palette the rest of the app uses.
 *
 * Tweaks vs. the bundled `dark` baseTheme:
 *  - colorPrimary -> Tailwind `sky-400`            (matches sidebar logo)
 *  - colorBackground / colorInputBackground -> closer to the app shell so
 *    the auth cards feel embedded rather than floating on a grey panel
 *  - JetBrains Mono for one-time codes (parity with our code-y values)
 */
export const clerkAppearance: NonNullable<
  ComponentProps<typeof ClerkProvider>["appearance"]
> = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#38bdf8",
    colorBackground: "#0b1220",
    colorInputBackground: "#0f172a",
    colorText: "#e2e8f0",
    colorTextSecondary: "#94a3b8",
    colorDanger: "#f43f5e",
    colorSuccess: "#34d399",
    borderRadius: "0.5rem",
    fontFamily:
      'Inter, "Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontFamilyButtons:
      'Inter, "Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  elements: {
    card: "bg-slate-950/70 border border-slate-800 shadow-2xl backdrop-blur",
    headerTitle: "text-slate-100",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButton:
      "border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80",
    formFieldInput:
      "bg-slate-900 border border-slate-800 focus:border-sky-500 focus:ring-sky-500/30",
    formButtonPrimary:
      "bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium",
    footerActionLink: "text-sky-400 hover:text-sky-300",
    otpCodeFieldInput: "font-mono",
  },
};
