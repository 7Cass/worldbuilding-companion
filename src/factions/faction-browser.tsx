import Link from "next/link";

export type FactionBrowserItem = {
  id: string;
  name: string;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export function FactionBrowserSurface({
  factions,
}: {
  factions: FactionBrowserItem[];
}) {
  return (
    <main className="grid gap-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Faction browser
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Factions
        </h2>
      </header>

      <section className="grid gap-3">
        {factions.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">No Factions synced from Notion yet.</p>
          </article>
        ) : (
          factions.map((faction) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-4"
              key={faction.id}
            >
              <Link
                className="text-lg font-semibold text-slate-950 underline-offset-4 hover:underline"
                href={`/entity-workspace/factions/${faction.id}`}
              >
                {faction.name}
              </Link>
              <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-700">Last edited in Notion</dt>
                  <dd>{formatDate(faction.notionLastEditedAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Last synced</dt>
                  <dd>{formatDate(faction.lastSyncedAt)}</dd>
                </div>
              </dl>
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
