export type DerivedLocationRecord = {
  canonId: string;
  notionPageId: string;
  name: string;
  notionUrl: string | null;
  notionCreatedAt: Date;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type NotionLocationPage = {
  id: string;
  url?: string | null;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, unknown>;
};

export type NotionLocationSyncClient = {
  listLocationPages(input: { databaseId: string }): Promise<NotionLocationPage[]>;
};

export type LocationSyncRepository = {
  upsertLocations(records: DerivedLocationRecord[]): Promise<void>;
};

export async function syncLocationsFromNotion(input: {
  canonId: string;
  locationsDatabaseId: string;
  notion: NotionLocationSyncClient;
  repository: LocationSyncRepository;
  now?: Date;
}): Promise<{
  syncedCount: number;
}> {
  const syncedAt = input.now ?? new Date();
  const pages = await input.notion.listLocationPages({
    databaseId: input.locationsDatabaseId,
  });
  const locations = pages.map((page) =>
    mapNotionPageToLocation({
      canonId: input.canonId,
      page,
      syncedAt,
    }),
  );

  await input.repository.upsertLocations(locations);

  return {
    syncedCount: locations.length,
  };
}

export function mapNotionPageToLocation(input: {
  canonId: string;
  page: NotionLocationPage;
  syncedAt: Date;
}): DerivedLocationRecord {
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
    throw new Error("Location page is missing the required Name title property.");
  }

  const title = property.title
    .map((part) => (isRecord(part) && typeof part.plain_text === "string" ? part.plain_text : ""))
    .join("")
    .trim();

  if (!title) {
    throw new Error("Location page Name must not be empty.");
  }

  return title;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
