import type { Client } from "@notionhq/client";

import type {
  NotionDatabaseResponse,
  NotionProvisioningClient,
} from "./schema-provisioner";

export function createNotionSdkProvisioningClient(
  client: Client,
): NotionProvisioningClient {
  return {
    databases: {
      async create(input) {
        const response = await client.databases.create(
          input as Parameters<Client["databases"]["create"]>[0],
        );

        return toDatabaseResponse(response);
      },
      async retrieve(input) {
        const response = await client.databases.retrieve(input);

        return toDatabaseResponse(response);
      },
    },
  };
}

function toDatabaseResponse(response: unknown): NotionDatabaseResponse {
  if (!isRecord(response) || typeof response.id !== "string") {
    throw new Error("Notion returned a database response without an id.");
  }

  if (!isRecord(response.properties)) {
    throw new Error("Notion returned a database response without properties.");
  }

  return {
    id: response.id,
    properties: response.properties,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
