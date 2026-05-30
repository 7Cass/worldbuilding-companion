import { CANON_ELEMENT_TYPES } from "@/domain/canon-vocabulary";
import type { LoreEntrySubtype } from "@/notion/lore-entry-sync";
import type { CanonElementType } from "@/notion/schema-provisioner";
import {
  type CanonSyncStateRecord,
  type DashboardSyncState,
  toDashboardSyncStates,
} from "@/sync/canon-sync-state";

export type DashboardCharacter = {
  id: string;
  name: string;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type DashboardLocation = {
  id: string;
  name: string;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type DashboardFaction = {
  id: string;
  name: string;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type DashboardEvent = {
  id: string;
  name: string;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type DashboardLoreEntry = {
  id: string;
  name: string;
  subtype: LoreEntrySubtype;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type CanonDashboardRepository = {
  listCharactersForDashboard(): Promise<DashboardCharacter[]>;
  listLocationsForDashboard(): Promise<DashboardLocation[]>;
  listFactionsForDashboard(): Promise<DashboardFaction[]>;
  listEventsForDashboard(): Promise<DashboardEvent[]>;
  listLoreEntriesForDashboard(): Promise<DashboardLoreEntry[]>;
  listSyncStatesForDashboard(): Promise<CanonSyncStateRecord[]>;
};

export type CanonDashboard = {
  elementCounts: Array<{
    elementType: CanonElementType;
    count: number;
  }>;
  recentActivity: Array<{
    elementType: "Character" | "Location" | "Faction" | "Event" | "Lore Entry";
    entityId: string;
    label: string;
    happenedAt: Date;
  }>;
  syncStates: DashboardSyncState[];
};

export async function getCanonDashboard(input: {
  repository: CanonDashboardRepository;
}): Promise<CanonDashboard> {
  const characters = await input.repository.listCharactersForDashboard();
  const locations = await input.repository.listLocationsForDashboard();
  const factions = await input.repository.listFactionsForDashboard();
  const events = await input.repository.listEventsForDashboard();
  const loreEntries = await input.repository.listLoreEntriesForDashboard();
  const syncStates = await input.repository.listSyncStatesForDashboard();

  return {
    elementCounts: CANON_ELEMENT_TYPES.map((elementType) => ({
      elementType,
      count:
        elementType === "Character"
          ? characters.length
          : elementType === "Location"
            ? locations.length
              : elementType === "Faction"
                ? factions.length
                : elementType === "Event"
                  ? events.length
                  : elementType === "Lore Entry"
                    ? loreEntries.length
                    : 0,
    })),
    recentActivity: [
      ...characters.map((character) => ({
        elementType: "Character" as const,
        entityId: character.id,
        label: character.name,
        happenedAt: character.notionLastEditedAt,
      })),
      ...locations.map((location) => ({
        elementType: "Location" as const,
        entityId: location.id,
        label: location.name,
        happenedAt: location.notionLastEditedAt,
      })),
      ...factions.map((faction) => ({
        elementType: "Faction" as const,
        entityId: faction.id,
        label: faction.name,
        happenedAt: faction.notionLastEditedAt,
      })),
      ...events.map((event) => ({
        elementType: "Event" as const,
        entityId: event.id,
        label: event.name,
        happenedAt: event.notionLastEditedAt,
      })),
      ...loreEntries.map((loreEntry) => ({
        elementType: "Lore Entry" as const,
        entityId: loreEntry.id,
        label: loreEntry.name,
        happenedAt: loreEntry.notionLastEditedAt,
      })),
    ]
      .sort((left, right) => right.happenedAt.getTime() - left.happenedAt.getTime())
      .slice(0, 5)
      .map((activity) => activity),
    syncStates: toDashboardSyncStates(syncStates),
  };
}
