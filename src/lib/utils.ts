import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn-style class merge helper. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Locale-friendly thousands separator (no decimals). */
export function fmtInt(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

/** Compact metric formatter -- 1234 -> "1.2K".  Used in stat cards. */
export function fmtCompact(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Truncate a string to `len` chars with an ellipsis, preserving start. */
export function truncate(s: string | null | undefined, len = 80): string {
  if (!s) return "";
  return s.length > len ? `${s.slice(0, len - 1)}…` : s;
}

/** Stable JSON pretty-printer with sorted keys (used in the detail drawer). */
export function prettyJSON(value: unknown, indent = 2): string {
  return JSON.stringify(value, sortKeys, indent);
}
function sortKeys(_key: string, val: unknown): unknown {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    return Object.keys(val as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = (val as Record<string, unknown>)[k];
        return acc;
      }, {});
  }
  return val;
}

/**
 * Copy text to the clipboard (best effort).  Returns true on success.
 * We avoid throwing because the call sites typically toast either way.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
