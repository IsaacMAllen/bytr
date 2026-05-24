import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListTree, Cpu, Github } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/events", icon: ListTree, label: "Events" },
  { to: "/devices", icon: Cpu, label: "Devices" },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-950/50 px-3 py-4">
      <div className="mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-sky-400 to-violet-500 text-slate-950 font-black">
            b
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-100">bytr</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              telemetry inspector
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-slate-800/80 text-slate-100"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200",
              )
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2 py-2 text-xs text-slate-500">
        <a
          className="flex items-center gap-1.5 hover:text-slate-300"
          href="https://github.com/bugbytz"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Github size={12} /> bugbytz / m4l-telemetry
        </a>
        <div className="mt-1 text-[10px] tracking-wider text-slate-600">
          v0.1.0 — local dev
        </div>
      </div>
    </aside>
  );
}
