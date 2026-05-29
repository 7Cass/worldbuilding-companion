import { Client } from "@notionhq/client";

import {
  formatLocalConfigErrors,
  loadLocalConfig,
  type Env,
} from "@/config/local-config";
import { createSidecarDb } from "@/db/client";
import {
  createDrizzleFactionRepository,
  type FactionSyncStateRepository,
  type FactionSyncTarget,
} from "@/db/faction-repository";
import {
  syncFactionsFromNotion,
  type FactionSyncRepository,
  type NotionFactionSyncClient,
} from "@/notion/faction-sync";
import { createNotionSdkFactionSyncClient } from "@/notion/notion-sdk-faction-sync-client";
import { classifyNotionSyncFailure } from "@/notion/notion-sync-failures";

export type FactionSyncFlowResult =
  | {
      ok: true;
      syncedCount: number;
    }
  | {
      ok: false;
      errors: string[];
    };

export async function syncFactionsFromLocalSetup(input?: {
  env?: Env;
}): Promise<FactionSyncFlowResult> {
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
    const repository = createDrizzleFactionRepository(db);
    const target = await repository.findFactionSyncTarget();

    if (!target) {
      return {
        ok: false,
        errors: ["Provision the Factions database before syncing Factions."],
      };
    }

    return await syncFactionsForTarget({
      target,
      notion: createNotionSdkFactionSyncClient(
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

export async function syncFactionsForTarget(input: {
  target: FactionSyncTarget;
  notion: NotionFactionSyncClient;
  repository: FactionSyncRepository & FactionSyncStateRepository;
  now?: Date;
}): Promise<FactionSyncFlowResult> {
  const now = input.now ?? new Date();

  await input.repository.markFactionSyncStarted(input.target.canonId);

  try {
    const result = await syncFactionsFromNotion({
      canonId: input.target.canonId,
      factionsDatabaseId: input.target.factionsDatabaseId,
      notion: input.notion,
      repository: input.repository,
      now,
    });

    await input.repository.markFactionSyncSucceeded(input.target.canonId, now);

    return {
      ok: true,
      syncedCount: result.syncedCount,
    };
  } catch (error) {
    const failure = classifyNotionSyncFailure(error, {
      pluralLabel: "Factions",
      singularLabel: "Faction",
    });

    await input.repository.markFactionSyncFailed({
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
