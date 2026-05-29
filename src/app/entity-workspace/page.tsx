const workspacePanels = ["Summary", "Fields", "Relationships", "Sources", "Diagnostics", "Review state"];

export default function EntityWorkspacePage() {
  return (
    <main className="grid gap-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Entity Workspace
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Selected Canon element
        </h2>
      </header>

      <section className="grid gap-3 lg:grid-cols-2">
        {workspacePanels.map((panel) => (
          <article className="min-h-32 rounded-lg border border-slate-200 bg-white p-4" key={panel}>
            <h3 className="text-sm font-semibold text-slate-950">{panel}</h3>
            <p className="mt-2 text-sm text-slate-500">No derived state loaded.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
