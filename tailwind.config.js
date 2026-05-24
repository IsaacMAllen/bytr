/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "InterVariable",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      colors: {
        // Semantic palette for events.  Tied to the kind/level enums on the
        // backend so changes in one place are easy to mirror.
        kind: {
          event: "rgb(56 189 248)",   // sky-400
          metric: "rgb(167 139 250)", // violet-400
          error: "rgb(251 191 36)",   // amber-400
          crash: "rgb(248 113 113)",  // red-400
        },
        level: {
          info: "rgb(148 163 184)",     // slate-400
          warning: "rgb(251 191 36)",   // amber-400
          error: "rgb(251 113 133)",    // rose-400
          fatal: "rgb(220 38 38)",      // red-600
        },
        // Surface tokens for our dark mode (subtle gradient between
        // bg-app and bg-card to add depth without using shadows).
        surface: {
          app: "rgb(8 12 24)",          // slate-950 + a touch
          card: "rgb(15 23 42)",        // slate-900
          cardHover: "rgb(20 30 55)",
          border: "rgb(30 41 59)",      // slate-800
          borderStrong: "rgb(51 65 85)",// slate-700
        },
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 200ms ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
