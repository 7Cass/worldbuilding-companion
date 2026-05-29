import { describe, expect, it } from "vitest";

import type {
  DerivedFactionRecord,
  FactionSyncRepository,
  NotionFactionSyncClient,
} from "@/notion/faction-sync";
import type { SyncFailureCategory } from "@/sync/canon-sync-state";
import { syncFactionsForTarget } from "./faction-sync-flow";

describe("syncFactionsForTarget", () => {
  it("records an understandable failure without changing existing derived Factions", async () => {
    const repository = createInMemoryFactionSyncFlowRepository({
      lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
      factions: [
        createDerivedFaction({
          notionPageId: "notion-faction-page-1",
          name: "Silver Flame Church",
        }),
      ],
    });
    const notion: NotionFactionSyncClient = {
      async listFactionPages() {
        throw {
          code: "restricted_resource",
          message:
            "The integration cannot access this database with token secret_notion_token.",
        };
      },
    };

    const result = await syncFactionsForTarget({
      target: {
        canonId: "canon-1",
        factionsDatabaseId: "factions-database",
      },
      notion,
      repository,
      now: new Date("2026-05-29T13:00:00.000Z"),
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        "Share the Factions database with the internal Notion integration, then retry sync.",
      ],
    });
    expect(repository.factions).toEqual([
      createDerivedFaction({
        notionPageId: "notion-faction-page-1",
        name: "Silver Flame Church",
      }),
    ]);
    expect(repository.upsertCalls).toBe(0);
    expect(repository.syncState).toEqual({
      status: "failed",
      lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
      failureCategory: "missing_permissions",
      failureMessage:
        "Share the Factions database with the internal Notion integration, then retry sync.",
    });
    expect(repository.syncState.failureMessage).not.toContain("secret_notion_token");
  });
});

function createInMemoryFactionSyncFlowRepository(input: {
  lastSucceededAt: Date | null;
  factions: DerivedFactionRecord[];
}): FactionSyncRepository & {
  factions: DerivedFactionRecord[];
  upsertCalls: number;
  syncState: {
    status: "idle" | "syncing" | "succeeded" | "failed";
    lastSucceededAt: Date | null;
    failureCategory: SyncFailureCategory | null;
    failureMessage: string | null;
  };
  markFactionSyncStarted(canonId: string): Promise<void>;
  markFactionSyncSucceeded(canonId: string, succeededAt: Date): Promise<void>;
  markFactionSyncFailed(input: {
    canonId: string;
    category: SyncFailureCategory;
    message: string;
  }): Promise<void>;
} {
  return {
    factions: [...input.factions],
    upsertCalls: 0,
    syncState: {
      status: "succeeded",
      lastSucceededAt: input.lastSucceededAt,
      failureCategory: null,
      failureMessage: null,
    },
    async markFactionSyncStarted() {
      this.syncState = {
        status: "syncing",
        lastSucceededAt: this.syncState.lastSucceededAt,
        failureCategory: null,
        failureMessage: null,
      };
    },
    async markFactionSyncSucceeded(_canonId, succeededAt) {
      this.syncState = {
        status: "succeeded",
        lastSucceededAt: succeededAt,
        failureCategory: null,
        failureMessage: null,
      };
    },
    async markFactionSyncFailed(failure) {
      this.syncState = {
        status: "failed",
        lastSucceededAt: this.syncState.lastSucceededAt,
        failureCategory: failure.category,
        failureMessage: failure.message,
      };
    },
    async upsertFactions(records) {
      this.upsertCalls += 1;
      this.factions = records;
    },
  };
}

function createDerivedFaction(input: {
  notionPageId: string;
  name: string;
}): DerivedFactionRecord {
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
