export const CANON_NOTION_DATABASES = [
  {
    elementType: "Character",
    databaseTitle: "Characters",
  },
  {
    elementType: "Location",
    databaseTitle: "Locations",
  },
  {
    elementType: "Faction",
    databaseTitle: "Factions",
  },
  {
    elementType: "Event",
    databaseTitle: "Events",
  },
  {
    elementType: "Lore Entry",
    databaseTitle: "Lore Entries",
  },
  {
    elementType: "Relationship",
    databaseTitle: "Relationships",
  },
  {
    elementType: "Source",
    databaseTitle: "Sources",
  },
] as const;

export type CanonElementType = (typeof CANON_NOTION_DATABASES)[number]["elementType"];
export type ProvisioningDatabaseStatus = "created" | "reused" | "needs_attention";

export type CanonRecord = {
  id: string;
  name: string;
  notionParentPageId: string;
};

export type CanonNotionDatabaseRecord = {
  canonId: string;
  elementType: CanonElementType;
  notionDatabaseId: string | null;
  status: ProvisioningDatabaseStatus;
  lastProvisionedAt: Date;
  attentionReason: string | null;
};

export type CanonProvisioningRepository = {
  findCanonByName(name: string): Promise<CanonRecord | null>;
  createCanon(input: {
    name: string;
    notionParentPageId: string;
  }): Promise<CanonRecord>;
  listNotionDatabases(canonId: string): Promise<CanonNotionDatabaseRecord[]>;
  upsertNotionDatabase(record: CanonNotionDatabaseRecord): Promise<void>;
};

export type NotionDatabaseResponse = {
  id: string;
  properties: Record<string, unknown>;
};

export type NotionProvisioningClient = {
  databases: {
    create(input: {
      parent: {
        type: "page_id";
        page_id: string;
      };
      title: Array<{
        type: "text";
        text: {
          content: string;
        };
      }>;
      properties: Record<string, unknown>;
    }): Promise<NotionDatabaseResponse>;
    retrieve(input: { database_id: string }): Promise<NotionDatabaseResponse>;
  };
};

export type CanonProvisioningResult = {
  status: "succeeded" | "needs_attention";
  canon: CanonRecord;
  databases: Array<{
    elementType: CanonElementType;
    notionDatabaseId: string | null;
    status: ProvisioningDatabaseStatus;
    attentionReason: string | null;
  }>;
};

export async function provisionCanonNotionStructure(input: {
  canonName: string;
  notionParentPageId: string;
  notion: NotionProvisioningClient;
  repository: CanonProvisioningRepository;
  now?: Date;
}): Promise<CanonProvisioningResult> {
  const now = input.now ?? new Date();
  const existingCanon = await input.repository.findCanonByName(input.canonName);
  const canon =
    existingCanon ??
    (await input.repository.createCanon({
      name: input.canonName,
      notionParentPageId: input.notionParentPageId,
    }));
  const existingDatabases = await input.repository.listNotionDatabases(canon.id);
  const existingDatabasesByType = new Map(
    existingDatabases.map((database) => [database.elementType, database]),
  );
  const databases: CanonProvisioningResult["databases"] = [];

  for (const database of CANON_NOTION_DATABASES) {
    const existingDatabase = existingDatabasesByType.get(database.elementType);

    if (existingDatabase?.notionDatabaseId) {
      const reusedDatabase = await reuseExistingDatabase({
        databaseId: existingDatabase.notionDatabaseId,
        elementType: database.elementType,
        notion: input.notion,
      });
      const record = {
        ...existingDatabase,
        status: reusedDatabase.status,
        lastProvisionedAt: now,
        attentionReason: reusedDatabase.attentionReason,
      } satisfies CanonNotionDatabaseRecord;

      await input.repository.upsertNotionDatabase(record);
      databases.push({
        elementType: database.elementType,
        notionDatabaseId: existingDatabase.notionDatabaseId,
        status: reusedDatabase.status,
        attentionReason: reusedDatabase.attentionReason,
      });
      continue;
    }

    const createdDatabase = await createDatabase({
      canon,
      databaseTitle: database.databaseTitle,
      elementType: database.elementType,
      notion: input.notion,
    });
    const record = {
      canonId: canon.id,
      elementType: database.elementType,
      notionDatabaseId: createdDatabase.notionDatabaseId,
      status: createdDatabase.status,
      lastProvisionedAt: now,
      attentionReason: createdDatabase.attentionReason,
    } satisfies CanonNotionDatabaseRecord;

    await input.repository.upsertNotionDatabase(record);
    databases.push({
      elementType: database.elementType,
      notionDatabaseId: createdDatabase.notionDatabaseId,
      status: createdDatabase.status,
      attentionReason: createdDatabase.attentionReason,
    });
  }

  return {
    status: databases.some((database) => database.status === "needs_attention")
      ? "needs_attention"
      : "succeeded",
    canon,
    databases,
  };
}

