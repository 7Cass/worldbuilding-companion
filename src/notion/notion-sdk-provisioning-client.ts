import type { Client } from "@notionhq/client";

import type {
  NotionDatabaseIdentity,
  NotionDatabaseResponse,
  NotionProvisioningClient,
} from "./schema-provisioner";

export function createNotionSdkProvisioningClient(
  client: Client,
): NotionProvisioningClient {
  return {
    databases: {
      async create(input) {
        const response = await client.databases.create({
          parent: input.parent,
          title: input.title,
          initial_data_source: {
            properties: input.properties,
          },
        } as Parameters<Client["databases"]["create"]>[0]);

        return toDatabaseIdentity(response);
      },
      async retrieve(input) {
        const databaseResponse = await client.databases.retrieve(input);
        const databaseId = getResponseId(databaseResponse, "database");
        const dataSourceId = getFirstDataSourceId(databaseResponse);
        const dataSourceResponse = await client.dataSources.retrieve({
          data_source_id: dataSourceId,
        });

        return toDatabaseResponse(databaseId, dataSourceResponse);
      },
    },
  };
}

function toDatabaseIdentity(response: unknown): NotionDatabaseIdentity {
  return {
    id: getResponseId(response, "database"),
  };
}

function toDatabaseResponse(
  databaseId: string,
  dataSourceResponse: unknown,
): NotionDatabaseResponse {
  if (!isRecord(dataSourceResponse) || !isRecord(dataSourceResponse.properties)) {
    throw new Error("Notion returned a data source response without properties.");
  }

  return {
    id: databaseId,
    properties: dataSourceResponse.properties,
  };
}

function getResponseId(response: unknown, responseType: string): string {
  if (!isRecord(response) || typeof response.id !== "string") {
    throw new Error(`Notion returned a ${responseType} response without an id.`);
  }

  return response.id;
}

function getFirstDataSourceId(databaseResponse: unknown): string {
  if (!isRecord(databaseResponse) || !Array.isArray(databaseResponse.data_sources)) {
    throw new Error("Notion returned a database response without data sources.");
  }

  const [dataSource] = databaseResponse.data_sources;

  if (!isRecord(dataSource) || typeof dataSource.id !== "string") {
    throw new Error("Notion returned a database response without a data source id.");
  }

  return dataSource.id;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
