import { describe, expect, it } from "vitest";

import { getCanonDashboard } from "./canon-dashboard";

describe("getCanonDashboard", () => {
  it("shows Lore Entry count and recent Lore Entry activity from sidecar state", async () => {
    const dashboard = await getCanonDashboard({
      repository: {
        async listCharactersForDashboard() {
          return [];
        },
        async listLocationsForDashboard() {
          return [];
        },
        async listFactionsForDashboard() {
          return [];
        },
        async listEventsForDashboard() {
          return [];
        },
        async listLoreEntriesForDashboard() {
          return [
            {
              id: "lore-entry-1",
              name: "Silver Flame Doctrine",
              subtype: "Religion",
              notionLastEditedAt: new Date("2026-05-29T11:45:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
            {
              id: "lore-entry-2",
              name: "Glass Harbor Cant",
              subtype: "Language",
              notionLastEditedAt: new Date("2026-05-29T09:15:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
          ];
        },
        async listSyncStatesForDashboard() {
          return [];
        },
      },
    });

    expect(dashboard.elementCounts).toContainEqual({
      elementType: "Lore Entry",
      count: 2,
    });
    expect(dashboard.recentActivity).toEqual([
      {
        elementType: "Lore Entry",
        entityId: "lore-entry-1",
        label: "Silver Flame Doctrine",
        happenedAt: new Date("2026-05-29T11:45:00.000Z"),
      },
      {
        elementType: "Lore Entry",
        entityId: "lore-entry-2",
        label: "Glass Harbor Cant",
        happenedAt: new Date("2026-05-29T09:15:00.000Z"),
      },
    ]);
  });

  it("shows Event count and recent Event activity from sidecar state", async () => {
    const dashboard = await getCanonDashboard({
      repository: {
        async listCharactersForDashboard() {
          return [];
        },
        async listLocationsForDashboard() {
          return [];
        },
        async listFactionsForDashboard() {
          return [];
        },
        async listEventsForDashboard() {
          return [
            {
              id: "event-1",
              name: "Battle of Glass Harbor",
              notionLastEditedAt: new Date("2026-05-29T11:45:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
            {
              id: "event-2",
              name: "Ashfall Gate Coronation",
              notionLastEditedAt: new Date("2026-05-29T09:15:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
          ];
        },
        async listLoreEntriesForDashboard() {
          return [];
        },
        async listSyncStatesForDashboard() {
          return [];
        },
      },
    });

    expect(dashboard.elementCounts).toContainEqual({
      elementType: "Event",
      count: 2,
    });
    expect(dashboard.recentActivity).toEqual([
      {
        elementType: "Event",
        entityId: "event-1",
        label: "Battle of Glass Harbor",
        happenedAt: new Date("2026-05-29T11:45:00.000Z"),
      },
      {
        elementType: "Event",
        entityId: "event-2",
        label: "Ashfall Gate Coronation",
        happenedAt: new Date("2026-05-29T09:15:00.000Z"),
      },
    ]);
  });

  it("shows Faction count and recent Faction activity from sidecar state", async () => {
    const dashboard = await getCanonDashboard({
      repository: {
        async listCharactersForDashboard() {
          return [];
        },
        async listLocationsForDashboard() {
          return [];
        },
        async listFactionsForDashboard() {
          return [
            {
              id: "faction-1",
              name: "Silver Flame Church",
              notionLastEditedAt: new Date("2026-05-29T11:45:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
            {
              id: "faction-2",
              name: "Glass Harbor Trade Guild",
              notionLastEditedAt: new Date("2026-05-29T09:15:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
          ];
        },
        async listEventsForDashboard() {
          return [];
        },
        async listLoreEntriesForDashboard() {
          return [];
        },
        async listSyncStatesForDashboard() {
          return [];
        },
      },
    });

    expect(dashboard.elementCounts).toContainEqual({
      elementType: "Faction",
      count: 2,
    });
    expect(dashboard.recentActivity).toEqual([
      {
        elementType: "Faction",
        entityId: "faction-1",
        label: "Silver Flame Church",
        happenedAt: new Date("2026-05-29T11:45:00.000Z"),
      },
      {
        elementType: "Faction",
        entityId: "faction-2",
        label: "Glass Harbor Trade Guild",
        happenedAt: new Date("2026-05-29T09:15:00.000Z"),
      },
    ]);
  });

  it("shows Location count and recent Location activity from sidecar state", async () => {
    const dashboard = await getCanonDashboard({
      repository: {
        async listCharactersForDashboard() {
          return [
            {
              id: "character-1",
              name: "Mira Vale",
              notionLastEditedAt: new Date("2026-05-29T10:00:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
          ];
        },
        async listLocationsForDashboard() {
          return [
            {
              id: "location-1",
              name: "The Glass Harbor",
              notionLastEditedAt: new Date("2026-05-29T11:45:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
            {
              id: "location-2",
              name: "Ashfall Gate",
              notionLastEditedAt: new Date("2026-05-29T09:15:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
          ];
        },
        async listFactionsForDashboard() {
          return [];
        },
        async listEventsForDashboard() {
          return [];
        },
        async listLoreEntriesForDashboard() {
          return [];
        },
        async listSyncStatesForDashboard() {
          return [];
        },
      },
    });

    expect(dashboard.elementCounts).toContainEqual({
      elementType: "Location",
      count: 2,
    });
    expect(dashboard.recentActivity).toEqual([
      {
        elementType: "Location",
        entityId: "location-1",
        label: "The Glass Harbor",
        happenedAt: new Date("2026-05-29T11:45:00.000Z"),
      },
      {
        elementType: "Character",
        entityId: "character-1",
        label: "Mira Vale",
        happenedAt: new Date("2026-05-29T10:00:00.000Z"),
      },
      {
        elementType: "Location",
        entityId: "location-2",
        label: "Ashfall Gate",
        happenedAt: new Date("2026-05-29T09:15:00.000Z"),
      },
    ]);
  });

  it("shows Character count and recent Character activity from sidecar state", async () => {
    const dashboard = await getCanonDashboard({
      repository: {
        async listCharactersForDashboard() {
          return [
            {
              id: "character-1",
              name: "Mira Vale",
              notionLastEditedAt: new Date("2026-05-29T10:00:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
            {
              id: "character-2",
              name: "Orin Ash",
              notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
              lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
            },
          ];
        },
        async listLocationsForDashboard() {
          return [];
        },
        async listFactionsForDashboard() {
          return [];
        },
        async listEventsForDashboard() {
          return [];
        },
        async listLoreEntriesForDashboard() {
          return [];
        },
        async listSyncStatesForDashboard() {
          return [];
        },
      },
    });

    expect(dashboard.elementCounts).toContainEqual({
      elementType: "Character",
      count: 2,
    });
    expect(dashboard.recentActivity).toEqual([
      {
        elementType: "Character",
        entityId: "character-2",
        label: "Orin Ash",
        happenedAt: new Date("2026-05-29T11:30:00.000Z"),
      },
      {
        elementType: "Character",
        entityId: "character-1",
        label: "Mira Vale",
        happenedAt: new Date("2026-05-29T10:00:00.000Z"),
      },
    ]);
  });

  it("shows stale Character sync state with the last successful sync and failure detail", async () => {
    const dashboard = await getCanonDashboard({
      repository: {
        async listCharactersForDashboard() {
          return [];
        },
        async listLocationsForDashboard() {
          return [];
        },
        async listFactionsForDashboard() {
          return [];
        },
        async listEventsForDashboard() {
          return [];
        },
        async listLoreEntriesForDashboard() {
          return [];
        },
        async listSyncStatesForDashboard() {
          return [
            {
              source: "Characters",
              status: "failed",
              lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
              failure: {
                category: "missing_permissions",
                message:
                  "Share the Characters database with the internal Notion integration, then retry sync.",
              },
              updatedAt: new Date("2026-05-29T13:00:00.000Z"),
            },
          ];
        },
      },
    });

    expect(dashboard.syncStates).toEqual([
      {
        source: "Characters",
        status: "failed",
        freshness: "stale",
        lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
        failure: {
          category: "missing_permissions",
          message:
            "Share the Characters database with the internal Notion integration, then retry sync.",
        },
        updatedAt: new Date("2026-05-29T13:00:00.000Z"),
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
