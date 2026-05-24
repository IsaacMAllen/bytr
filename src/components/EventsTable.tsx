import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { absTime, clockTime } from "@/lib/time";
import { truncate } from "@/lib/utils";
import { KindBadge } from "@/components/KindBadge";
import { LevelBadge } from "@/components/LevelBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import type { EventOut } from "@/lib/api";

export function EventsTable({
  rows,
  loading,
  onSelect,
  selectedId,
}: {
  rows: EventOut[];
  loading?: boolean;
  onSelect?: (e: EventOut) => void;
  selectedId?: string | null;
}) {
  const columns = useMemo<ColumnDef<EventOut>[]>(
    () => [
      {
        id: "ts",
        header: "Time",
        accessorKey: "ts",
        cell: ({ row }) => (
          <div title={absTime(row.original.ts)} className="font-mono text-xs text-slate-300">
            {clockTime(row.original.ts)}
          </div>
        ),
      },
      {
        id: "kind",
        header: "Kind",
        cell: ({ row }) => <KindBadge kind={row.original.kind} />,
      },
      {
        id: "level",
        header: "Level",
        cell: ({ row }) => <LevelBadge level={row.original.level} />,
      },
      {
        id: "device",
        header: "Device",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate text-sm text-slate-200">
              {row.original.device_name}{" "}
              <span className="text-slate-500">{row.original.device_version}</span>
            </div>
            <div className="truncate text-[11px] text-slate-500">
              {row.original.vendor} ·{" "}
              <span className="font-mono">
                {row.original.device_id.slice(0, 8)}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-100">{row.original.name}</span>
        ),
      },
      {
        id: "message",
        header: "Message",
        cell: ({ row }) => (
          <span className="truncate text-xs text-slate-300">
            {truncate(row.original.message, 120) || (
              <span className="text-slate-600">—</span>
            )}
          </span>
        ),
      },
      {
        id: "value",
        header: "Value",
        cell: ({ row }) =>
          row.original.value != null ? (
            <span className="font-mono text-xs text-slate-200">
              {row.original.value}
              {row.original.unit ? (
                <span className="ml-1 text-slate-500">{row.original.unit}</span>
              ) : null}
            </span>
          ) : (
            <span className="text-slate-700">—</span>
          ),
      },
      {
        id: "chevron",
        header: "",
        cell: () => <ChevronRight className="text-slate-600" size={14} />,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading && rows.length === 0) {
    return (
      <div className="space-y-1.5 p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <Empty
        title="No events match"
        description="Try widening the time range or clearing filters."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="border-b border-slate-800 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((r) => {
            const isSel = selectedId === r.original.id;
            return (
              <tr
                key={r.id}
                onClick={() => onSelect?.(r.original)}
                className={
                  "group cursor-pointer transition-colors " +
                  (isSel
                    ? "bg-sky-500/10"
                    : "hover:bg-slate-800/40")
                }
              >
                {r.getVisibleCells().map((c) => (
                  <td
                    key={c.id}
                    className="border-b border-slate-800/60 px-3 py-2 align-middle"
                  >
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
