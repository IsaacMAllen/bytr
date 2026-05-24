import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { TimelineBucket } from "@/lib/api";

export function TimelineChart({
  data,
  height = 220,
}: {
  data: TimelineBucket[] | undefined;
  height?: number;
}) {
  const series = useMemo(
    () =>
      (data ?? []).map((b) => ({
        ts: parseISO(b.bucket).getTime(),
        count: b.count,
      })),
    [data],
  );

  if (!series.length) {
    return (
      <div
        className="grid place-items-center text-xs text-slate-500"
        style={{ height }}
      >
        no events in window
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="bytr-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(56 189 248)" stopOpacity={0.5} />
            <stop offset="95%" stopColor="rgb(56 189 248)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgb(30 41 59 / 0.7)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="ts"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(v) => format(new Date(v), "HH:mm")}
          stroke="rgb(100 116 139)"
          tick={{ fontSize: 11 }}
          tickMargin={6}
          axisLine={false}
          tickLine={false}
          minTickGap={32}
        />
        <YAxis
          stroke="rgb(100 116 139)"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          cursor={{ stroke: "rgb(56 189 248 / 0.25)", strokeWidth: 1 }}
          contentStyle={{
            background: "rgb(15 23 42)",
            border: "1px solid rgb(30 41 59)",
            borderRadius: 8,
            color: "rgb(226 232 240)",
            fontSize: 12,
          }}
          labelFormatter={(v) => format(new Date(v as number), "PPpp")}
          formatter={(v: number) => [v, "events"]}
        />
        <Area
          dataKey="count"
          stroke="rgb(56 189 248)"
          strokeWidth={2}
          fill="url(#bytr-area)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
