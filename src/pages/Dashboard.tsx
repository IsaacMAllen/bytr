import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Cpu,
  Skull,
  Calendar,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Empty } from "@/components/ui/Empty";
import { Skeleton } from "@/components/ui/Skeleton";
import { TopBar } from "@/components/TopBar";
import { TimelineChart } from "@/components/TimelineChart";
import { StatCard } from "@/components/StatCard";
import { EventsTable } from "@/components/EventsTable";
import { EventDetailDrawer } from "@/components/EventDetailDrawer";
import { useEvents, useTimeline, useVendorStats } from "@/lib/queries";
import { fmtInt } from "@/lib/utils";
import { relTime } from "@/lib/time";
import { RANGE_PRESETS } from "@/lib/time";

export function Dashboard() {
  const [hours, setHours] = useState(24);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: vendorStats, isLoading: statsLoading } = useVendorStats(hours);
  const bucketMin = hours <= 6 ? 5 : hours <= 24 ? 15 : hours <= 24 * 7 ? 60 : 240;
  const { data: timelineAll } = useTimeline(hours, bucketMin);
  const { data: timelineErr } = useTimeline(hours, bucketMin, "error");
  const { data: timelineCrash } = useTimeline(hours, bucketMin, "crash");

  const { data: recent, isLoading: recentLoading } = useEvents(
    { limit: 8, order: "desc" },
    10_000, // poll the dashboard every 10s
  );

  const totals = useMemo(() => {
    const stats = vendorStats ?? [];
    const total = stats.reduce((a, s) => a + s.total, 0);
    const errors = stats.reduce((a, s) => a + s.errors, 0);
    const crashes = stats.reduce((a, s) => a + s.crashes, 0);
    const devices = new Set(stats.map((s) => `${s.vendor}/${s.device_name}/${s.device_version}`)).size;
    return { total, errors, crashes, devices };
  }, [vendorStats]);

  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle="Overview of telemetry traffic and health"
      />
      <div className="flex-1 space-y-4 px-6 py-5">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
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
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Events"
            value={totals.total}
            hint={`in the last ${RANGE_PRESETS.find((p) => p.hours === hours)?.label.toLowerCase() ?? `${hours}h`}`}
            icon={<Activity size={14} />}
            loading={statsLoading}
          />
          <StatCard
            label="Errors"
            value={totals.errors}
            tone="warn"
            icon={<AlertTriangle size={14} />}
            loading={statsLoading}
          />
          <StatCard
            label="Crashes"
            value={totals.crashes}
            tone="danger"
            icon={<Skull size={14} />}
            loading={statsLoading}
          />
          <StatCard
            label="Active devices"
            value={totals.devices}
            tone="good"
            icon={<Cpu size={14} />}
            loading={statsLoading}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event timeline</CardTitle>
            <div className="flex items-center gap-3 text-[11px]">
              <Legend dot="rgb(56 189 248)" label="all" />
              <Legend dot="rgb(251 191 36)" label="errors" />
              <Legend dot="rgb(248 113 113)" label="crashes" />
            </div>
          </CardHeader>
          <CardBody className="px-2 py-3">
            <TimelineChart data={timelineAll} />
            {(timelineErr?.some((b) => b.count > 0) ||
              timelineCrash?.some((b) => b.count > 0)) && (
              <div className="mt-2 grid grid-cols-2 gap-3 px-2">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                    errors
                  </div>
                  <TimelineChart data={timelineErr} height={80} />
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                    crashes
                  </div>
                  <TimelineChart data={timelineCrash} height={80} />
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent events</CardTitle>
              <span className="text-[11px] text-slate-500">live · refreshes every 10s</span>
            </CardHeader>
            <EventsTable
              rows={recent?.items ?? []}
              loading={recentLoading}
              onSelect={(e) => setSelectedId(e.id)}
              selectedId={selectedId}
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Devices rollup</CardTitle>
              <span className="text-[11px] text-slate-500">
                {fmtInt(vendorStats?.length)} unique builds
              </span>
            </CardHeader>
            {statsLoading ? (
              <div className="space-y-1.5 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !vendorStats || vendorStats.length === 0 ? (
              <Empty title="No devices reporting" description="Send some events from bz.telemetry to see them here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="border-b border-slate-800 px-3 py-2 text-left">Vendor</th>
                      <th className="border-b border-slate-800 px-3 py-2 text-left">Device</th>
                      <th className="border-b border-slate-800 px-3 py-2 text-left">Version</th>
                      <th className="border-b border-slate-800 px-3 py-2 text-right">Events</th>
                      <th className="border-b border-slate-800 px-3 py-2 text-right">Errors</th>
                      <th className="border-b border-slate-800 px-3 py-2 text-right">Crashes</th>
                      <th className="border-b border-slate-800 px-3 py-2 text-right">Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorStats.map((s) => (
                      <tr
                        key={`${s.vendor}/${s.device_name}/${s.device_version}`}
                        className="hover:bg-slate-800/40"
                      >
                        <td className="border-b border-slate-800/60 px-3 py-2 text-slate-300">
                          {s.vendor}
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-2 font-medium text-slate-100">
                          {s.device_name}
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-2 font-mono text-xs text-slate-400">
                          {s.device_version}
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-2 text-right font-mono text-slate-200">
                          {fmtInt(s.total)}
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-2 text-right font-mono text-amber-300">
                          {fmtInt(s.errors)}
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-2 text-right font-mono text-rose-300">
                          {fmtInt(s.crashes)}
                        </td>
                        <td className="border-b border-slate-800/60 px-3 py-2 text-right text-[11px] text-slate-400">
                          {relTime(s.last_seen)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <EventDetailDrawer eventId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-slate-500">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: dot }}
      />
      {label}
    </span>
  );
}
