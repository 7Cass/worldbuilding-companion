import { syncFactionsAction } from "@/app/canon-dashboard/actions";
import { loadFactionsFromLocalSidecar } from "@/characters/character-read-flow";
import { Button } from "@/components/ui/button";
import { FactionBrowserSurface } from "@/factions/faction-browser";
import { RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FactionsPage() {
  const result = await loadFactionsFromLocalSidecar();

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <form action={syncFactionsAction}>
          <Button type="submit" variant="secondary">
            <RefreshCw aria-hidden="true" className="size-4" />
            <span>Sync Factions</span>
          </Button>
        </form>
      </div>
      {!result.ok ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {result.error}
        </section>
      ) : null}
      <FactionBrowserSurface factions={result.data} />
    </div>
  );
}
