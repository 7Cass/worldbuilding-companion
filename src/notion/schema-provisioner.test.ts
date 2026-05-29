import { describe, expect, it, vi } from "vitest";
import type { Client } from "@notionhq/client";

import {
  CANON_NOTION_DATABASES,
  type CanonElementType,
  type CanonNotionDatabaseRecord,
  type CanonRecord,
  type CanonProvisioningRepository,
  provisionCanonNotionStructure,
} from "./schema-provisioner";
import { createNotionSdkProvisioningClient } from "./notion-sdk-provisioning-client";

describe("provisionCanonNotionStructure", () => {
  it("creates one Canon and the owned Notion databases as derived sidecar state", async () => {
    const repository = createInMemoryCanonProvisioningRepository();
    const { notion, sdk } = createMockNotionSdkClient();

    const result = await provisionCanonNotionStructure({
      canonName: "Ashen Coast",
      notionParentPageId: "notion-parent-page",
      notion,
      repository,
      now: new Date("2026-05-29T12:00:00.000Z"),
    });

    expect(result.status).toBe("succeeded");
    expect(result.canon).toEqual({
      id: "canon-1",
      name: "Ashen Coast",
      notionParentPageId: "notion-parent-page",
    });
    expect(result.databases.map((database) => database.status)).toEqual(
      CANON_NOTION_DATABASES.map(() => "created"),
    );
    expect(result.databases.map((database) => database.elementType)).toEqual(
      CANON_NOTION_DATABASES.map((database) => database.elementType),
    );

    expect(sdk.databases.create).toHaveBeenCalledTimes(CANON_NOTION_DATABASES.length);
    expect(sdk.databases.create).toHaveBeenCalledWith(
      expect.objectContaining({
        parent: {
          type: "page_id",
          page_id: "notion-parent-page",
        },
        title: [
          {
            type: "text",
            text: {
              content: "Ashen Coast Characters",
            },
          },
        ],
        initial_data_source: {
          properties: expect.objectContaining({
            Name: {
              title: {},
            },
          }),
        },
      }),
    );

    expect(repository.canons).toEqual([
      {
        id: "canon-1",
        name: "Ashen Coast",
        notionParentPageId: "notion-parent-page",
      },
    ]);
    expect(repository.notionDatabases).toEqual(
      CANON_NOTION_DATABASES.map((database, index) => ({
        canonId: "canon-1",
        elementType: database.elementType,
        notionDatabaseId: `created-database-${index + 1}`,
        status: "created",
        lastProvisionedAt: new Date("2026-05-29T12:00:00.000Z"),
        attentionReason: null,
      })),
    );
  });

  it("retrieves existing database schema from the Notion data source", async () => {
    const { notion, sdk } = createMockNotionSdkClient({
      retrievedDatabases: {
        "existing-database-1": {
          id: "existing-database-1",
          properties: {
            Name: {
              type: "title",
            },
          },
        },
      },
    });

    const database = await notion.databases.retrieve({
      database_id: "existing-database-1",
    });

    expect(database).toEqual({
      id: "existing-database-1",
      properties: {
        Name: {
          type: "title",
        },
      },
    });
    expect(sdk.databases.retrieve).toHaveBeenCalledWith({
      database_id: "existing-database-1",
    });
    expect(sdk.dataSources.retrieve).toHaveBeenCalledWith({
      data_source_id: "existing-database-1-data-source",
    });
  });

  it("does not send ignored legacy database properties to the Notion SDK", async () => {
    const { notion, sdk } = createMockNotionSdkClient();

    const database = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: "notion-parent-page",
      },
      title: [
        {
          type: "text",
          text: {
            content: "Ashen Coast Characters",
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
      },
    });

    expect(database).toEqual({
      id: "created-database-1",
    });
    expect(sdk.databases.create).toHaveBeenCalledWith(
      expect.objectContaining({
        initial_data_source: {
          properties: {
            Name: {
              title: {},
            },
          },
        },
      }),
    );
    expect(sdk.databases.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.anything(),
      }),
    );
  });

  it("reuses and validates existing Notion databases without creating duplicates", async () => {
    const previousProvisionedAt = new Date("2026-05-28T12:00:00.000Z");
    const nextProvisionedAt = new Date("2026-05-29T12:00:00.000Z");
    const repository = createInMemoryCanonProvisioningRepository({
      canons: [
        {
          id: "canon-1",
          name: "Ashen Coast",
          notionParentPageId: "notion-parent-page",
        },
      ],
      notionDatabases: CANON_NOTION_DATABASES.map((database, index) => ({
        canonId: "canon-1",
        elementType: database.elementType,
        notionDatabaseId: `existing-database-${index + 1}`,
        status: "created",
        lastProvisionedAt: previousProvisionedAt,
        attentionReason: null,
      })),
    });
    const { notion, sdk } = createMockNotionSdkClient({
      retrievedDatabases: Object.fromEntries(
        CANON_NOTION_DATABASES.map((database, index) => [
          `existing-database-${index + 1}`,
          {
            id: `existing-database-${index + 1}`,
            properties: requiredMockPropertiesFor(database.elementType),
          },
        ]),
      ),
    });

    const result = await provisionCanonNotionStructure({
      canonName: "Ashen Coast",
      notionParentPageId: "notion-parent-page",
      notion,
      repository,
      now: nextProvisionedAt,
    });

    expect(result.status).toBe("succeeded");
    expect(result.databases.map((database) => database.status)).toEqual(
      CANON_NOTION_DATABASES.map(() => "reused"),
    );
    expect(sdk.databases.create).not.toHaveBeenCalled();
    expect(sdk.databases.retrieve).toHaveBeenCalledTimes(CANON_NOTION_DATABASES.length);
    expect(repository.notionDatabases).toEqual(
      CANON_NOTION_DATABASES.map((database, index) => ({
        canonId: "canon-1",
        elementType: database.elementType,
        notionDatabaseId: `existing-database-${index + 1}`,
        status: "reused",
        lastProvisionedAt: nextProvisionedAt,
        attentionReason: null,
      })),
    );
  });

  it("reports missing Notion permissions without treating Postgres as the Canon source", async () => {
    const repository = createInMemoryCanonProvisioningRepository();
    const { notion } = createMockNotionSdkClient({
      createError: Object.assign(new Error("Could not access parent page."), {
        code: "object_not_found",
      }),
    });

    const result = await provisionCanonNotionStructure({
      canonName: "Ashen Coast",
      notionParentPageId: "notion-parent-page",
      notion,
      repository,
      now: new Date("2026-05-29T12:00:00.000Z"),
    });

    expect(result.status).toBe("needs_attention");
    expect(result.canon).toEqual({
      id: "canon-1",
      name: "Ashen Coast",
      notionParentPageId: "notion-parent-page",
    });
    expect(result.databases.map((database) => database.status)).toEqual(
      CANON_NOTION_DATABASES.map(() => "needs_attention"),
    );
    expect(result.databases.map((database) => database.notionDatabaseId)).toEqual(
      CANON_NOTION_DATABASES.map(() => null),
    );
    expect(result.databases[0]?.attentionReason).toContain("internal Notion integration");
    expect(result.databases[0]?.attentionReason).toContain("Notion remains canonical");
    expect(repository.notionDatabases).toEqual(
      CANON_NOTION_DATABASES.map((database) => ({
        canonId: "canon-1",
        elementType: database.elementType,
        notionDatabaseId: null,
        status: "needs_attention",
        lastProvisionedAt: new Date("2026-05-29T12:00:00.000Z"),
        attentionReason:
          "The internal Notion integration cannot access the configured parent page. Share the page with the integration and retry; Notion remains canonical.",
      })),
    );
  });
});

