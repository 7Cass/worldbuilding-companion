import Link from "next/link";

export type EventBrowserItem = {
  id: string;
  name: string;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export function EventBrowserSurface({ events }: { events: EventBrowserItem[] }) {
  return (
    <main className="grid gap-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Event browser
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Events
        </h2>
      </header>

      <section className="grid gap-3">
        {events.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">No Events synced from Notion yet.</p>
          </article>
        ) : (
          events.map((event) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-4"
              key={event.id}
            >
              <Link
                className="text-lg font-semibold text-slate-950 underline-offset-4 hover:underline"
                href={`/entity-workspace/events/${event.id}`}
              >
                {event.name}
              </Link>
              <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-700">Last edited in Notion</dt>
                  <dd>{formatDate(event.notionLastEditedAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Last synced</dt>
                  <dd>{formatDate(event.lastSyncedAt)}</dd>
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
