import { CharacterBrowserSurface } from "@/characters/character-browser";
import { loadCharactersFromLocalSidecar } from "@/characters/character-read-flow";
import { Button } from "@/components/ui/button";
import { syncCharactersAction } from "@/app/canon-dashboard/actions";
import { RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  const result = await loadCharactersFromLocalSidecar();

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <form action={syncCharactersAction}>
          <Button type="submit" variant="secondary">
            <RefreshCw aria-hidden="true" className="size-4" />
            <span>Sync Characters</span>
          </Button>
        </form>
      </div>
      {!result.ok ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {result.error}
        </section>
      ) : null}
      <CharacterBrowserSurface characters={result.data} />
    </div>
  );
}