function createMockNotionSdkClient(input?: {
  createError?: Error;
  retrievedDatabases?: Record<
    string,
    {
      id: string;
      properties: Record<string, unknown>;
    }
  >;
}) {
  let nextDatabaseId = 1;

  const sdk = {
    databases: {
      create: vi.fn(async () => {
        if (input?.createError) {
          throw input.createError;
        }

        return {
          id: `created-database-${nextDatabaseId++}`,
          data_sources: [
            {
              id: `created-database-${nextDatabaseId - 1}-data-source`,
              name: "Default",
            },
          ],
        };
      }),
      retrieve: vi.fn(async ({ database_id }) => {
        const database = input?.retrievedDatabases?.[database_id];

        if (!database) {
          throw new Error(`Missing mock database ${database_id}.`);
        }

        return {
          id: database.id,
          data_sources: [
            {
              id: `${database.id}-data-source`,
              name: "Default",
            },
          ],
        };
      }),
    },
    dataSources: {
      retrieve: vi.fn(async ({ data_source_id }) => {
        const databaseId = data_source_id.replace(/-data-source$/, "");
        const database = input?.retrievedDatabases?.[databaseId];

        if (!database) {
          throw new Error(`Missing mock data source ${data_source_id}.`);
        }

        return {
          id: data_source_id,
          properties: database.properties,
        };
      }),
    },
  };

  return {
    notion: createNotionSdkProvisioningClient(sdk as unknown as Client),
    sdk,
  };
}

function createInMemoryCanonProvisioningRepository(input?: {
  canons?: CanonRecord[];
  notionDatabases?: CanonNotionDatabaseRecord[];
}): CanonProvisioningRepository & {
  canons: CanonRecord[];
  notionDatabases: CanonNotionDatabaseRecord[];
} {
  const canons = [...(input?.canons ?? [])];
  const notionDatabases = [...(input?.notionDatabases ?? [])];

  return {
    canons,
    notionDatabases,
    async findCanonByName(name) {
      return canons.find((canon) => canon.name === name) ?? null;
    },
    async createCanon(input) {
      const canon = {
        id: "canon-1",
        name: input.name,
        notionParentPageId: input.notionParentPageId,
      };

      canons.push(canon);

      return canon;
    },
    async listNotionDatabases(canonId) {
      return notionDatabases.filter((database) => database.canonId === canonId);
    },
    async upsertNotionDatabase(record) {
      const existingIndex = notionDatabases.findIndex(
        (database) =>
          database.canonId === record.canonId &&
          database.elementType === record.elementType,
      );

      if (existingIndex >= 0) {
        notionDatabases[existingIndex] = record;
      } else {
        notionDatabases.push(record);
      }
    },
  };
}

function requiredMockPropertiesFor(elementType: CanonElementType): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    Name: {
      type: "title",
    },
  };

  if (elementType === "Lore Entry") {
    properties.Subtype = {
      type: "select",
    };
  }

  if (elementType === "Relationship") {
    properties.Type = {
      type: "select",
    };
    properties.Description = {
      type: "rich_text",
    };
  }

  return properties;
}
