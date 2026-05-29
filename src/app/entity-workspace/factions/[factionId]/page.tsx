import { notFound } from "next/navigation";

import { loadFactionWorkspaceFromLocalSidecar } from "@/characters/character-read-flow";
import { FactionWorkspaceSurface } from "@/workspace/faction-workspace";

export const dynamic = "force-dynamic";

export default async function FactionWorkspacePage({
  params,
}: {
  params: Promise<{
    factionId: string;
  }>;
}) {
  const { factionId } = await params;
  const result = await loadFactionWorkspaceFromLocalSidecar(factionId);

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
      <FactionWorkspaceSurface faction={result.data} />
    </div>
  );
}
