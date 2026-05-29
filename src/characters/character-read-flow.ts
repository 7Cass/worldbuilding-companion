import type { CharacterBrowserItem } from "@/characters/character-browser";
import { formatLocalConfigErrors, loadLocalConfig } from "@/config/local-config";
import { createSidecarDb } from "@/db/client";
import { createDrizzleCharacterRepository } from "@/db/character-repository";
import { createDrizzleEventRepository } from "@/db/event-repository";
import { createDrizzleFactionRepository } from "@/db/faction-repository";
import { createDrizzleLocationRepository } from "@/db/location-repository";
import { getCanonDashboard, type CanonDashboard } from "@/dashboard/canon-dashboard";
import { CANON_ELEMENT_TYPES } from "@/domain/canon-vocabulary";
import type { EventBrowserItem } from "@/events/event-browser";
import type { FactionBrowserItem } from "@/factions/faction-browser";
import type { LocationBrowserItem } from "@/locations/location-browser";
import { toDashboardSyncStates } from "@/sync/canon-sync-state";
import type { CharacterWorkspaceRecord } from "@/workspace/character-workspace";
import type { EventWorkspaceRecord } from "@/workspace/event-workspace";
import type { FactionWorkspaceRecord } from "@/workspace/faction-workspace";
import type { LocationWorkspaceRecord } from "@/workspace/location-workspace";

export type LocalReadResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      data: T;
      error: string;
    };

export async function loadCanonDashboardFromLocalSidecar(): Promise<
  LocalReadResult<CanonDashboard>
> {
  const fallback = emptyDashboard();
  const configResult = loadLocalConfig(process.env);

  if (!configResult.ok) {
    return {
      ok: false,
      data: fallback,
      error: formatLocalConfigErrors(configResult.errors),
    };
  }

  const { db, pool } = createSidecarDb(process.env);

  try {
    const characterRepository = createDrizzleCharacterRepository(db);
    const locationRepository = createDrizzleLocationRepository(db);
    const factionRepository = createDrizzleFactionRepository(db);
    const eventRepository = createDrizzleEventRepository(db);

    return {
      ok: true,
      data: await getCanonDashboard({
        repository: {
          listCharactersForDashboard: () =>
            characterRepository.listCharactersForDashboard(),
          listLocationsForDashboard: () =>
            locationRepository.listLocationsForDashboard(),
          listFactionsForDashboard: () => factionRepository.listFactionsForDashboard(),
          listEventsForDashboard: () => eventRepository.listEventsForDashboard(),
          async listSyncStatesForDashboard() {
            return [
              ...(await characterRepository.listSyncStatesForDashboard()),
              ...(await locationRepository.listLocationSyncStatesForDashboard()),
              ...(await factionRepository.listFactionSyncStatesForDashboard()),
              ...(await eventRepository.listEventSyncStatesForDashboard()),
            ];
          },
        },
      }),
    };
  } catch (error) {
    return {
      ok: false,
      data: fallback,
      error: error instanceof Error ? error.message : "Could not load Canon Dashboard.",
    };
  } finally {
    await pool.end();
  }
}

export async function loadCharactersFromLocalSidecar(): Promise<
  LocalReadResult<CharacterBrowserItem[]>
> {
  const configResult = loadLocalConfig(process.env);

  if (!configResult.ok) {
    return {
      ok: false,
      data: [],
      error: formatLocalConfigErrors(configResult.errors),
    };
  }

  const { db, pool } = createSidecarDb(process.env);

  try {
    return {
      ok: true,
      data: await createDrizzleCharacterRepository(db).listCharacters(),
    };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error instanceof Error ? error.message : "Could not load Characters.",
    };
  } finally {
    await pool.end();
  }
}

export async function loadLocationsFromLocalSidecar(): Promise<
  LocalReadResult<LocationBrowserItem[]>
> {
  const configResult = loadLocalConfig(process.env);

  if (!configResult.ok) {
    return {
      ok: false,
      data: [],
      error: formatLocalConfigErrors(configResult.errors),
    };
  }

  const { db, pool } = createSidecarDb(process.env);

  try {
    return {
      ok: true,
      data: await createDrizzleLocationRepository(db).listLocations(),
    };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error instanceof Error ? error.message : "Could not load Locations.",
    };
  } finally {
    await pool.end();
  }
}

