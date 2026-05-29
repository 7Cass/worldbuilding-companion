export type DerivedFactionRecord = {
  canonId: string;
  notionPageId: string;
  name: string;
  notionUrl: string | null;
  notionCreatedAt: Date;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type NotionFactionPage = {
  id: string;
  url?: string | null;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, unknown>;
};

export type NotionFactionSyncClient = {
  listFactionPages(input: { databaseId: string }): Promise<NotionFactionPage[]>;
};

export type FactionSyncRepository = {
  upsertFactions(records: DerivedFactionRecord[]): Promise<void>;
};

export async function syncFactionsFromNotion(input: {
  canonId: string;
  factionsDatabaseId: string;
  notion: NotionFactionSyncClient;
  repository: FactionSyncRepository;
  now?: Date;
}): Promise<{
  syncedCount: number;
}> {
  const syncedAt = input.now ?? new Date();
  const pages = await input.notion.listFactionPages({
    databaseId: input.factionsDatabaseId,
  });
  const factions = pages.map((page) =>
    mapNotionPageToFaction({
      canonId: input.canonId,
      page,
      syncedAt,
    }),
  );

  await input.repository.upsertFactions(factions);

  return {
    syncedCount: factions.length,
  };
}

export function mapNotionPageToFaction(input: {
  canonId: string;
  page: NotionFactionPage;
  syncedAt: Date;
}): DerivedFactionRecord {
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
    throw new Error("Faction page is missing the required Name title property.");
  }

  const title = property.title
    .map((part) => (isRecord(part) && typeof part.plain_text === "string" ? part.plain_text : ""))
    .join("")
    .trim();

  if (!title) {
    throw new Error("Faction page Name must not be empty.");
  }

  return title;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
