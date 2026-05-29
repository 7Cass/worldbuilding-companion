import { describe, expect, it } from "vitest";

import type {
  DerivedEventRecord,
  EventSyncRepository,
  NotionEventSyncClient,
} from "@/notion/event-sync";
import type { SyncFailureCategory } from "@/sync/canon-sync-state";
import { syncEventsForTarget } from "./event-sync-flow";

describe("syncEventsForTarget", () => {
  it("records an understandable failure without changing existing derived Events", async () => {
    const repository = createInMemoryEventSyncFlowRepository({
      lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
      events: [
        createDerivedEvent({
          notionPageId: "notion-event-page-1",
          name: "Battle of Glass Harbor",
        }),
      ],
    });
    const notion: NotionEventSyncClient = {
      async listEventPages() {
        throw {
          code: "restricted_resource",
          message:
            "The integration cannot access this database with token secret_notion_token.",
        };
      },
    };

    const result = await syncEventsForTarget({
      target: {
        canonId: "canon-1",
        eventsDatabaseId: "events-database",
      },
      notion,
      repository,
      now: new Date("2026-05-29T13:00:00.000Z"),
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        "Share the Events database with the internal Notion integration, then retry sync.",
      ],
    });
    expect(repository.events).toEqual([
      createDerivedEvent({
        notionPageId: "notion-event-page-1",
        name: "Battle of Glass Harbor",
      }),
    ]);
    expect(repository.upsertCalls).toBe(0);
    expect(repository.syncState).toEqual({
      status: "failed",
      lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
      failureCategory: "missing_permissions",
      failureMessage:
        "Share the Events database with the internal Notion integration, then retry sync.",
    });
    expect(repository.syncState.failureMessage).not.toContain("secret_notion_token");
  });
});

function createInMemoryEventSyncFlowRepository(input: {
  lastSucceededAt: Date | null;
  events: DerivedEventRecord[];
}): EventSyncRepository & {
  events: DerivedEventRecord[];
  upsertCalls: number;
  syncState: {
    status: "idle" | "syncing" | "succeeded" | "failed";
    lastSucceededAt: Date | null;
    failureCategory: SyncFailureCategory | null;
    failureMessage: string | null;
  };
  markEventSyncStarted(canonId: string): Promise<void>;
  markEventSyncSucceeded(canonId: string, succeededAt: Date): Promise<void>;
  markEventSyncFailed(input: {
    canonId: string;
    category: SyncFailureCategory;
    message: string;
  }): Promise<void>;
} {
  return {
    events: [...input.events],
    upsertCalls: 0,
    syncState: {
      status: "succeeded",
      lastSucceededAt: input.lastSucceededAt,
      failureCategory: null,
      failureMessage: null,
    },
    async markEventSyncStarted() {
      this.syncState = {
        status: "syncing",
        lastSucceededAt: this.syncState.lastSucceededAt,
        failureCategory: null,
        failureMessage: null,
      };
    },
    async markEventSyncSucceeded(_canonId, succeededAt) {
      this.syncState = {
        status: "succeeded",
        lastSucceededAt: succeededAt,
        failureCategory: null,
        failureMessage: null,
      };
    },
    async markEventSyncFailed(failure) {
      this.syncState = {
        status: "failed",
        lastSucceededAt: this.syncState.lastSucceededAt,
        failureCategory: failure.category,
        failureMessage: failure.message,
      };
    },
    async upsertEvents(records) {
      this.upsertCalls += 1;
      this.events = records;
    },
  };
}

function createDerivedEvent(input: {
  notionPageId: string;
  name: string;
}): DerivedEventRecord {
  return {
    canonId: "canon-1",
    notionPageId: input.notionPageId,
    name: input.name,
    notionUrl: `https://notion.so/${input.notionPageId}`,
    notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
    notionLastEditedAt: new Date("2026-05-29T11:00:00.000Z"),
    lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
  };
}
