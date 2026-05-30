export const LORE_ENTRY_SUBTYPES = [
  "Species",
  "Culture",
  "Religion",
  "Magic System",
  "Technology",
  "Artifact",
  "Language",
  "Custom",
  "Law",
  "Other",
] as const;

export type LoreEntrySubtype = (typeof LORE_ENTRY_SUBTYPES)[number];

export type DerivedLoreEntryRecord = {
  canonId: string;
  notionPageId: string;
  name: string;
  subtype: LoreEntrySubtype;
  notionUrl: string | null;
  notionCreatedAt: Date;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type NotionLoreEntryPage = {
  id: string;
  url?: string | null;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, unknown>;
};

export type NotionLoreEntrySyncClient = {
  listLoreEntryPages(input: { databaseId: string }): Promise<NotionLoreEntryPage[]>;
};

export type LoreEntrySyncRepository = {
  upsertLoreEntries(records: DerivedLoreEntryRecord[]): Promise<void>;
};

export async function syncLoreEntriesFromNotion(input: {
  canonId: string;
  loreEntriesDatabaseId: string;
  notion: NotionLoreEntrySyncClient;
  repository: LoreEntrySyncRepository;
  now?: Date;
}): Promise<{
  syncedCount: number;
}> {
  const syncedAt = input.now ?? new Date();
  const pages = await input.notion.listLoreEntryPages({
    databaseId: input.loreEntriesDatabaseId,
  });
  const loreEntries = pages.map((page) =>
    mapNotionPageToLoreEntry({
      canonId: input.canonId,
      page,
      syncedAt,
    }),
  );

  await input.repository.upsertLoreEntries(loreEntries);

  return {
    syncedCount: loreEntries.length,
  };
}

export function mapNotionPageToLoreEntry(input: {
  canonId: string;
  page: NotionLoreEntryPage;
  syncedAt: Date;
}): DerivedLoreEntryRecord {
  return {
    canonId: input.canonId,
    notionPageId: input.page.id,
    name: readTitleProperty(input.page.properties.Name),
    subtype: readSubtypeProperty(input.page.properties.Subtype),
    notionUrl: input.page.url ?? null,
    notionCreatedAt: new Date(input.page.created_time),
    notionLastEditedAt: new Date(input.page.last_edited_time),
    lastSyncedAt: input.syncedAt,
  };
}

function readTitleProperty(property: unknown): string {
  if (!isRecord(property) || property.type !== "title" || !Array.isArray(property.title)) {
    throw new Error("Lore Entry page is missing the required Name title property.");
  }

  const title = property.title
    .map((part) => (isRecord(part) && typeof part.plain_text === "string" ? part.plain_text : ""))
    .join("")
    .trim();

  if (!title) {
    throw new Error("Lore Entry page Name must not be empty.");
  }

  return title;
}

function readSubtypeProperty(property: unknown): LoreEntrySubtype {
  if (!isRecord(property) || property.type !== "select" || !isRecord(property.select)) {
    throw new Error("Lore Entry page is missing the required Subtype select property.");
  }

  const subtype = property.select.name;

  if (isSupportedLoreEntrySubtype(subtype)) {
    return subtype;
  }

  throw new Error("Lore Entry page Subtype must be a supported Lore Entry subtype.");
}

function isSupportedLoreEntrySubtype(value: unknown): value is LoreEntrySubtype {
  return (
    typeof value === "string" &&
    LORE_ENTRY_SUBTYPES.some((subtype) => subtype === value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
