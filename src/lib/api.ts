/**
 * Thin fetch wrapper for the m4l-telemetry-api.
 *
 * The API base URL is *always* `/api` in the browser; the dev-server proxies
 * that prefix to whatever backend the user pointed VITE_API_URL at, and in
 * production we expect a reverse-proxy to do the same.  This keeps the
 * frontend bundle environment-agnostic.
 */

const BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const detail =
      body && typeof body === "object" && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : res.statusText;
    throw new ApiError(`API ${res.status}: ${detail}`, res.status, body);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------- types (mirror backend Pydantic schemas) ----------

export type EventKind = "event" | "metric" | "error" | "crash";
export type EventLevel = "info" | "warning" | "error" | "fatal";

export interface EventOut {
  id: string;
  received_at: string;
  vendor: string;
  device_name: string;
  device_version: string;
  device_id: string;
  session_id: string;
  user_id: string;
  platform: string;
  max_version: string;
  kind: EventKind;
  level: EventLevel;
  name: string;
  message: string | null;
  ts: string;
  ts_ms: number;
  value: number | null;
  unit: string | null;
  props: Record<string, unknown>;
}

export interface EventListResponse {
  items: EventOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface VendorStats {
  vendor: string;
  device_name: string;
  device_version: string;
  total: number;
  crashes: number;
  errors: number;
  last_seen: string | null;
}

export interface TimelineBucket {
  bucket: string;
  count: number;
}

export interface FacetResponse {
  vendor: string[];
  device_name: string[];
  device_version: string[];
  device_id: string[];
}

// ---------- list events ----------

export interface ListEventsParams {
  vendor?: string;
  device_name?: string;
  device_version?: string;
  device_id?: string;
  session_id?: string;
  kind?: EventKind[];
  level?: EventLevel[];
  since?: string;
  until?: string;
  q?: string;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

function toQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    if (Array.isArray(v)) {
      for (const item of v) sp.append(k, String(item));
    } else {
      sp.set(k, String(v));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  health: () => request<{ status: string }>("/healthz"),
  ready: () => request<{ status: string }>("/readyz"),

  listEvents: (params: ListEventsParams = {}) =>
    request<EventListResponse>(`/v1/events${toQuery(params as Record<string, unknown>)}`),

  getEvent: (id: string) => request<EventOut>(`/v1/events/${encodeURIComponent(id)}`),

  facets: (sinceHours = 24 * 7) =>
    request<FacetResponse>(`/v1/events/_facets${toQuery({ since_hours: sinceHours })}`),

  vendorStats: (hours = 24) =>
    request<VendorStats[]>(`/v1/stats/recent${toQuery({ hours })}`),

  timeline: (params: {
    hours?: number;
    bucket_minutes?: number;
    kind?: EventKind;
  } = {}) => request<TimelineBucket[]>(`/v1/stats/timeline${toQuery(params as Record<string, unknown>)}`),
};
