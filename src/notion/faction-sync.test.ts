import { describe, expect, it } from "vitest";

import {
  type DerivedFactionRecord,
  type FactionSyncRepository,
  mapNotionPageToFaction,
  syncFactionsFromNotion,
} from "./faction-sync";

describe("mapNotionPageToFaction", () => {
  it("maps a Notion Faction page into derived Faction state", () => {
    const faction = mapNotionPageToFaction({
      canonId: "canon-1",
      page: {
        id: "notion-faction-page-1",
        url: "https://notion.so/notion-faction-page-1",
        created_time: "2026-05-28T10:00:00.000Z",
        last_edited_time: "2026-05-29T11:30:00.000Z",
        properties: {
          Name: {
            type: "title",
            title: [
              {
                plain_text: "Silver Flame Church",
              },
            ],
          },
        },
      },
      syncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });

    expect(faction).toEqual({
      canonId: "canon-1",
      notionPageId: "notion-faction-page-1",
      name: "Silver Flame Church",
      notionUrl: "https://notion.so/notion-faction-page-1",
      notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
      notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
      lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });
  });
});

describe("syncFactionsFromNotion", () => {
  it("upserts repeated Faction syncs without creating duplicates", async () => {
    const repository = createInMemoryFactionSyncRepository();
    const notion = createFakeNotionFactionClient([
      [
        createNotionFactionPage({
          id: "notion-faction-page-1",
          name: "Silver Flame Church",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionFactionPage({
          id: "notion-faction-page-2",
          name: "Glass Harbor Guild",
          lastEditedTime: "2026-05-29T11:05:00.000Z",
        }),
      ],
      [
        createNotionFactionPage({
          id: "notion-faction-page-1",
          name: "Silver Flame Church",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionFactionPage({
          id: "notion-faction-page-2",
          name: "Glass Harbor Trade Guild",
          lastEditedTime: "2026-05-29T12:05:00.000Z",
        }),
      ],
    ]);

    await syncFactionsFromNotion({
      canonId: "canon-1",
      factionsDatabaseId: "factions-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:00:00.000Z"),
    });
    const result = await syncFactionsFromNotion({
      canonId: "canon-1",
      factionsDatabaseId: "factions-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:10:00.000Z"),
    });

    expect(notion.queriedDatabaseIds).toEqual(["factions-database", "factions-database"]);
    expect(result.syncedCount).toBe(2);
    expect(repository.factions).toHaveLength(2);
    expect(repository.factions.map((faction) => faction.name)).toEqual([
      "Silver Flame Church",
      "Glass Harbor Trade Guild",
    ]);
    expect(repository.factions[1]?.lastSyncedAt).toEqual(
      new Date("2026-05-29T12:10:00.000Z"),
    );
  });
});

function createNotionFactionPage(input: {
  id: string;
  name: string;
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
    },
  };
}

function createFakeNotionFactionClient(pagesByCall: ReturnType<typeof createNotionFactionPage>[][]) {
  const queriedDatabaseIds: string[] = [];

  return {
    queriedDatabaseIds,
    async listFactionPages(input: { databaseId: string }) {
      queriedDatabaseIds.push(input.databaseId);

      const pages = pagesByCall.shift();

      if (!pages) {
        throw new Error("Unexpected Faction sync call.");
      }

      return pages;
    },
  };
}

function createInMemoryFactionSyncRepository(): FactionSyncRepository & {
  factions: DerivedFactionRecord[];
} {
  const factions: DerivedFactionRecord[] = [];

  return {
    factions,
    async upsertFactions(records) {
      for (const record of records) {
        const existingIndex = factions.findIndex(
          (faction) =>
            faction.canonId === record.canonId &&
            faction.notionPageId === record.notionPageId,
        );

        if (existingIndex >= 0) {
          factions[existingIndex] = record;
        } else {
          factions.push(record);
        }
      }
    },
  };
}
