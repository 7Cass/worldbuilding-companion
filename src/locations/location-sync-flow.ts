import { Client } from "@notionhq/client";

import {
  formatLocalConfigErrors,
  loadLocalConfig,
  type Env,
} from "@/config/local-config";
import { createSidecarDb } from "@/db/client";
import {
  createDrizzleLocationRepository,
  type LocationSyncStateRepository,
  type LocationSyncTarget,
} from "@/db/location-repository";
import { createNotionSdkLocationSyncClient } from "@/notion/notion-sdk-location-sync-client";
import {
  syncLocationsFromNotion,
  type LocationSyncRepository,
  type NotionLocationSyncClient,
} from "@/notion/location-sync";
import { classifyNotionSyncFailure } from "@/notion/notion-sync-failures";

export type LocationSyncFlowResult =
  | {
      ok: true;
      syncedCount: number;
    }
  | {
      ok: false;
      errors: string[];
    };

type LocationSyncStateWriter = Pick<
  LocationSyncStateRepository,
  "markLocationSyncStarted" | "markLocationSyncSucceeded" | "markLocationSyncFailed"
>;

export async function syncLocationsFromLocalSetup(input?: {
  env?: Env;
}): Promise<LocationSyncFlowResult> {
  const env = input?.env ?? process.env;
  const configResult = loadLocalConfig(env);

  if (!configResult.ok) {
    return {
      ok: false,
      errors: [formatLocalConfigErrors(configResult.errors)],
    };
  }

  const { db, pool } = createSidecarDb(env);

  try {
    const repository = createDrizzleLocationRepository(db);
    const target = await repository.findLocationSyncTarget();

    if (!target) {
      return {
        ok: false,
        errors: ["Provision the Locations database before syncing Locations."],
      };
    }

    return await syncLocationsForTarget({
      target,
      notion: createNotionSdkLocationSyncClient(
        new Client({
          auth: configResult.config.notion.token,
        }),
      ),
      repository,
    });
  } finally {
    await pool.end();
  }
}

export async function syncLocationsForTarget(input: {
  target: LocationSyncTarget;
  notion: NotionLocationSyncClient;
  repository: LocationSyncRepository & LocationSyncStateWriter;
  now?: Date;
}): Promise<LocationSyncFlowResult> {
  const now = input.now ?? new Date();

  await input.repository.markLocationSyncStarted(input.target.canonId);

  try {
    const result = await syncLocationsFromNotion({
      canonId: input.target.canonId,
      locationsDatabaseId: input.target.locationsDatabaseId,
      notion: input.notion,
      repository: input.repository,
      now,
    });

    await input.repository.markLocationSyncSucceeded(input.target.canonId, now);

    return {
      ok: true,
      syncedCount: result.syncedCount,
    };
  } catch (error) {
    const failure = classifyNotionSyncFailure(error, {
      pluralLabel: "Locations",
      singularLabel: "Location",
    });

    await input.repository.markLocationSyncFailed({
      canonId: input.target.canonId,
      category: failure.category,
      message: failure.message,
    });

    return {
      ok: false,
      errors: [failure.message],
    };
  }
}
