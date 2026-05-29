import { notFound } from "next/navigation";

import { loadLocationWorkspaceFromLocalSidecar } from "@/characters/character-read-flow";
import { LocationWorkspaceSurface } from "@/workspace/location-workspace";

export const dynamic = "force-dynamic";

export default async function LocationWorkspacePage({
  params,
}: {
  params: Promise<{
    locationId: string;
  }>;
}) {
  const { locationId } = await params;
  const result = await loadLocationWorkspaceFromLocalSidecar(locationId);

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
      <LocationWorkspaceSurface location={result.data} />
    </div>
  );
}
