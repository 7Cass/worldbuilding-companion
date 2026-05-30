import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flag,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CanonDashboard } from "./canon-dashboard";

type CanonDashboardSurfaceProps = {
  dashboard: CanonDashboard;
  error?: string;
  syncCharactersAction: () => void | Promise<void>;
  syncLocationsAction: () => void | Promise<void>;
  syncFactionsAction: () => void | Promise<void>;
  syncEventsAction: () => void | Promise<void>;
  syncLoreEntriesAction: () => void | Promise<void>;
};

export function CanonDashboardSurface({
  dashboard,
  error,
  syncCharactersAction,
  syncLocationsAction,
  syncFactionsAction,
  syncEventsAction,
  syncLoreEntriesAction,
}: CanonDashboardSurfaceProps) {
  return (
    <main className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Canon Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            Canon shape
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={syncCharactersAction}>
            <Button type="submit" variant="secondary">
              <RefreshCw aria-hidden="true" className="size-4" />
              <span>Sync Characters</span>
            </Button>
          </form>
          <form action={syncLocationsAction}>
            <Button type="submit" variant="secondary">
              <RefreshCw aria-hidden="true" className="size-4" />
              <span>Sync Locations</span>
            </Button>
          </form>
          <form action={syncFactionsAction}>
            <Button type="submit" variant="secondary">
              <RefreshCw aria-hidden="true" className="size-4" />
              <span>Sync Factions</span>
            </Button>
          </form>
          <form action={syncEventsAction}>
            <Button type="submit" variant="secondary">
              <RefreshCw aria-hidden="true" className="size-4" />
              <span>Sync Events</span>
            </Button>
          </form>
          <form action={syncLoreEntriesAction}>
            <Button type="submit" variant="secondary">
              <RefreshCw aria-hidden="true" className="size-4" />
              <span>Sync Lore Entries</span>
            </Button>
          </form>
          <Button asChild>
            <Link href="/characters">
              <Users aria-hidden="true" className="size-4" />
              <span>Browse Characters</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/locations">
              <MapPin aria-hidden="true" className="size-4" />
              <span>Browse Locations</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/factions">
              <Flag aria-hidden="true" className="size-4" />
              <span>Browse Factions</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/events">
              <CalendarDays aria-hidden="true" className="size-4" />
              <span>Browse Events</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/lore-entries">
              <BookOpen aria-hidden="true" className="size-4" />
              <span>Browse Lore Entries</span>
            </Link>
          </Button>
        </div>
      </header>

      {error ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </section>
      ) : null}

      <section className="grid gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Sync freshness</h3>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {dashboard.syncStates.map((syncState) => {
            const isFailed = syncState.status === "failed";
            const Icon = isFailed ? AlertTriangle : CheckCircle2;

            return (
              <article
                className="rounded-lg border border-slate-200 bg-white p-4"
                key={syncState.source}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {syncState.source}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-950">
                      <Icon
                        aria-hidden="true"
                        className={isFailed ? "size-5 text-amber-600" : "size-5 text-emerald-600"}
                      />
                      {formatFreshness(syncState.freshness)}
                    </p>
                  </div>
                  <dl className="grid gap-2 text-sm text-slate-600 sm:min-w-56">
                    <div>
                      <dt className="font-medium text-slate-700">Current status</dt>
                      <dd>{formatStatus(syncState.status)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700">
                        Last successful sync
                      </dt>
                      <dd>
                        {syncState.lastSucceededAt
                          ? formatDate(syncState.lastSucceededAt)
                          : "Not synced yet"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {syncState.failure ? (
                  <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                    <p className="font-medium">Needs attention</p>
                    <p className="mt-1 text-amber-900">{syncState.failure.message}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.elementCounts.map((item) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-4"
            key={item.elementType}
          >
            <p className="text-sm font-medium text-slate-600">{item.elementType}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{item.count}</p>
            <p className="mt-1 text-sm text-slate-500">
              {item.elementType === "Character" ||
              item.elementType === "Location" ||
              item.elementType === "Faction" ||
              item.elementType === "Event" ||
              item.elementType === "Lore Entry"
                ? "Derived from Notion sync"
                : "Awaiting Notion sync"}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-950">
            Recent Canon activity
          </h3>
        </div>

        {dashboard.recentActivity.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">No Canon activity synced yet.</p>
          </article>
        ) : (
          dashboard.recentActivity.map((activity) => (
            <article
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              key={activity.entityId}
            >
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {activity.elementType}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {activity.label}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(activity.happenedAt)}
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href={workspaceHrefFor(activity)}>
                  <span>Open workspace</span>
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function workspaceHrefFor(activity: CanonDashboard["recentActivity"][number]): string {
  if (activity.elementType === "Location") {
    return `/entity-workspace/locations/${activity.entityId}`;
  }

  if (activity.elementType === "Faction") {
    return `/entity-workspace/factions/${activity.entityId}`;
  }

  if (activity.elementType === "Event") {
    return `/entity-workspace/events/${activity.entityId}`;
  }

  if (activity.elementType === "Lore Entry") {
    return `/entity-workspace/lore-entries/${activity.entityId}`;
  }

  return `/entity-workspace/characters/${activity.entityId}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

function formatFreshness(freshness: string): string {
  return formatLabel(freshness);
}

function formatStatus(status: string): string {
  return formatLabel(status);
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
