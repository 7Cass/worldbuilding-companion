import { describe, expect, it } from "vitest";

import {
  type DerivedLoreEntryRecord,
  type LoreEntrySyncRepository,
  mapNotionPageToLoreEntry,
  syncLoreEntriesFromNotion,
} from "./lore-entry-sync";

describe("mapNotionPageToLoreEntry", () => {
  it("maps a Notion Lore Entry page with a supported subtype into derived Lore Entry state", () => {
    const loreEntry = mapNotionPageToLoreEntry({
      canonId: "canon-1",
      page: {
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
          Subtype: {
            type: "select",
            select: {
              name: "Religion",
            },
          },
        },
      },
      syncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });

    expect(loreEntry).toEqual({
      canonId: "canon-1",
      notionPageId: "notion-lore-entry-page-1",
      name: "Silver Flame Doctrine",
      subtype: "Religion",
      notionUrl: "https://notion.so/notion-lore-entry-page-1",
      notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
      notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
      lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });
  });
});

describe("syncLoreEntriesFromNotion", () => {
  it("upserts repeated Lore Entry syncs without creating duplicates", async () => {
    const repository = createInMemoryLoreEntrySyncRepository();
    const notion = createFakeNotionLoreEntryClient([
      [
        createNotionLoreEntryPage({
          id: "notion-lore-entry-page-1",
          name: "Silver Flame Doctrine",
          subtype: "Religion",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionLoreEntryPage({
          id: "notion-lore-entry-page-2",
          name: "Glass Harbor Cant",
          subtype: "Language",
          lastEditedTime: "2026-05-29T11:05:00.000Z",
        }),
      ],
      [
        createNotionLoreEntryPage({
          id: "notion-lore-entry-page-1",
          name: "Silver Flame Doctrine",
          subtype: "Religion",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionLoreEntryPage({
          id: "notion-lore-entry-page-2",
          name: "Glass Harbor Cant",
          subtype: "Culture",
          lastEditedTime: "2026-05-29T12:05:00.000Z",
        }),
      ],
    ]);

    await syncLoreEntriesFromNotion({
      canonId: "canon-1",
      loreEntriesDatabaseId: "lore-entries-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:00:00.000Z"),
    });
    const result = await syncLoreEntriesFromNotion({
      canonId: "canon-1",
      loreEntriesDatabaseId: "lore-entries-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:10:00.000Z"),
    });

    expect(notion.queriedDatabaseIds).toEqual([
      "lore-entries-database",
      "lore-entries-database",
    ]);
    expect(result.syncedCount).toBe(2);
    expect(repository.loreEntries).toHaveLength(2);
    expect(repository.loreEntries.map((loreEntry) => loreEntry.name)).toEqual([
      "Silver Flame Doctrine",
      "Glass Harbor Cant",
    ]);
    expect(repository.loreEntries[1]?.subtype).toBe("Culture");
    expect(repository.loreEntries[1]?.notionPageId).toBe("notion-lore-entry-page-2");
    expect(repository.loreEntries[1]?.lastSyncedAt).toEqual(
      new Date("2026-05-29T12:10:00.000Z"),
    );
  });
});

function createNotionLoreEntryPage(input: {
  id: string;
  name: string;
  subtype: string;
  lastEditedTime: string;
}) {
  return {
    id: input.id,
    url: `https://notion.so/${input.id}`,
    created_time: "2026-05-28T10:00:00.000Z",
    last_edited_time: input.lastEditedTime,
    properties: {
      Name: {
        type: "title",
        title: [
          {
            plain_text: input.name,
          },
        ],
      },
      Subtype: {
        type: "select",
        select: {
          name: input.subtype,
        },
      },
    },
  };
}

function createFakeNotionLoreEntryClient(
  pagesByCall: ReturnType<typeof createNotionLoreEntryPage>[][],
) {
  const queriedDatabaseIds: string[] = [];

  return {
    queriedDatabaseIds,
    async listLoreEntryPages(input: { databaseId: string }) {
      queriedDatabaseIds.push(input.databaseId);

      const pages = pagesByCall.shift();

      if (!pages) {
        throw new Error("Unexpected Lore Entry sync call.");
      }

      return pages;
    },
  };
}

function createInMemoryLoreEntrySyncRepository(): LoreEntrySyncRepository & {
  loreEntries: DerivedLoreEntryRecord[];
} {
  const loreEntries: DerivedLoreEntryRecord[] = [];

  return {
    loreEntries,
    async upsertLoreEntries(records) {
      for (const record of records) {
        const existingIndex = loreEntries.findIndex(
          (loreEntry) =>
            loreEntry.canonId === record.canonId &&
            loreEntry.notionPageId === record.notionPageId,
        );

        if (existingIndex >= 0) {
          loreEntries[existingIndex] = record;
        } else {
          loreEntries.push(record);
        }
      }
    },
  };
}
