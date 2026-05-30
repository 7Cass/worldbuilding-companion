import { describe, expect, it } from "vitest";

import type {
  DerivedLoreEntryRecord,
  LoreEntrySyncRepository,
  NotionLoreEntrySyncClient,
} from "@/notion/lore-entry-sync";
import type { SyncFailureCategory } from "@/sync/canon-sync-state";
import { syncLoreEntriesForTarget } from "./lore-entry-sync-flow";

describe("syncLoreEntriesForTarget", () => {
  it("records an understandable subtype validation failure without changing existing derived Lore Entries", async () => {
    const repository = createInMemoryLoreEntrySyncFlowRepository({
      lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
      loreEntries: [
        createDerivedLoreEntry({
          notionPageId: "notion-lore-entry-page-1",
          name: "Silver Flame Doctrine",
          subtype: "Religion",
        }),
      ],
    });
    const notion: NotionLoreEntrySyncClient = {
      async listLoreEntryPages() {
        return [
          {
            id: "notion-lore-entry-page-2",
            url: "https://notion.so/notion-lore-entry-page-2",
            created_time: "2026-05-28T10:00:00.000Z",
            last_edited_time: "2026-05-29T11:30:00.000Z",
            properties: {
              Name: {
                type: "title",
                title: [
                  {
                    plain_text: "Ashfall Wedding Practice",
                  },
                ],
              },
              Subtype: {
                type: "select",
                select: {
                  name: "Unsorted Note",
                },
              },
            },
          },
        ];
      },
    };

    const result = await syncLoreEntriesForTarget({
      target: {
        canonId: "canon-1",
        loreEntriesDatabaseId: "lore-entries-database",
      },
      notion,
      repository,
      now: new Date("2026-05-29T13:00:00.000Z"),
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        "Restore the required Lore Entry properties in Notion, including the Name title and Subtype select properties, then retry sync.",
      ],
    });
    expect(repository.loreEntries).toEqual([
      createDerivedLoreEntry({
        notionPageId: "notion-lore-entry-page-1",
        name: "Silver Flame Doctrine",
        subtype: "Religion",
      }),
    ]);
    expect(repository.upsertCalls).toBe(0);
    expect(repository.syncState).toEqual({
      status: "failed",
      lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
      failureCategory: "schema_drift",
      failureMessage:
        "Restore the required Lore Entry properties in Notion, including the Name title and Subtype select properties, then retry sync.",
    });
  });

  it("records an understandable failure when the required Subtype property is missing", async () => {
    const repository = createInMemoryLoreEntrySyncFlowRepository({
      lastSucceededAt: null,
      loreEntries: [],
    });
    const notion: NotionLoreEntrySyncClient = {
      async listLoreEntryPages() {
        return [
          {
            id: "notion-lore-entry-page-1",
            url: "https://notion.so/notion-lore-entry-page-1",
            created_time: "2026-05-28T10:00:00.000Z",
            last_edited_time: "2026-05-29T11:30:00.000Z",
            properties: {
              Name: {
                type: "title",
                title: [
                  {
                    plain_text: "Silver Flame Doctrine",
                  },
                ],
              },
            },
          },
        ];
      },
    };

    const result = await syncLoreEntriesForTarget({
      target: {
        canonId: "canon-1",
        loreEntriesDatabaseId: "lore-entries-database",
      },
      notion,
      repository,
      now: new Date("2026-05-29T13:00:00.000Z"),
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        "Restore the required Lore Entry properties in Notion, including the Name title and Subtype select properties, then retry sync.",
      ],
    });
    expect(repository.upsertCalls).toBe(0);
    expect(repository.syncState.failureCategory).toBe("schema_drift");
  });
});

function createInMemoryLoreEntrySyncFlowRepository(input: {
  lastSucceededAt: Date | null;
  loreEntries: DerivedLoreEntryRecord[];
}): LoreEntrySyncRepository & {
  loreEntries: DerivedLoreEntryRecord[];
  upsertCalls: number;
  syncState: {
    status: "idle" | "syncing" | "succeeded" | "failed";
    lastSucceededAt: Date | null;
    failureCategory: SyncFailureCategory | null;
    failureMessage: string | null;
  };
  markLoreEntrySyncStarted(canonId: string): Promise<void>;
  markLoreEntrySyncSucceeded(canonId: string, succeededAt: Date): Promise<void>;
  markLoreEntrySyncFailed(input: {
    canonId: string;
    category: SyncFailureCategory;
    message: string;
  }): Promise<void>;
} {
  return {
    loreEntries: [...input.loreEntries],
    upsertCalls: 0,
    syncState: {
      status: "succeeded",
      lastSucceededAt: input.lastSucceededAt,
      failureCategory: null,
      failureMessage: null,
    },
    async markLoreEntrySyncStarted() {
      this.syncState = {
        status: "syncing",
        lastSucceededAt: this.syncState.lastSucceededAt,
        failureCategory: null,
        failureMessage: null,
      };
    },
    async markLoreEntrySyncSucceeded(_canonId, succeededAt) {
      this.syncState = {
        status: "succeeded",
        lastSucceededAt: succeededAt,
        failureCategory: null,
        failureMessage: null,
      };
    },
    async markLoreEntrySyncFailed(failure) {
      this.syncState = {
        status: "failed",
        lastSucceededAt: this.syncState.lastSucceededAt,
        failureCategory: failure.category,
        failureMessage: failure.message,
      };
    },
    async upsertLoreEntries(records) {
      this.upsertCalls += 1;
      this.loreEntries = records;
    },
  };
}

function createDerivedLoreEntry(input: {
  notionPageId: string;
  name: string;
  subtype: DerivedLoreEntryRecord["subtype"];
}): DerivedLoreEntryRecord {
  return {
    canonId: "canon-1",
    notionPageId: input.notionPageId,
    name: input.name,
    subtype: input.subtype,
    notionUrl: `https://notion.so/${input.notionPageId}`,
    notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
    notionLastEditedAt: new Date("2026-05-29T11:00:00.000Z"),
    lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
  };
}
