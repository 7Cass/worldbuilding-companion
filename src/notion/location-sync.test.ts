import { describe, expect, it } from "vitest";

import {
  type DerivedLocationRecord,
  type LocationSyncRepository,
  mapNotionPageToLocation,
  syncLocationsFromNotion,
} from "./location-sync";

describe("mapNotionPageToLocation", () => {
  it("maps a Notion Location page into derived Location state", () => {
    const location = mapNotionPageToLocation({
      canonId: "canon-1",
      page: {
        id: "notion-location-page-1",
        url: "https://notion.so/notion-location-page-1",
        created_time: "2026-05-28T10:00:00.000Z",
        last_edited_time: "2026-05-29T11:30:00.000Z",
        properties: {
          Name: {
            type: "title",
            title: [
              {
                plain_text: "The Glass Harbor",
              },
            ],
          },
        },
      },
      syncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });

    expect(location).toEqual({
      canonId: "canon-1",
      notionPageId: "notion-location-page-1",
      name: "The Glass Harbor",
      notionUrl: "https://notion.so/notion-location-page-1",
      notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
      notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
      lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });
  });
});

describe("syncLocationsFromNotion", () => {
  it("upserts repeated Location syncs without creating duplicates", async () => {
    const repository = createInMemoryLocationSyncRepository();
    const notion = createFakeNotionLocationClient([
      [
        createNotionLocationPage({
          id: "notion-location-page-1",
          name: "The Glass Harbor",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionLocationPage({
          id: "notion-location-page-2",
          name: "Ashfall Gate",
          lastEditedTime: "2026-05-29T11:05:00.000Z",
        }),
      ],
      [
        createNotionLocationPage({
          id: "notion-location-page-1",
          name: "The Glass Harbor",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionLocationPage({
          id: "notion-location-page-2",
          name: "Ashfall Gatehouse",
          lastEditedTime: "2026-05-29T12:05:00.000Z",
        }),
      ],
    ]);

    await syncLocationsFromNotion({
      canonId: "canon-1",
      locationsDatabaseId: "locations-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:00:00.000Z"),
    });
    const result = await syncLocationsFromNotion({
      canonId: "canon-1",
      locationsDatabaseId: "locations-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:10:00.000Z"),
    });

    expect(notion.queriedDatabaseIds).toEqual([
      "locations-database",
      "locations-database",
    ]);
    expect(result.syncedCount).toBe(2);
    expect(repository.locations).toHaveLength(2);
    expect(repository.locations.map((location) => location.name)).toEqual([
      "The Glass Harbor",
      "Ashfall Gatehouse",
    ]);
    expect(repository.locations[1]?.lastSyncedAt).toEqual(
      new Date("2026-05-29T12:10:00.000Z"),
    );
  });
});

function createNotionLocationPage(input: {
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

function createFakeNotionLocationClient(pagesByCall: ReturnType<typeof createNotionLocationPage>[][]) {
  const queriedDatabaseIds: string[] = [];

  return {
    queriedDatabaseIds,
    async listLocationPages(input: { databaseId: string }) {
      queriedDatabaseIds.push(input.databaseId);

      const pages = pagesByCall.shift();

      if (!pages) {
        throw new Error("Unexpected Location sync call.");
      }

      return pages;
    },
  };
}

function createInMemoryLocationSyncRepository(): LocationSyncRepository & {
  locations: DerivedLocationRecord[];
} {
  const locations: DerivedLocationRecord[] = [];

  return {
    locations,
    async upsertLocations(records) {
      for (const record of records) {
        const existingIndex = locations.findIndex(
          (location) =>
            location.canonId === record.canonId &&
            location.notionPageId === record.notionPageId,
        );

        if (existingIndex >= 0) {
          locations[existingIndex] = record;
        } else {
          locations.push(record);
        }
      }
    },
  };
}
