import { syncEventsAction } from "@/app/canon-dashboard/actions";
import { loadEventsFromLocalSidecar } from "@/characters/character-read-flow";
import { Button } from "@/components/ui/button";
import { EventBrowserSurface } from "@/events/event-browser";
import { RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const result = await loadEventsFromLocalSidecar();

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <form action={syncEventsAction}>
          <Button type="submit" variant="secondary">
            <RefreshCw aria-hidden="true" className="size-4" />
            <span>Sync Events</span>
          </Button>
        </form>
      </div>
      {!result.ok ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {result.error}
        </section>
      ) : null}
      <EventBrowserSurface events={result.data} />
    </div>
  );
}
