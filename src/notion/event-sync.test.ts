import { describe, expect, it } from "vitest";

import {
  type DerivedEventRecord,
  type EventSyncRepository,
  mapNotionPageToEvent,
  syncEventsFromNotion,
} from "./event-sync";

describe("mapNotionPageToEvent", () => {
  it("maps a Notion Event page into derived Event state", () => {
    const event = mapNotionPageToEvent({
      canonId: "canon-1",
      page: {
        id: "notion-event-page-1",
        url: "https://notion.so/notion-event-page-1",
        created_time: "2026-05-28T10:00:00.000Z",
        last_edited_time: "2026-05-29T11:30:00.000Z",
        properties: {
          Name: {
            type: "title",
            title: [
              {
                plain_text: "Battle of Glass Harbor",
              },
            ],
          },
        },
      },
      syncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });

    expect(event).toEqual({
      canonId: "canon-1",
      notionPageId: "notion-event-page-1",
      name: "Battle of Glass Harbor",
      notionUrl: "https://notion.so/notion-event-page-1",
      notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
      notionLastEditedAt: new Date("2026-05-29T11:30:00.000Z"),
      lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
    });
  });
});

describe("syncEventsFromNotion", () => {
  it("upserts repeated Event syncs without creating duplicates", async () => {
    const repository = createInMemoryEventSyncRepository();
    const notion = createFakeNotionEventClient([
      [
        createNotionEventPage({
          id: "notion-event-page-1",
          name: "Battle of Glass Harbor",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionEventPage({
          id: "notion-event-page-2",
          name: "Ashfall Coronation",
          lastEditedTime: "2026-05-29T11:05:00.000Z",
        }),
      ],
      [
        createNotionEventPage({
          id: "notion-event-page-1",
          name: "Battle of Glass Harbor",
          lastEditedTime: "2026-05-29T11:00:00.000Z",
        }),
        createNotionEventPage({
          id: "notion-event-page-2",
          name: "Ashfall Gate Coronation",
          lastEditedTime: "2026-05-29T12:05:00.000Z",
        }),
      ],
    ]);

    await syncEventsFromNotion({
      canonId: "canon-1",
      eventsDatabaseId: "events-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:00:00.000Z"),
    });
    const result = await syncEventsFromNotion({
      canonId: "canon-1",
      eventsDatabaseId: "events-database",
      notion,
      repository,
      now: new Date("2026-05-29T12:10:00.000Z"),
    });

    expect(notion.queriedDatabaseIds).toEqual(["events-database", "events-database"]);
    expect(result.syncedCount).toBe(2);
    expect(repository.events).toHaveLength(2);
    expect(repository.events.map((event) => event.name)).toEqual([
      "Battle of Glass Harbor",
      "Ashfall Gate Coronation",
    ]);
    expect(repository.events[1]?.notionPageId).toBe("notion-event-page-2");
    expect(repository.events[1]?.lastSyncedAt).toEqual(
      new Date("2026-05-29T12:10:00.000Z"),
    );
  });
});

function createNotionEventPage(input: {
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

function createFakeNotionEventClient(
  pagesByCall: ReturnType<typeof createNotionEventPage>[][],
) {
  const queriedDatabaseIds: string[] = [];

  return {
    queriedDatabaseIds,
    async listEventPages(input: { databaseId: string }) {
      queriedDatabaseIds.push(input.databaseId);

      const pages = pagesByCall.shift();

      if (!pages) {
        throw new Error("Unexpected Event sync call.");
      }

      return pages;
    },
  };
}

function createInMemoryEventSyncRepository(): EventSyncRepository & {
  events: DerivedEventRecord[];
} {
  const events: DerivedEventRecord[] = [];

  return {
    events,
    async upsertEvents(records) {
      for (const record of records) {
        const existingIndex = events.findIndex(
          (event) =>
            event.canonId === record.canonId &&
            event.notionPageId === record.notionPageId,
        );

        if (existingIndex >= 0) {
          events[existingIndex] = record;
        } else {
          events.push(record);
        }
      }
    },
  };
}