export async function loadFactionsFromLocalSidecar(): Promise<
  LocalReadResult<FactionBrowserItem[]>
> {
  const configResult = loadLocalConfig(process.env);

  if (!configResult.ok) {
    return {
      ok: false,
      data: [],
      error: formatLocalConfigErrors(configResult.errors),
    };
  }

  const { db, pool } = createSidecarDb(process.env);

  try {
    return {
      ok: true,
      data: await createDrizzleFactionRepository(db).listFactions(),
    };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error instanceof Error ? error.message : "Could not load Factions.",
    };
  } finally {
    await pool.end();
  }
}

export async function loadEventsFromLocalSidecar(): Promise<
  LocalReadResult<EventBrowserItem[]>
> {
  const configResult = loadLocalConfig(process.env);

  if (!configResult.ok) {
    return {
      ok: false,
      data: [],
      error: formatLocalConfigErrors(configResult.errors),
    };
  }

  const { db, pool } = createSidecarDb(process.env);

  try {
    return {
      ok: true,
      data: await createDrizzleEventRepository(db).listEvents(),
    };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error instanceof Error ? error.message : "Could not load Events.",
    };
  } finally {
    await pool.end();
  }
}

export async function loadCharacterWorkspaceFromLocalSidecar(
  characterId: string,
): Promise<LocalReadResult<CharacterWorkspaceRecord | null>> {
  const configResult = loadLocalConfig(process.env);

  if (!configResult.ok) {
    return {
      ok: false,
      data: null,
      error: formatLocalConfigErrors(configResult.errors),
    };
  }

  const { db, pool } = createSidecarDb(process.env);

  try {
    return {
      ok: true,
      data: await createDrizzleCharacterRepository(db).findCharacterById(characterId),
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : "Could not load Character workspace.",
    };
  } finally {
    await pool.end();
  }
}

export async function loadLocationWorkspaceFromLocalSidecar(
  locationId: string,
): Promise<LocalReadResult<LocationWorkspaceRecord | null>> {
  const configResult = loadLocalConfig(process.env);

  if (!configResult.ok) {
    return {
      ok: false,
      data: null,
      error: formatLocalConfigErrors(configResult.errors),
    };
  }

  const { db, pool } = createSidecarDb(process.env);

  try {
    return {
      ok: true,
      data: await createDrizzleLocationRepository(db).findLocationById(locationId),
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : "Could not load Location workspace.",
    };
  } finally {
    await pool.end();
  }
}

export async function loadFactionWorkspaceFromLocalSidecar(
  factionId: string,
): Promise<LocalReadResult<FactionWorkspaceRecord | null>> {
  const configResult = loadLocalConfig(process.env);

  if (!configResult.ok) {
    return {
      ok: false,
      data: null,
      error: formatLocalConfigErrors(configResult.errors),
    };
  }

  const { db, pool } = createSidecarDb(process.env);

  try {
    return {
      ok: true,
      data: await createDrizzleFactionRepository(db).findFactionById(factionId),
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : "Could not load Faction workspace.",
    };
  } finally {
    await pool.end();
  }
}

export async function loadEventWorkspaceFromLocalSidecar(
  eventId: string,
): Promise<LocalReadResult<EventWorkspaceRecord | null>> {
  const configResult = loadLocalConfig(process.env);

  if (!configResult.ok) {
    return {
      ok: false,
      data: null,
      error: formatLocalConfigErrors(configResult.errors),
    };
  }

  const { db, pool } = createSidecarDb(process.env);

  try {
    return {
      ok: true,
      data: await createDrizzleEventRepository(db).findEventById(eventId),
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : "Could not load Event workspace.",
    };
  } finally {
    await pool.end();
  }
}

function emptyDashboard(): CanonDashboard {
  return {
    elementCounts: CANON_ELEMENT_TYPES.map((elementType) => ({
      elementType,
      count: 0,
    })),
    recentActivity: [],
    syncStates: toDashboardSyncStates([]),
  };
}
