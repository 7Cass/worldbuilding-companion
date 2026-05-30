import { notFound } from "next/navigation";

import { loadLoreEntryWorkspaceFromLocalSidecar } from "@/characters/character-read-flow";
import { LoreEntryWorkspaceSurface } from "@/workspace/lore-entry-workspace";

export const dynamic = "force-dynamic";

export default async function LoreEntryWorkspacePage({
  params,
}: {
  params: Promise<{
    loreEntryId: string;
  }>;
}) {
  const { loreEntryId } = await params;
  const result = await loadLoreEntryWorkspaceFromLocalSidecar(loreEntryId);

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
      <LoreEntryWorkspaceSurface loreEntry={result.data} />
    </div>
  );
}
