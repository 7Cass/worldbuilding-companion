import { desc, eq, sql } from "drizzle-orm";

import type { DashboardLocation } from "@/dashboard/canon-dashboard";
import type { LocationBrowserItem } from "@/locations/location-browser";
import type { LocationSyncRepository } from "@/notion/location-sync";
import type {
  CanonSyncStateRecord,
  SyncFailureCategory,
} from "@/sync/canon-sync-state";
import type { LocationWorkspaceRecord } from "@/workspace/location-workspace";
import type { SidecarDb } from "./canon-provisioning-repository";
import * as schema from "./schema";

const LOCATION_SYNC_SOURCE = "Locations";

export type LocationSyncTarget = {
  canonId: string;
  locationsDatabaseId: string;
};

export type LocationReadRepository = {
  listLocations(): Promise<LocationBrowserItem[]>;
  findLocationById(id: string): Promise<LocationWorkspaceRecord | null>;
};

export type LocationSyncStateRepository = {
  findLocationSyncTarget(): Promise<LocationSyncTarget | null>;
  markLocationSyncStarted(canonId: string): Promise<void>;
  markLocationSyncSucceeded(canonId: string, succeededAt: Date): Promise<void>;
  markLocationSyncFailed(input: {
    canonId: string;
    category: SyncFailureCategory;
    message: string;
  }): Promise<void>;
};

export type LocationRepository = LocationSyncRepository &
  LocationReadRepository &
  LocationSyncStateRepository & {
    listLocationsForDashboard(): Promise<DashboardLocation[]>;
    listLocationSyncStatesForDashboard(): Promise<CanonSyncStateRecord[]>;
  };

export function createDrizzleLocationRepository(db: SidecarDb): LocationRepository {
  return {
    async findLocationSyncTarget() {
      const [database] = await db
        .select({
          canonId: schema.canonNotionDatabases.canonId,
          notionDatabaseId: schema.canonNotionDatabases.notionDatabaseId,
          status: schema.canonNotionDatabases.status,
        })
        .from(schema.canonNotionDatabases)
        .where(eq(schema.canonNotionDatabases.elementType, "Location"))
        .limit(1);

      if (!database?.notionDatabaseId || database.status === "needs_attention") {
        return null;
      }

      return {
        canonId: database.canonId,
        locationsDatabaseId: database.notionDatabaseId,
      };
    },
    async markLocationSyncStarted(canonId) {
      await upsertSyncState(db, {
        canonId,
        status: "syncing",
        lastSucceededAt: null,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markLocationSyncSucceeded(canonId, succeededAt) {
      await upsertSyncState(db, {
        canonId,
        status: "succeeded",
        lastSucceededAt: succeededAt,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markLocationSyncFailed(input) {
      await upsertSyncState(db, {
        canonId: input.canonId,
        status: "failed",
        lastSucceededAt: null,
        failureCategory: input.category,
        failureMessage: input.message,
      });
    },
    async upsertLocations(records) {
      for (const record of records) {
        await db
          .insert(schema.locations)
          .values(record)
          .onConflictDoUpdate({
            target: [schema.locations.canonId, schema.locations.notionPageId],
            set: {
              name: record.name,
              notionUrl: record.notionUrl,
              notionCreatedAt: record.notionCreatedAt,
              notionLastEditedAt: record.notionLastEditedAt,
              lastSyncedAt: record.lastSyncedAt,
              updatedAt: new Date(),
            },
          });
      }
    },
    async listLocationsForDashboard() {
      const locations = await db
        .select()
        .from(schema.locations)
        .orderBy(desc(schema.locations.notionLastEditedAt));

      return locations.map(toDashboardLocation);
    },
    async listLocationSyncStatesForDashboard() {
      const syncStates = await db.select().from(schema.sidecarSyncState);

      return syncStates
        .filter((syncState) => syncState.source === LOCATION_SYNC_SOURCE)
        .map(toCanonSyncStateRecord);
    },
    async listLocations() {
      const locations = await db
        .select()
        .from(schema.locations)
        .orderBy(desc(schema.locations.notionLastEditedAt));

      return locations.map(toLocationBrowserItem);
    },
    async findLocationById(id) {
      const [location] = await db
        .select()
        .from(schema.locations)
        .where(eq(schema.locations.id, id))
        .limit(1);

      return location ? toLocationWorkspaceRecord(location) : null;
    },
  };
}

async function upsertSyncState(
  db: SidecarDb,
  input: {
    canonId: string;
    status: "syncing" | "succeeded" | "failed";
    lastSucceededAt: Date | null;
    failureCategory: SyncFailureCategory | null;
    failureMessage: string | null;
  },
) {
  await db
    .insert(schema.sidecarSyncState)
    .values({
      canonId: input.canonId,
      source: LOCATION_SYNC_SOURCE,
      status: input.status,
      lastSucceededAt: input.lastSucceededAt,
      failureCategory: input.failureCategory,
      failureMessage: input.failureMessage,
    })
    .onConflictDoUpdate({
      target: [schema.sidecarSyncState.canonId, schema.sidecarSyncState.source],
      set: {
        status: input.status,
        lastSucceededAt:
          input.lastSucceededAt ??
          sql`coalesce(${schema.sidecarSyncState.lastSucceededAt}, ${input.lastSucceededAt})`,
        failureCategory: input.failureCategory,
        failureMessage: input.failureMessage,
        updatedAt: new Date(),
      },
    });
}

function toDashboardLocation(
  location: typeof schema.locations.$inferSelect,
): DashboardLocation {
  return {
    id: location.id,
    name: location.name,
    notionLastEditedAt: location.notionLastEditedAt,
    lastSyncedAt: location.lastSyncedAt,
  };
}

function toCanonSyncStateRecord(
  syncState: typeof schema.sidecarSyncState.$inferSelect,
): CanonSyncStateRecord {
  return {
    source: "Locations",
    status: syncState.status,
    lastSucceededAt: syncState.lastSucceededAt,
    failure:
      syncState.failureCategory && syncState.failureMessage
        ? {
            category: toSyncFailureCategory(syncState.failureCategory),
            message: syncState.failureMessage,
          }
        : null,
    updatedAt: syncState.updatedAt,
  };
}

function toSyncFailureCategory(category: string): SyncFailureCategory {
  if (
    category === "missing_permissions" ||
    category === "deleted_page" ||
    category === "schema_drift" ||
    category === "rate_limited"
  ) {
    return category;
  }

  return "unknown";
}

function toLocationBrowserItem(
  location: typeof schema.locations.$inferSelect,
): LocationBrowserItem {
  return {
    id: location.id,
    name: location.name,
    notionLastEditedAt: location.notionLastEditedAt,
    lastSyncedAt: location.lastSyncedAt,
  };
}

function toLocationWorkspaceRecord(
  location: typeof schema.locations.$inferSelect,
): LocationWorkspaceRecord {
  return {
    id: location.id,
    name: location.name,
    notionPageId: location.notionPageId,
    notionUrl: location.notionUrl,
    notionCreatedAt: location.notionCreatedAt,
    notionLastEditedAt: location.notionLastEditedAt,
    lastSyncedAt: location.lastSyncedAt,
  };
}