async function reuseExistingDatabase(input: {
  databaseId: string;
  elementType: CanonElementType;
  notion: NotionProvisioningClient;
}): Promise<{
  status: "reused" | "needs_attention";
  attentionReason: string | null;
}> {
  try {
    const retrievedDatabase = await input.notion.databases.retrieve({
      database_id: input.databaseId,
    });
    const attentionReason = validateDatabaseProperties(
      retrievedDatabase.properties,
      input.elementType,
    );

    if (attentionReason) {
      return {
        status: "needs_attention",
        attentionReason,
      };
    }

    return {
      status: "reused",
      attentionReason: null,
    };
  } catch (error) {
    return {
      status: "needs_attention",
      attentionReason: formatNotionProvisioningError(error),
    };
  }
}

async function createDatabase(input: {
  canon: CanonRecord;
  databaseTitle: string;
  elementType: CanonElementType;
  notion: NotionProvisioningClient;
}): Promise<{
  notionDatabaseId: string | null;
  status: "created" | "needs_attention";
  attentionReason: string | null;
}> {
  try {
    const createdDatabase = await input.notion.databases.create({
      parent: {
        type: "page_id",
        page_id: input.canon.notionParentPageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: `${input.canon.name} ${input.databaseTitle}`,
          },
        },
      ],
      properties: requiredPropertiesFor(input.elementType),
    });

    return {
      notionDatabaseId: createdDatabase.id,
      status: "created",
      attentionReason: null,
    };
  } catch (error) {
    return {
      notionDatabaseId: null,
      status: "needs_attention",
      attentionReason: formatNotionProvisioningError(error),
    };
  }
}

function requiredPropertiesFor(elementType: CanonElementType): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    Name: {
      title: {},
    },
  };

  if (elementType === "Lore Entry") {
    properties.Subtype = {
      select: {
        options: [
          { name: "Species" },
          { name: "Culture" },
          { name: "Religion" },
          { name: "Magic System" },
          { name: "Technology" },
          { name: "Artifact" },
          { name: "Language" },
          { name: "Custom" },
          { name: "Law" },
          { name: "Other" },
        ],
      },
    };
  }

  if (elementType === "Relationship") {
    properties.Type = {
      select: {
        options: [
          { name: "Member Of" },
          { name: "Located In" },
          { name: "Allied With" },
          { name: "Opposed To" },
          { name: "Related To" },
          { name: "Created By" },
          { name: "Rules Over" },
          { name: "Participated In" },
        ],
      },
    };
    properties.Description = {
      rich_text: {},
    };
  }

  return properties;
}

function validateDatabaseProperties(
  properties: Record<string, unknown>,
  elementType: CanonElementType,
): string | null {
  const requiredProperties = requiredPropertiesFor(elementType);

  for (const [name, requiredProperty] of Object.entries(requiredProperties)) {
    if (!properties[name]) {
      return `${elementType} database is missing the ${name} property.`;
    }

    const requiredType = Object.keys(requiredProperty as Record<string, unknown>)[0];
    const actualType = (properties[name] as { type?: string }).type;

    if (actualType && actualType !== requiredType) {
      return `${elementType} database ${name} property must be ${requiredType}.`;
    }
  }

  return null;
}

function formatNotionProvisioningError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? error.code
      : null;

  if (
    code === "object_not_found" ||
    code === "unauthorized" ||
    code === "restricted_resource"
  ) {
    return "The internal Notion integration cannot access the configured parent page. Share the page with the integration and retry; Notion remains canonical.";
  }

  return "Notion provisioning failed. Review the internal Notion integration settings and retry; Notion remains canonical.";
}
