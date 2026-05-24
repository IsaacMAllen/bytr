import { useQuery } from "@tanstack/react-query";
import { api, type ListEventsParams } from "./api";

/* Stable query keys (centralised so refetchAll/invalidate works). */
export const qk = {
  health: ["health"] as const,
  events: (params: ListEventsParams) => ["events", params] as const,
  event: (id: string) => ["event", id] as const,
  facets: (sinceHours: number) => ["facets", sinceHours] as const,
  vendorStats: (hours: number) => ["vendor-stats", hours] as const,
  timeline: (hours: number, bucketMin: number, kind?: string) =>
    ["timeline", hours, bucketMin, kind ?? "all"] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: qk.health,
    queryFn: () => api.health(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useEvents(params: ListEventsParams, refetchMs = 0) {
  return useQuery({
    queryKey: qk.events(params),
    queryFn: () => api.listEvents(params),
    placeholderData: (prev) => prev,
    refetchInterval: refetchMs > 0 ? refetchMs : false,
    staleTime: refetchMs > 0 ? 0 : 15_000,
  });
}

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: id ? qk.event(id) : ["event", "none"],
    queryFn: () => api.getEvent(id as string),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useFacets(sinceHours = 24 * 7) {
  return useQuery({
    queryKey: qk.facets(sinceHours),
    queryFn: () => api.facets(sinceHours),
    staleTime: 5 * 60_000,
  });
}

export function useVendorStats(hours = 24) {
  return useQuery({
    queryKey: qk.vendorStats(hours),
    queryFn: () => api.vendorStats(hours),
    staleTime: 60_000,
  });
}

export function useTimeline(hours = 24, bucketMinutes = 15, kind?: string) {
  return useQuery({
    queryKey: qk.timeline(hours, bucketMinutes, kind),
    queryFn: () =>
      api.timeline({
        hours,
        bucket_minutes: bucketMinutes,
        kind: kind as never,
      }),
    staleTime: 60_000,
  });
}
