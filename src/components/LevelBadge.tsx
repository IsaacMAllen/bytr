import { Badge } from "@/components/ui/Badge";
import type { EventLevel } from "@/lib/api";

const TONE: Record<EventLevel, React.ComponentProps<typeof Badge>["tone"]> = {
  info: "slate",
  warning: "amber",
  error: "rose",
  fatal: "red",
};

export function LevelBadge({ level }: { level: EventLevel }) {
  return (
    <Badge tone={TONE[level] ?? "slate"} className="font-mono lowercase">
      {level}
    </Badge>
  );
}
