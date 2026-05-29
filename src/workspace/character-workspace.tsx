export type CharacterWorkspaceRecord = {
  id: string;
  name: string;
  notionPageId: string;
  notionUrl: string | null;
  notionCreatedAt: Date;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

const placeholderPanels = [
  "Relationships",
  "Sources",
  "Diagnostics",
  "Review state",
] as const;

export function CharacterWorkspaceSurface({
  character,
}: {
  character: CharacterWorkspaceRecord;
}) {
  return (
    <main className="grid gap-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Entity Workspace
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
            {character.name}
          </h2>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-sm font-medium text-emerald-800">
            Character
          </span>
        </div>
      </header>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-950">Core fields</h3>
          <dl className="mt-3 grid gap-3 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-700">Name</dt>
              <dd>{character.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Notion page id</dt>
              <dd className="break-all">{character.notionPageId}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Notion page</dt>
              <dd>
                {character.notionUrl ? (
                  <a
                    className="text-emerald-700 underline-offset-4 hover:underline"
                    href={character.notionUrl}
                  >
                    Open in Notion
                  </a>
                ) : (
                  "Not recorded"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Last edited in Notion</dt>
              <dd>{formatDate(character.notionLastEditedAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Last synced</dt>
              <dd>{formatDate(character.lastSyncedAt)}</dd>
            </div>
          </dl>
        </article>

        {placeholderPanels.map((panel) => (
          <article
            className="min-h-32 rounded-lg border border-slate-200 bg-white p-4"
            key={panel}
          >
            <h3 className="text-sm font-semibold text-slate-950">{panel}</h3>
            <p className="mt-2 text-sm text-slate-500">
              Placeholder area awaiting derived sidecar state.
            </p>
          </article>
        ))}
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
