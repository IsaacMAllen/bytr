import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { TopBar } from "@/components/TopBar";
import { EventsTable } from "@/components/EventsTable";
import { EventDetailDrawer } from "@/components/EventDetailDrawer";
import { useEvents, useFacets } from "@/lib/queries";
import type { EventKind, EventLevel, ListEventsParams } from "@/lib/api";
import { fmtInt } from "@/lib/utils";
import { rangeForHours, RANGE_PRESETS } from "@/lib/time";

const KIND_OPTIONS: EventKind[] = ["event", "metric", "error", "crash"];
const LEVEL_OPTIONS: EventLevel[] = ["info", "warning", "error", "fatal"];

export function Events() {
  const [params, setParams] = useSearchParams();

  // url-sync state for shareability
  const vendor = params.get("vendor") ?? "";
  const device_name = params.get("device_name") ?? "";
  const device_version = params.get("device_version") ?? "";
  const q = params.get("q") ?? "";
  const kind = (params.getAll("kind") as EventKind[]) ?? [];
  const level = (params.getAll("level") as EventLevel[]) ?? [];
  const hoursStr = params.get("hours") ?? "24";
  const hours = Number(hoursStr) || 24;
  const limit = Number(params.get("limit") ?? 50);
  const offset = Number(params.get("offset") ?? 0);
  const live = params.get("live") === "1";

  // local debounce on the search box so we don't refire per keystroke
  const [qDraft, setQDraft] = useState(q);
  useEffect(() => setQDraft(q), [q]);
  const qDebounceRef = useRef<number | null>(null);

  function patch(updates: Record<string, string | string[] | null | undefined>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(updates)) {
      next.delete(k);
      if (v == null || v === "") continue;
      if (Array.isArray(v)) {
        for (const item of v) next.append(k, item);
      } else {
        next.set(k, v);
      }
    }
    if (!("offset" in updates)) next.set("offset", "0");
    setParams(next, { replace: true });
  }

  const range = useMemo(() => rangeForHours(hours), [hours]);
  const queryParams: ListEventsParams = {
    vendor: vendor || undefined,
    device_name: device_name || undefined,
    device_version: device_version || undefined,
    q: q || undefined,
    kind: kind.length ? kind : undefined,
    level: level.length ? level : undefined,
    since: range.since,
    limit,
    offset,
    order: "desc",
  };

  const { data, isLoading, isFetching } = useEvents(
    queryParams,
    live ? 5_000 : 0,
  );
  const { data: facets } = useFacets(24 * 30);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const total = data?.total ?? 0;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + limit, total);

  const hasFilters =
    vendor || device_name || device_version || q || kind.length > 0 || level.length > 0;

  return (
    <>
      <TopBar
        title="Events"
        subtitle="Filter, search and inspect every event ingested from bz.telemetry"
      />
      <div className="flex flex-1 flex-col gap-3 px-6 py-5">
        {/* Filter bar */}
        <Card>
          <div className="grid grid-cols-1 gap-2 px-3 py-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-4">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Search
              </label>
              <Input
                leftIcon={<Search size={14} />}
                placeholder="name or message…"
                value={qDraft}
                onChange={(e) => {
                  const v = e.target.value;
                  setQDraft(v);
                  if (qDebounceRef.current) window.clearTimeout(qDebounceRef.current);
                  qDebounceRef.current = window.setTimeout(() => patch({ q: v }), 250);
                }}
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Select
                label="Range"
                value={String(hours)}
                onChange={(e) => patch({ hours: e.target.value })}
              >
                {RANGE_PRESETS.map((r) => (
                  <option key={r.id} value={r.hours}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select
                label="Vendor"
                value={vendor}
                onChange={(e) => patch({ vendor: e.target.value })}
              >
                <option value="">all</option>
                {facets?.vendor.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select
                label="Device"
                value={device_name}
                onChange={(e) => patch({ device_name: e.target.value })}
              >
                <option value="">all</option>
                {facets?.device_name.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select
                label="Version"
                value={device_version}
                onChange={(e) => patch({ device_version: e.target.value })}
              >
                <option value="">all</option>
                {facets?.device_version.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 px-3 py-2.5">
            <span className="mr-1 text-[10px] uppercase tracking-wider text-slate-500">
              kind
            </span>
            {KIND_OPTIONS.map((k) => {
              const active = kind.includes(k);
              return (
                <button
                  key={k}
                  onClick={() => {
                    const next = active ? kind.filter((x) => x !== k) : [...kind, k];
                    patch({ kind: next });
                  }}
                  className={
                    "rounded-md border px-2 py-0.5 text-xs transition-colors " +
                    (active
                      ? "border-sky-500/40 bg-sky-500/10 text-sky-200"
                      : "border-slate-700 bg-slate-800/40 text-slate-400 hover:text-slate-200")
                  }
                >
                  {k}
                </button>
              );
            })}
            <span className="ml-3 mr-1 text-[10px] uppercase tracking-wider text-slate-500">
              level
            </span>
            {LEVEL_OPTIONS.map((l) => {
              const active = level.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => {
                    const next = active ? level.filter((x) => x !== l) : [...level, l];
                    patch({ level: next });
                  }}
                  className={
                    "rounded-md border px-2 py-0.5 text-xs transition-colors " +
                    (active
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                      : "border-slate-700 bg-slate-800/40 text-slate-400 hover:text-slate-200")
                  }
                >
                  {l}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2">
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={() => setParams(new URLSearchParams())}>
                  <X size={11} /> clear
                </Button>
              )}
              {/*
                Keying the button on `live` forces a clean unmount/remount when
                toggling, which dodges a stale-DOM crash we hit with
                lucide-react icon swaps + StrictMode double-render.
              */}
              <Button
                key={live ? "live" : "paused"}
                variant={live ? "primary" : "outline"}
                size="sm"
                onClick={() => patch({ live: live ? null : "1", offset: "0" })}
                title={live ? "Pause live polling" : "Live-tail every 5s"}
              >
                {live ? (
                  <>
                    <Pause size={11} />
                    <span>live · 5s</span>
                  </>
                ) : (
                  <>
                    <Play size={11} />
                    <span>live tail</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span>Results</span>
              <Badge tone="slate" className="ml-2">
                {fmtInt(total)} total
              </Badge>
              {isFetching && !isLoading && (
                <Badge tone="sky" className="ml-2">refreshing…</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Select
                value={String(limit)}
                onChange={(e) => patch({ limit: e.target.value })}
                className="w-24"
              >
                {[25, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={offset === 0}
                onClick={() =>
                  setParams((p) => {
                    const np = new URLSearchParams(p);
                    np.set("offset", String(Math.max(0, offset - limit)));
                    return np;
                  }, { replace: true })
                }
              >
                <ChevronLeft size={13} />
              </Button>
              <span className="text-xs text-slate-400 tabular-nums">
                {fmtInt(pageStart)}–{fmtInt(pageEnd)} / {fmtInt(total)}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={pageEnd >= total}
                onClick={() =>
                  setParams((p) => {
                    const np = new URLSearchParams(p);
                    np.set("offset", String(offset + limit));
                    return np;
                  }, { replace: true })
                }
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </CardHeader>
          <EventsTable
            rows={data?.items ?? []}
            loading={isLoading}
            onSelect={(e) => setSelectedId(e.id)}
            selectedId={selectedId}
          />
        </Card>
      </div>

      <EventDetailDrawer eventId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
