import { desc, eq, sql } from "drizzle-orm";

import type { DashboardEvent } from "@/dashboard/canon-dashboard";
import type { EventBrowserItem } from "@/events/event-browser";
import type { EventSyncRepository } from "@/notion/event-sync";
import type {
  CanonSyncStateRecord,
  SyncFailureCategory,
} from "@/sync/canon-sync-state";
import type { EventWorkspaceRecord } from "@/workspace/event-workspace";
import type { SidecarDb } from "./canon-provisioning-repository";
import * as schema from "./schema";

const EVENT_SYNC_SOURCE = "Events";

export type EventSyncTarget = {
  canonId: string;
  eventsDatabaseId: string;
};

export type EventReadRepository = {
  listEvents(): Promise<EventBrowserItem[]>;
  findEventById(id: string): Promise<EventWorkspaceRecord | null>;
};

export type EventSyncStateRepository = {
  findEventSyncTarget(): Promise<EventSyncTarget | null>;
  markEventSyncStarted(canonId: string): Promise<void>;
  markEventSyncSucceeded(canonId: string, succeededAt: Date): Promise<void>;
  markEventSyncFailed(input: {
    canonId: string;
    category: SyncFailureCategory;
    message: string;
  }): Promise<void>;
};

export type EventRepository = EventSyncRepository &
  EventReadRepository &
  EventSyncStateRepository & {
    listEventsForDashboard(): Promise<DashboardEvent[]>;
    listEventSyncStatesForDashboard(): Promise<CanonSyncStateRecord[]>;
  };

export function createDrizzleEventRepository(db: SidecarDb): EventRepository {
  return {
    async findEventSyncTarget() {
      const [database] = await db
        .select({
          canonId: schema.canonNotionDatabases.canonId,
          notionDatabaseId: schema.canonNotionDatabases.notionDatabaseId,
          status: schema.canonNotionDatabases.status,
        })
        .from(schema.canonNotionDatabases)
        .where(eq(schema.canonNotionDatabases.elementType, "Event"))
        .limit(1);

      if (!database?.notionDatabaseId || database.status === "needs_attention") {
        return null;
      }

      return {
        canonId: database.canonId,
        eventsDatabaseId: database.notionDatabaseId,
      };
    },
    async markEventSyncStarted(canonId) {
      await upsertSyncState(db, {
        canonId,
        status: "syncing",
        lastSucceededAt: null,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markEventSyncSucceeded(canonId, succeededAt) {
      await upsertSyncState(db, {
        canonId,
        status: "succeeded",
        lastSucceededAt: succeededAt,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markEventSyncFailed(input) {
      await upsertSyncState(db, {
        canonId: input.canonId,
        status: "failed",
        lastSucceededAt: null,
        failureCategory: input.category,
        failureMessage: input.message,
      });
    },
    async upsertEvents(records) {
      for (const record of records) {
        await db
          .insert(schema.events)
          .values(record)
          .onConflictDoUpdate({
            target: [schema.events.canonId, schema.events.notionPageId],
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
    async listEventsForDashboard() {
      const events = await db
        .select()
        .from(schema.events)
        .orderBy(desc(schema.events.notionLastEditedAt));

      return events.map(toDashboardEvent);
    },
    async listEventSyncStatesForDashboard() {
      const syncStates = await db.select().from(schema.sidecarSyncState);

      return syncStates
        .filter((syncState) => syncState.source === EVENT_SYNC_SOURCE)
        .map(toCanonSyncStateRecord);
    },
    async listEvents() {
      const events = await db
        .select()
        .from(schema.events)
        .orderBy(desc(schema.events.notionLastEditedAt));

      return events.map(toEventBrowserItem);
    },
    async findEventById(id) {
      const [event] = await db
        .select()
        .from(schema.events)
        .where(eq(schema.events.id, id))
        .limit(1);

      return event ? toEventWorkspaceRecord(event) : null;
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
      source: EVENT_SYNC_SOURCE,
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

function toDashboardEvent(event: typeof schema.events.$inferSelect): DashboardEvent {
  return {
    id: event.id,
    name: event.name,
    notionLastEditedAt: event.notionLastEditedAt,
    lastSyncedAt: event.lastSyncedAt,
  };
}

function toCanonSyncStateRecord(
  syncState: typeof schema.sidecarSyncState.$inferSelect,
): CanonSyncStateRecord {
  return {
    source: "Events",
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

function toEventBrowserItem(event: typeof schema.events.$inferSelect): EventBrowserItem {
  return {
    id: event.id,
    name: event.name,
    notionLastEditedAt: event.notionLastEditedAt,
    lastSyncedAt: event.lastSyncedAt,
  };
}

function toEventWorkspaceRecord(
  event: typeof schema.events.$inferSelect,
): EventWorkspaceRecord {
  return {
    id: event.id,
    name: event.name,
    notionPageId: event.notionPageId,
    notionUrl: event.notionUrl,
    notionCreatedAt: event.notionCreatedAt,
    notionLastEditedAt: event.notionLastEditedAt,
    lastSyncedAt: event.lastSyncedAt,
  };
}
