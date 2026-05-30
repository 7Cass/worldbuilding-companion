import { syncLoreEntriesAction } from "@/app/canon-dashboard/actions";
import { loadLoreEntriesFromLocalSidecar } from "@/characters/character-read-flow";
import { Button } from "@/components/ui/button";
import { LoreEntryBrowserSurface } from "@/lore-entries/lore-entry-browser";
import { RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoreEntriesPage() {
  const result = await loadLoreEntriesFromLocalSidecar();

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <form action={syncLoreEntriesAction}>
          <Button type="submit" variant="secondary">
            <RefreshCw aria-hidden="true" className="size-4" />
            <span>Sync Lore Entries</span>
          </Button>
        </form>
      </div>
      {!result.ok ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {result.error}
        </section>
      ) : null}
      <LoreEntryBrowserSurface loreEntries={result.data} />
    </div>
  );
}
