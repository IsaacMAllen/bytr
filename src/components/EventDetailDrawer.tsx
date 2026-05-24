import { useEffect } from "react";
import { Copy, X, ExternalLink, Hash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { KindBadge } from "@/components/KindBadge";
import { LevelBadge } from "@/components/LevelBadge";
import { JsonView } from "@/components/JsonView";
import { absTime, relTime } from "@/lib/time";
import { copyText } from "@/lib/utils";
import { useEvent } from "@/lib/queries";

export function EventDetailDrawer({
  eventId,
  onClose,
}: {
  eventId: string | null;
  onClose: () => void;
}) {
  const { data: event, isLoading } = useEvent(eventId);

  useEffect(() => {
    if (!eventId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [eventId, onClose]);

  if (!eventId) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal
        className="relative h-full w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-slate-950 shadow-2xl animate-fade-in"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {event && <KindBadge kind={event.kind} />}
              {event && <LevelBadge level={event.level} />}
              <span className="truncate font-mono text-sm text-slate-200">
                {event?.name ?? "—"}
              </span>
            </div>
            <div
              className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500"
              title={eventId}
            >
              <Hash size={10} />
              <span className="font-mono">{eventId}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </header>

        <div className="p-5">
          {isLoading || !event ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          ) : (
            <>
              <Section title="Summary">
                <KV k="message" v={event.message ?? "—"} mono />
                {event.value != null && (
                  <KV
                    k="value"
                    v={`${event.value}${event.unit ? ` ${event.unit}` : ""}`}
                    mono
                  />
                )}
                <KV k="ts" v={`${absTime(event.ts)}  ·  ${relTime(event.ts)}`} mono />
                <KV k="received_at" v={absTime(event.received_at)} mono />
              </Section>

              <Section title="Device">
                <KV k="vendor" v={event.vendor} mono />
                <KV k="device_name" v={event.device_name} mono />
                <KV k="device_version" v={event.device_version} mono />
                <KV k="device_id" v={event.device_id} mono copy />
                <KV k="session_id" v={event.session_id} mono copy />
                <KV k="user_id" v={event.user_id || "—"} mono />
              </Section>

              <Section title="Environment">
                <KV k="platform" v={event.platform} mono />
                <KV k="max_version" v={event.max_version} mono />
                <KV k="ts_ms" v={String(event.ts_ms)} mono />
              </Section>

              <Section
                title="Props"
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const ok = await copyText(JSON.stringify(event.props, null, 2));
                      toast[ok ? "success" : "error"](
                        ok ? "Props copied" : "Copy failed",
                      );
                    }}
                  >
                    <Copy size={11} /> copy
                  </Button>
                }
              >
                {Object.keys(event.props ?? {}).length === 0 ? (
                  <div className="text-xs text-slate-500">no extra props</div>
                ) : (
                  <JsonView value={event.props} />
                )}
              </Section>

              <Section
                title="Raw envelope"
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const ok = await copyText(JSON.stringify(event, null, 2));
                      toast[ok ? "success" : "error"](
                        ok ? "Envelope copied" : "Copy failed",
                      );
                    }}
                  >
                    <Copy size={11} /> copy
                  </Button>
                }
              >
                <JsonView value={event} />
              </Section>

              <div className="mt-4 flex justify-end">
                <a
                  href={`/api/v1/events/${event.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300"
                >
                  open raw API response <ExternalLink size={11} />
                </a>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <div className="mb-1.5 flex items-center justify-between">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </h4>
        {action}
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5">
        {children}
      </div>
    </section>
  );
}

function KV({
  k,
  v,
  mono,
  copy,
}: {
  k: string;
  v: string;
  mono?: boolean;
  copy?: boolean;
}) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-2 py-0.5 text-xs">
      <div className="text-slate-500">{k}</div>
      <div
        className={"truncate text-slate-200 " + (mono ? "font-mono" : "")}
        title={v}
      >
        {v}
      </div>
      {copy ? (
        <button
          className="text-slate-600 hover:text-slate-300"
          onClick={async (e) => {
            e.stopPropagation();
            const ok = await copyText(v);
            toast[ok ? "success" : "error"](ok ? "Copied" : "Copy failed");
          }}
          aria-label={`Copy ${k}`}
        >
          <Copy size={11} />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
