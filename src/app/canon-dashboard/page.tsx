import { loadCanonDashboardFromLocalSidecar } from "@/characters/character-read-flow";
import { CanonDashboardSurface } from "@/dashboard/canon-dashboard-surface";
import { syncCharactersAction, syncFactionsAction, syncLocationsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CanonDashboardPage() {
  const result = await loadCanonDashboardFromLocalSidecar();

  return (
    <CanonDashboardSurface
      dashboard={result.data}
      error={result.ok ? undefined : result.error}
      syncCharactersAction={syncCharactersAction}
      syncLocationsAction={syncLocationsAction}
      syncFactionsAction={syncFactionsAction}
    />
  );
}
