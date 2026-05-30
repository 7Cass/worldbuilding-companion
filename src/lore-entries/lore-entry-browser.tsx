import Link from "next/link";

import type { LoreEntrySubtype } from "@/notion/lore-entry-sync";

export type LoreEntryBrowserItem = {
  id: string;
  name: string;
  subtype: LoreEntrySubtype;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export function LoreEntryBrowserSurface({
  loreEntries,
}: {
  loreEntries: LoreEntryBrowserItem[];
}) {
  return (
    <main className="grid gap-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Lore Entry browser
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Lore Entries
        </h2>
      </header>

      <section className="grid gap-3">
        {loreEntries.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">
              No Lore Entries synced from Notion yet.
            </p>
          </article>
        ) : (
          loreEntries.map((loreEntry) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-4"
              key={loreEntry.id}
            >
              <Link
                className="text-lg font-semibold text-slate-950 underline-offset-4 hover:underline"
                href={`/entity-workspace/lore-entries/${loreEntry.id}`}
              >
                {loreEntry.name}
              </Link>
              <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <div>
                  <dt className="font-medium text-slate-700">Subtype</dt>
                  <dd>{loreEntry.subtype}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Last edited in Notion</dt>
                  <dd>{formatDate(loreEntry.notionLastEditedAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Last synced</dt>
                  <dd>{formatDate(loreEntry.lastSyncedAt)}</dd>
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
