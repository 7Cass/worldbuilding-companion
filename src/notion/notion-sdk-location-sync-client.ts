import type { Client } from "@notionhq/client";

import type { NotionLocationPage, NotionLocationSyncClient } from "./location-sync";

export function createNotionSdkLocationSyncClient(
  client: Client,
): NotionLocationSyncClient {
  return {
    async listLocationPages(input) {
      const database = await client.databases.retrieve({
        database_id: input.databaseId,
      });
      const dataSourceId = getFirstDataSourceId(database);
      const pages: NotionLocationPage[] = [];
      let startCursor: string | undefined;

      do {
        const response = await client.dataSources.query({
          data_source_id: dataSourceId,
          page_size: 100,
          start_cursor: startCursor,
        });

        for (const result of response.results) {
          pages.push(toNotionLocationPage(result));
        }

        startCursor = response.next_cursor ?? undefined;
      } while (startCursor);

      return pages;
    },
  };
}

function toNotionLocationPage(response: unknown): NotionLocationPage {
  if (
    !isRecord(response) ||
    response.object !== "page" ||
    typeof response.id !== "string" ||
    typeof response.created_time !== "string" ||
    typeof response.last_edited_time !== "string" ||
    !isRecord(response.properties)
  ) {
    throw new Error("Notion returned a Location query result without page properties.");
  }

  return {
    id: response.id,
    url: typeof response.url === "string" ? response.url : null,
    created_time: response.created_time,
    last_edited_time: response.last_edited_time,
    properties: response.properties,
  };
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
