import { describe, expect, it } from "vitest";

import {
  type CharacterSyncRepository,
  type DerivedCharacterRecord,
  mapNotionPageToCharacter,
  syncCharactersFromNotion,
} from "./character-sync";

describe("mapNotionPageToCharacter", () => {
  it("maps a Notion Character page into derived Character state", () => {
    const character = mapNotionPageToCharacter({
      canonId: "canon-1",
      page: {
        id: "notion-character-page-1",
        url: "https://notion.so/notion-character-page-1",
        created_time: "2026-05-28T10:00:00.000Z",
        last_edited_time: "2026-05-29T11:30:00.000Z",
        properties: {
          Name: {
            type: "title",
            title: [
              {
                plain_text: "Mira Vale",
              },
            ],
          },
        },
      },
      syncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });

    expect(character).toEqual({
      canonId: "canon-1",
      notionPageId: "notion-character-page-1",
      name: "Mira Vale",
      notionUrl: "https://notion.so/notion-character-page-1",
      notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
      notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
      lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });
  });
});

describe("syncCharactersFromNotion", () => {
  it("upserts repeated Character syncs without creating duplicates", async () => {
    const repository = createInMemoryCharacterSyncRepository();
    const notion = createFakeNotionCharacterClient([
      [
        createNotionCharacterPage({
          id: "notion-character-page-1",
          name: "Mira Vale",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionCharacterPage({
          id: "notion-character-page-2",
          name: "Orin Ash",
          lastEditedTime: "2026-05-29T11:05:00.000Z",
        }),
      ],
      [
        createNotionCharacterPage({
          id: "notion-character-page-1",
          name: "Mira Vale",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionCharacterPage({
          id: "notion-character-page-2",
          name: "Orin Ashfall",
          lastEditedTime: "2026-05-29T12:05:00.000Z",
        }),
      ],
    ]);

    await syncCharactersFromNotion({
      canonId: "canon-1",
      charactersDatabaseId: "characters-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:00:00.000Z"),
    });
    const result = await syncCharactersFromNotion({
      canonId: "canon-1",
      charactersDatabaseId: "characters-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:10:00.000Z"),
    });

    expect(notion.queriedDatabaseIds).toEqual([
      "characters-database",
      "characters-database",
    ]);
    expect(result.syncedCount).toBe(2);
    expect(repository.characters).toHaveLength(2);
    expect(repository.characters.map((character) => character.name)).toEqual([
      "Mira Vale",
      "Orin Ashfall",
    ]);
    expect(repository.characters[1]?.lastSyncedAt).toEqual(
      new Date("2026-05-29T12:10:00.000Z"),
    );
  });
});

function createNotionCharacterPage(input: {
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

function createFakeNotionCharacterClient(pagesByCall: ReturnType<typeof createNotionCharacterPage>[][]) {
  const queriedDatabaseIds: string[] = [];

  return {
    queriedDatabaseIds,
    async listCharacterPages(input: { databaseId: string }) {
      queriedDatabaseIds.push(input.databaseId);

      const pages = pagesByCall.shift();

      if (!pages) {
        throw new Error("Unexpected Character sync call.");
      }

      return pages;
    },
  };
}

function createInMemoryCharacterSyncRepository(): CharacterSyncRepository & {
  characters: DerivedCharacterRecord[];
} {
  const characters: DerivedCharacterRecord[] = [];

  return {
    characters,
    async upsertCharacters(records) {
      for (const record of records) {
        const existingIndex = characters.findIndex(
          (character) =>
            character.canonId === record.canonId &&
            character.notionPageId === record.notionPageId,
        );

        if (existingIndex >= 0) {
          characters[existingIndex] = record;
        } else {
          characters.push(record);
        }
      }
    },
  };
}
