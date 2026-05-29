import { notFound } from "next/navigation";

import { loadCharacterWorkspaceFromLocalSidecar } from "@/characters/character-read-flow";
import { CharacterWorkspaceSurface } from "@/workspace/character-workspace";

export const dynamic = "force-dynamic";

export default async function CharacterWorkspacePage({
  params,
}: {
  params: Promise<{
    characterId: string;
  }>;
}) {
  const { characterId } = await params;
  const result = await loadCharacterWorkspaceFromLocalSidecar(characterId);

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
      <CharacterWorkspaceSurface character={result.data} />
    </div>
  );
}
