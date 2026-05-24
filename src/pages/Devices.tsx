import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { TopBar } from "@/components/TopBar";
import { useEvents, useVendorStats } from "@/lib/queries";
import { fmtInt } from "@/lib/utils";
import { absTime, RANGE_PRESETS, rangeForHours, relTime } from "@/lib/time";
import { Badge } from "@/components/ui/Badge";

export function Devices() {
  const [hours, setHours] = useState(24 * 7);
  const navigate = useNavigate();

  const { data: stats, isLoading } = useVendorStats(hours);

  // For each device build a sparkline of "events per hour bucket".  This is
  // a single aggregate fetch (the events list endpoint with kind=event) -- we
  // group client-side because the dataset is small (<= ~5k events).
  const range = useMemo(() => rangeForHours(hours), [hours]);
  const { data: events } = useEvents(
    {
      since: range.since,
      limit: 500,
      order: "asc",
    },
    0,
  );

  const sparkBuckets = hours <= 24 ? 24 : hours <= 24 * 7 ? 14 * 12 : 30;
  const bucketMs = ((hours * 3600) / sparkBuckets) * 1000;

  const sparklineByKey = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const e of events?.items ?? []) {
      const key = `${e.vendor}/${e.device_name}/${e.device_version}`;
      const arr = map.get(key) ?? new Array(sparkBuckets).fill(0);
      const idx = Math.min(
        sparkBuckets - 1,
        Math.max(0, Math.floor((Date.parse(e.ts) - Date.parse(range.since)) / bucketMs)),
      );
      arr[idx] = (arr[idx] ?? 0) + 1;
      map.set(key, arr);
    }
    return map;
  }, [events, sparkBuckets, range.since, bucketMs]);

  return (
    <>
      <TopBar
        title="Devices"
        subtitle="Per-build rollup with traffic sparkline"
      />
      <div className="flex-1 px-6 py-5">
        <div className="mb-4 flex items-center justify-end gap-2">
          <Calendar size={14} className="text-slate-500" />
          <Select
            value={String(hours)}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-40"
          >
            {RANGE_PRESETS.map((r) => (
              <option key={r.id} value={r.hours}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Builds reporting</CardTitle>
            <span className="text-[11px] text-slate-500">
              {fmtInt(stats?.length)} unique
            </span>
          </CardHeader>

          {isLoading ? (
            <div className="space-y-1.5 p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !stats || stats.length === 0 ? (
            <Empty title="No devices reporting in this window" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="border-b border-slate-800 px-3 py-2 text-left">Build</th>
                    <th className="border-b border-slate-800 px-3 py-2 text-left">Sparkline</th>
                    <th className="border-b border-slate-800 px-3 py-2 text-right">Events</th>
                    <th className="border-b border-slate-800 px-3 py-2 text-right">Errors</th>
                    <th className="border-b border-slate-800 px-3 py-2 text-right">Crashes</th>
                    <th className="border-b border-slate-800 px-3 py-2 text-right">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => {
                    const key = `${s.vendor}/${s.device_name}/${s.device_version}`;
                    const buckets = sparklineByKey.get(key);
                    return (
                      <tr
                        key={key}
                        className="cursor-pointer hover:bg-slate-800/40"
                        onClick={() => {
                          const sp = new URLSearchParams();
                          sp.set("vendor", s.vendor);
                          sp.set("device_name", s.device_name);
                          sp.set("device_version", s.device_version);
                          sp.set("hours", String(hours));
                          navigate(`/events?${sp.toString()}`);
                        }}
                      >
                        <td className="border-b border-slate-800/60 px-3 py-3">
                          <div className="font-medium text-slate-100">
                            {s.device_name}{" "}
                            <Badge tone="slate" className="ml-1 font-mono">
                              {s.device_version}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-500">{s.vendor}</div>
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-3">
                          <div className="h-7 w-40">
                            {buckets ? <Spark data={buckets} /> : (
                              <span className="text-[11px] text-slate-600">—</span>
                            )}
                          </div>
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-3 text-right font-mono text-slate-200">
                          {fmtInt(s.total)}
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-3 text-right font-mono text-amber-300">
                          {fmtInt(s.errors)}
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-3 text-right font-mono text-rose-300">
                          {fmtInt(s.crashes)}
                        </td>
                        <td
                          className="border-b border-slate-800/60 px-3 py-3 text-right text-[11px] text-slate-400"
                          title={s.last_seen ? absTime(s.last_seen) : "never"}
                        >
                          {relTime(s.last_seen)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function Spark({ data }: { data: number[] }) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={series}>
        <Tooltip
          cursor={{ fill: "rgb(56 189 248 / 0.08)" }}
          contentStyle={{
            background: "rgb(15 23 42)",
            border: "1px solid rgb(30 41 59)",
            borderRadius: 6,
            color: "rgb(226 232 240)",
            fontSize: 11,
            padding: "4px 6px",
          }}
          formatter={(v: number) => [v, "events"]}
          labelFormatter={() => ""}
        />
        <Bar dataKey="v" fill="rgb(56 189 248 / 0.7)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
