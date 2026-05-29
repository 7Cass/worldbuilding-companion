import { syncLocationsAction } from "@/app/canon-dashboard/actions";
import { loadLocationsFromLocalSidecar } from "@/characters/character-read-flow";
import { Button } from "@/components/ui/button";
import { LocationBrowserSurface } from "@/locations/location-browser";
import { RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const result = await loadLocationsFromLocalSidecar();

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <form action={syncLocationsAction}>
          <Button type="submit" variant="secondary">
            <RefreshCw aria-hidden="true" className="size-4" />
            <span>Sync Locations</span>
          </Button>
        </form>
      </div>
      {!result.ok ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {result.error}
        </section>
      ) : null}
      <LocationBrowserSurface locations={result.data} />
    </div>
  );
}
