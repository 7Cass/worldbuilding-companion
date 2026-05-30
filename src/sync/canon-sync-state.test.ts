import { describe, expect, it } from "vitest";

import { toDashboardSyncStates } from "./canon-sync-state";

describe("toDashboardSyncStates", () => {
  it("includes sync state slots for Characters, Locations, Factions, Events, and Lore Entries", () => {
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
      {
        source: "Factions",
        status: "idle",
        freshness: "never_synced",
        lastSucceededAt: null,
        failure: null,
        updatedAt: null,
      },
      {
        source: "Events",
        status: "idle",
        freshness: "never_synced",
        lastSucceededAt: null,
        failure: null,
        updatedAt: null,
      },
      {
        source: "Lore Entries",
        status: "idle",
        freshness: "never_synced",
        lastSucceededAt: null,
        failure: null,
        updatedAt: null,
      },
    ]);
  });
});
