import { AlertTriangle, Activity, Bug, Skull } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { EventKind } from "@/lib/api";

const META: Record<
  EventKind,
  {
    tone: React.ComponentProps<typeof Badge>["tone"];
    icon: React.ReactNode;
    label: string;
  }
> = {
  event: { tone: "sky", icon: <Activity size={11} />, label: "event" },
  metric: { tone: "violet", icon: <Activity size={11} />, label: "metric" },
  error: { tone: "amber", icon: <AlertTriangle size={11} />, label: "error" },
  crash: { tone: "red", icon: <Skull size={11} />, label: "crash" },
};

export function KindBadge({ kind }: { kind: EventKind }) {
  const m = META[kind] ?? { tone: "slate" as const, icon: <Bug size={11} />, label: kind };
  return (
    <Badge tone={m.tone} className="font-mono uppercase">
      {m.icon}
      {m.label}
    </Badge>
  );
}
