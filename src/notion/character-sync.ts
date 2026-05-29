export type DerivedCharacterRecord = {
  canonId: string;
  notionPageId: string;
  name: string;
  notionUrl: string | null;
  notionCreatedAt: Date;
  notionLastEditedAt: Date;
  lastSyncedAt: Date;
};

export type NotionCharacterPage = {
  id: string;
  url?: string | null;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, unknown>;
};

export type NotionCharacterSyncClient = {
  listCharacterPages(input: { databaseId: string }): Promise<NotionCharacterPage[]>;
};

export type CharacterSyncRepository = {
  upsertCharacters(records: DerivedCharacterRecord[]): Promise<void>;
};

export async function syncCharactersFromNotion(input: {
  canonId: string;
  charactersDatabaseId: string;
  notion: NotionCharacterSyncClient;
  repository: CharacterSyncRepository;
  now?: Date;
}): Promise<{
  syncedCount: number;
}> {
  const syncedAt = input.now ?? new Date();
  const pages = await input.notion.listCharacterPages({
    databaseId: input.charactersDatabaseId,
  });
  const characters = pages.map((page) =>
    mapNotionPageToCharacter({
      canonId: input.canonId,
      page,
      syncedAt,
    }),
  );

  await input.repository.upsertCharacters(characters);

  return {
    syncedCount: characters.length,
  };
}

export function mapNotionPageToCharacter(input: {
  canonId: string;
  page: NotionCharacterPage;
  syncedAt: Date;
}): DerivedCharacterRecord {
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
    throw new Error("Character page is missing the required Name title property.");
  }

  const title = property.title
    .map((part) => (isRecord(part) && typeof part.plain_text === "string" ? part.plain_text : ""))
    .join("")
    .trim();

  if (!title) {
    throw new Error("Character page Name must not be empty.");
  }

  return title;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
