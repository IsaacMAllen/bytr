import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function Empty({
  title = "No data",
  description,
  className,
  icon,
}: {
  title?: string;
  description?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-14 text-center text-slate-400",
        className,
      )}
    >
      <div className="rounded-full border border-slate-800 bg-slate-900/60 p-3 text-slate-500">
        {icon ?? <Inbox size={20} />}
      </div>
      <div className="text-sm font-medium text-slate-200">{title}</div>
      {description && <p className="max-w-md text-xs text-slate-400">{description}</p>}
    </div>
  );
}
