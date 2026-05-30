import { desc, eq, sql } from "drizzle-orm";

import type { DashboardLoreEntry } from "@/dashboard/canon-dashboard";
import type { LoreEntryBrowserItem } from "@/lore-entries/lore-entry-browser";
import type { LoreEntrySyncRepository } from "@/notion/lore-entry-sync";
import type {
  CanonSyncStateRecord,
  SyncFailureCategory,
} from "@/sync/canon-sync-state";
import type { LoreEntryWorkspaceRecord } from "@/workspace/lore-entry-workspace";
import type { SidecarDb } from "./canon-provisioning-repository";
import * as schema from "./schema";

const LORE_ENTRY_SYNC_SOURCE = "Lore Entries";

export type LoreEntrySyncTarget = {
  canonId: string;
  loreEntriesDatabaseId: string;
};

export type LoreEntryReadRepository = {
  listLoreEntries(): Promise<LoreEntryBrowserItem[]>;
  findLoreEntryById(id: string): Promise<LoreEntryWorkspaceRecord | null>;
};

export type LoreEntrySyncStateRepository = {
  findLoreEntrySyncTarget(): Promise<LoreEntrySyncTarget | null>;
  markLoreEntrySyncStarted(canonId: string): Promise<void>;
  markLoreEntrySyncSucceeded(canonId: string, succeededAt: Date): Promise<void>;
  markLoreEntrySyncFailed(input: {
    canonId: string;
    category: SyncFailureCategory;
    message: string;
  }): Promise<void>;
};

export type LoreEntryRepository = LoreEntrySyncRepository &
  LoreEntryReadRepository &
  LoreEntrySyncStateRepository & {
    listLoreEntriesForDashboard(): Promise<DashboardLoreEntry[]>;
    listLoreEntrySyncStatesForDashboard(): Promise<CanonSyncStateRecord[]>;
  };

export function createDrizzleLoreEntryRepository(db: SidecarDb): LoreEntryRepository {
  return {
    async findLoreEntrySyncTarget() {
      const [database] = await db
        .select({
          canonId: schema.canonNotionDatabases.canonId,
          notionDatabaseId: schema.canonNotionDatabases.notionDatabaseId,
          status: schema.canonNotionDatabases.status,
        })
        .from(schema.canonNotionDatabases)
        .where(eq(schema.canonNotionDatabases.elementType, "Lore Entry"))
        .limit(1);

      if (!database?.notionDatabaseId || database.status === "needs_attention") {
        return null;
      }

      return {
        canonId: database.canonId,
        loreEntriesDatabaseId: database.notionDatabaseId,
      };
    },
    async markLoreEntrySyncStarted(canonId) {
      await upsertSyncState(db, {
        canonId,
        status: "syncing",
        lastSucceededAt: null,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markLoreEntrySyncSucceeded(canonId, succeededAt) {
      await upsertSyncState(db, {
        canonId,
        status: "succeeded",
        lastSucceededAt: succeededAt,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markLoreEntrySyncFailed(input) {
      await upsertSyncState(db, {
        canonId: input.canonId,
        status: "failed",
        lastSucceededAt: null,
        failureCategory: input.category,
        failureMessage: input.message,
      });
    },
    async upsertLoreEntries(records) {
      for (const record of records) {
        await db
          .insert(schema.loreEntries)
          .values(record)
          .onConflictDoUpdate({
            target: [schema.loreEntries.canonId, schema.loreEntries.notionPageId],
            set: {
              name: record.name,
              subtype: record.subtype,
              notionUrl: record.notionUrl,
              notionCreatedAt: record.notionCreatedAt,
              notionLastEditedAt: record.notionLastEditedAt,
              lastSyncedAt: record.lastSyncedAt,
              updatedAt: new Date(),
            },
          });
      }
    },
    async listLoreEntriesForDashboard() {
      const loreEntries = await db
        .select()
        .from(schema.loreEntries)
        .orderBy(desc(schema.loreEntries.notionLastEditedAt));

      return loreEntries.map(toDashboardLoreEntry);
    },
    async listLoreEntrySyncStatesForDashboard() {
      const syncStates = await db.select().from(schema.sidecarSyncState);

      return syncStates
        .filter((syncState) => syncState.source === LORE_ENTRY_SYNC_SOURCE)
        .map(toCanonSyncStateRecord);
    },
    async listLoreEntries() {
      const loreEntries = await db
        .select()
        .from(schema.loreEntries)
        .orderBy(desc(schema.loreEntries.notionLastEditedAt));

      return loreEntries.map(toLoreEntryBrowserItem);
    },
    async findLoreEntryById(id) {
      const [loreEntry] = await db
        .select()
        .from(schema.loreEntries)
        .where(eq(schema.loreEntries.id, id))
        .limit(1);

      return loreEntry ? toLoreEntryWorkspaceRecord(loreEntry) : null;
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
      source: LORE_ENTRY_SYNC_SOURCE,
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

function toDashboardLoreEntry(
  loreEntry: typeof schema.loreEntries.$inferSelect,
): DashboardLoreEntry {
  return {
    id: loreEntry.id,
    name: loreEntry.name,
    subtype: loreEntry.subtype,
    notionLastEditedAt: loreEntry.notionLastEditedAt,
    lastSyncedAt: loreEntry.lastSyncedAt,
  };
}

function toCanonSyncStateRecord(
  syncState: typeof schema.sidecarSyncState.$inferSelect,
): CanonSyncStateRecord {
  return {
    source: "Lore Entries",
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

function toLoreEntryBrowserItem(
  loreEntry: typeof schema.loreEntries.$inferSelect,
): LoreEntryBrowserItem {
  return {
    id: loreEntry.id,
    name: loreEntry.name,
    subtype: loreEntry.subtype,
    notionLastEditedAt: loreEntry.notionLastEditedAt,
    lastSyncedAt: loreEntry.lastSyncedAt,
  };
}

function toLoreEntryWorkspaceRecord(
  loreEntry: typeof schema.loreEntries.$inferSelect,
): LoreEntryWorkspaceRecord {
  return {
    id: loreEntry.id,
    name: loreEntry.name,
    subtype: loreEntry.subtype,
    notionPageId: loreEntry.notionPageId,
    notionUrl: loreEntry.notionUrl,
    notionCreatedAt: loreEntry.notionCreatedAt,
    notionLastEditedAt: loreEntry.notionLastEditedAt,
    lastSyncedAt: loreEntry.lastSyncedAt,
  };
}
