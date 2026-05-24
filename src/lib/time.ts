import { formatDistanceToNowStrict, format, parseISO } from "date-fns";

/** "2m ago", "3h ago" -- compact relative times for tables. */
export function relTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  return formatDistanceToNowStrict(d, { addSuffix: true });
}

/** Absolute timestamps -- used in tooltips. */
export function absTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  return format(d, "yyyy-MM-dd HH:mm:ss");
}

/** Time-only HH:mm:ss -- useful in the live-tail table. */
export function clockTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  return format(d, "HH:mm:ss");
}

/** Quick range presets for the dashboard / events filter. */
export const RANGE_PRESETS: Array<{
  id: string;
  label: string;
  hours: number;
}> = [
  { id: "1h", label: "Last hour", hours: 1 },
  { id: "6h", label: "Last 6h", hours: 6 },
  { id: "24h", label: "Last 24h", hours: 24 },
  { id: "7d", label: "Last 7 days", hours: 24 * 7 },
  { id: "30d", label: "Last 30 days", hours: 24 * 30 },
];

/** Returns ISO strings (UTC) for a `hours` window ending now. */
export function rangeForHours(hours: number): { since: string; until: string } {
  const until = new Date();
  const since = new Date(until.getTime() - hours * 3600 * 1000);
  return { since: since.toISOString(), until: until.toISOString() };
}
