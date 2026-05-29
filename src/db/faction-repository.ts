import { desc, eq, sql } from "drizzle-orm";

import type { DashboardFaction } from "@/dashboard/canon-dashboard";
import type { FactionBrowserItem } from "@/factions/faction-browser";
import type { FactionSyncRepository } from "@/notion/faction-sync";
import type {
  CanonSyncStateRecord,
  SyncFailureCategory,
} from "@/sync/canon-sync-state";
import type { FactionWorkspaceRecord } from "@/workspace/faction-workspace";
import type { SidecarDb } from "./canon-provisioning-repository";
import * as schema from "./schema";

const FACTION_SYNC_SOURCE = "Factions";

export type FactionSyncTarget = {
  canonId: string;
  factionsDatabaseId: string;
};

export type FactionReadRepository = {
  listFactions(): Promise<FactionBrowserItem[]>;
  findFactionById(id: string): Promise<FactionWorkspaceRecord | null>;
};

export type FactionSyncStateRepository = {
  findFactionSyncTarget(): Promise<FactionSyncTarget | null>;
  markFactionSyncStarted(canonId: string): Promise<void>;
  markFactionSyncSucceeded(canonId: string, succeededAt: Date): Promise<void>;
  markFactionSyncFailed(input: {
    canonId: string;
    category: SyncFailureCategory;
    message: string;
  }): Promise<void>;
};

export type FactionRepository = FactionSyncRepository &
  FactionReadRepository &
  FactionSyncStateRepository & {
    listFactionsForDashboard(): Promise<DashboardFaction[]>;
    listFactionSyncStatesForDashboard(): Promise<CanonSyncStateRecord[]>;
  };

export function createDrizzleFactionRepository(db: SidecarDb): FactionRepository {
  return {
    async findFactionSyncTarget() {
      const [database] = await db
        .select({
          canonId: schema.canonNotionDatabases.canonId,
          notionDatabaseId: schema.canonNotionDatabases.notionDatabaseId,
          status: schema.canonNotionDatabases.status,
        })
        .from(schema.canonNotionDatabases)
        .where(eq(schema.canonNotionDatabases.elementType, "Faction"))
        .limit(1);

      if (!database?.notionDatabaseId || database.status === "needs_attention") {
        return null;
      }

      return {
        canonId: database.canonId,
        factionsDatabaseId: database.notionDatabaseId,
      };
    },
    async markFactionSyncStarted(canonId) {
      await upsertSyncState(db, {
        canonId,
        status: "syncing",
        lastSucceededAt: null,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markFactionSyncSucceeded(canonId, succeededAt) {
      await upsertSyncState(db, {
        canonId,
        status: "succeeded",
        lastSucceededAt: succeededAt,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markFactionSyncFailed(input) {
      await upsertSyncState(db, {
        canonId: input.canonId,
        status: "failed",
        lastSucceededAt: null,
        failureCategory: input.category,
        failureMessage: input.message,
      });
    },
    async upsertFactions(records) {
      for (const record of records) {
        await db
          .insert(schema.factions)
          .values(record)
          .onConflictDoUpdate({
            target: [schema.factions.canonId, schema.factions.notionPageId],
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
    async listFactionsForDashboard() {
      const factions = await db
        .select()
        .from(schema.factions)
        .orderBy(desc(schema.factions.notionLastEditedAt));

      return factions.map(toDashboardFaction);
    },
    async listFactionSyncStatesForDashboard() {
      const syncStates = await db.select().from(schema.sidecarSyncState);

      return syncStates
        .filter((syncState) => syncState.source === FACTION_SYNC_SOURCE)
        .map(toCanonSyncStateRecord);
    },
    async listFactions() {
      const factions = await db
        .select()
        .from(schema.factions)
        .orderBy(desc(schema.factions.notionLastEditedAt));

      return factions.map(toFactionBrowserItem);
    },
    async findFactionById(id) {
      const [faction] = await db
        .select()
        .from(schema.factions)
        .where(eq(schema.factions.id, id))
        .limit(1);

      return faction ? toFactionWorkspaceRecord(faction) : null;
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
      source: FACTION_SYNC_SOURCE,
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

function toDashboardFaction(
  faction: typeof schema.factions.$inferSelect,
): DashboardFaction {
  return {
    id: faction.id,
    name: faction.name,
    notionLastEditedAt: faction.notionLastEditedAt,
    lastSyncedAt: faction.lastSyncedAt,
  };
}

function toCanonSyncStateRecord(
  syncState: typeof schema.sidecarSyncState.$inferSelect,
): CanonSyncStateRecord {
  return {
    source: "Factions",
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

function toFactionBrowserItem(
  faction: typeof schema.factions.$inferSelect,
): FactionBrowserItem {
  return {
    id: faction.id,
    name: faction.name,
    notionLastEditedAt: faction.notionLastEditedAt,
    lastSyncedAt: faction.lastSyncedAt,
  };
}

function toFactionWorkspaceRecord(
  faction: typeof schema.factions.$inferSelect,
): FactionWorkspaceRecord {
  return {
    id: faction.id,
    name: faction.name,
    notionPageId: faction.notionPageId,
    notionUrl: faction.notionUrl,
    notionCreatedAt: faction.notionCreatedAt,
    notionLastEditedAt: faction.notionLastEditedAt,
    lastSyncedAt: faction.lastSyncedAt,
  };
}
