import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Flag,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { CANON_NAVIGATION_ITEMS } from "@/domain/canon-vocabulary";

const navigationIcons = {
  Setup: Settings,
  "Canon Dashboard": LayoutDashboard,
  Characters: Users,
  Locations: MapPin,
  Factions: Flag,
  Events: CalendarDays,
  "Entity Workspace": BookOpen,
  "Review Queue": ClipboardList,
} as const;

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Worldbuilding Companion
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950">Canon</h1>
          </div>
          <nav aria-label="Primary navigation" className="grid gap-1">
            {CANON_NAVIGATION_ITEMS.map((item) => {
              const Icon = navigationIcons[item.label];

              return (
                <Link
                  className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-emerald-600"
                  href={item.href}
                  key={item.href}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
