import { describe, expect, it } from "vitest";

import { toDashboardSyncStates } from "./canon-sync-state";

describe("toDashboardSyncStates", () => {
  it("includes sync state slots for Characters and Locations", () => {
    expect(toDashboardSyncStates([])).toEqual([
      {
        source: "Characters",
        status: "idle",
        freshness: "never_synced",
        lastSucceededAt: null,
        failure: null,
        updatedAt: null,
      },
      {
        source: "Locations",
        status: "idle",
        freshness: "never_synced",
        lastSucceededAt: null,
        failure: null,
        updatedAt: null,
      },
    ]);
  });
});
