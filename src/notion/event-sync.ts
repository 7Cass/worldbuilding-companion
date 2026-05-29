export type DerivedEventRecord = {
  canonId: string;
  notionPageId: string;
  name: string;
  notionUrl: string | null;
  notionCreatedAt: Date;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type NotionEventPage = {
  id: string;
  url?: string | null;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, unknown>;
};

export type NotionEventSyncClient = {
  listEventPages(input: { databaseId: string }): Promise<NotionEventPage[]>;
};

export type EventSyncRepository = {
  upsertEvents(records: DerivedEventRecord[]): Promise<void>;
};

export async function syncEventsFromNotion(input: {
  canonId: string;
  eventsDatabaseId: string;
  notion: NotionEventSyncClient;
  repository: EventSyncRepository;
  now?: Date;
}): Promise<{
  syncedCount: number;
}> {
  const syncedAt = input.now ?? new Date();
  const pages = await input.notion.listEventPages({
    databaseId: input.eventsDatabaseId,
  });
  const events = pages.map((page) =>
    mapNotionPageToEvent({
      canonId: input.canonId,
      page,
      syncedAt,
    }),
  );

  await input.repository.upsertEvents(events);

  return {
    syncedCount: events.length,
  };
}

export function mapNotionPageToEvent(input: {
  canonId: string;
  page: NotionEventPage;
  syncedAt: Date;
}): DerivedEventRecord {
  return {
    canonId: input.canonId,
    notionPageId: input.page.id,
    name: readTitleProperty(input.page.properties.Name),
    notionUrl: input.page.url ?? null,
    notionCreatedAt: new Date(input.page.created_time),
    notionLastEditedAt: new Date(input.page.last_edited_time),
    lastSyncedAt: input.syncedAt,
  };
}

function readTitleProperty(property: unknown): string {
  if (!isRecord(property) || property.type !== "title" || !Array.isArray(property.title)) {
    throw new Error("Event page is missing the required Name title property.");
  }

  const title = property.title
    .map((part) => (isRecord(part) && typeof part.plain_text === "string" ? part.plain_text : ""))
    .join("")
    .trim();

  if (!title) {
    throw new Error("Event page Name must not be empty.");
  }

  return title;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
