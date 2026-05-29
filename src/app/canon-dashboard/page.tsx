import { ArrowRight, RefreshCw, Users } from "lucide-react";
import Link from "next/link";

import { loadCanonDashboardFromLocalSidecar } from "@/characters/character-read-flow";
import { Button } from "@/components/ui/button";
import { syncCharactersAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CanonDashboardPage() {
  const result = await loadCanonDashboardFromLocalSidecar();
  const dashboard = result.data;

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
          <Button asChild>
            <Link href="/characters">
              <Users aria-hidden="true" className="size-4" />
              <span>Browse Characters</span>
            </Link>
          </Button>
        </div>
      </header>

      {!result.ok ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {result.error}
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.elementCounts.map((item) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-4"
            key={item.elementType}
          >
            <p className="text-sm font-medium text-slate-600">{item.elementType}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{item.count}</p>
            <p className="mt-1 text-sm text-slate-500">
              {item.elementType === "Character"
                ? "Derived from Notion sync"
                : "Awaiting Notion sync"}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-950">
            Recent Character activity
          </h3>
          <Button asChild variant="secondary">
            <Link href="/characters">
              <span>Characters</span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>

        {dashboard.recentActivity.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">No Character activity synced yet.</p>
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
                <Link href={`/entity-workspace/characters/${activity.entityId}`}>
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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}
