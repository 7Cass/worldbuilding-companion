import { notFound } from "next/navigation";

import { loadEventWorkspaceFromLocalSidecar } from "@/characters/character-read-flow";
import { EventWorkspaceSurface } from "@/workspace/event-workspace";

export const dynamic = "force-dynamic";

export default async function EventWorkspacePage({
  params,
}: {
  params: Promise<{
    eventId: string;
  }>;
}) {
  const { eventId } = await params;
  const result = await loadEventWorkspaceFromLocalSidecar(eventId);

  if (!result.data) {
    notFound();
  }

  return (
    <div className="grid gap-4">
      {!result.ok ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {result.error}
        </section>
      ) : null}
      <EventWorkspaceSurface event={result.data} />
    </div>
  );
}
