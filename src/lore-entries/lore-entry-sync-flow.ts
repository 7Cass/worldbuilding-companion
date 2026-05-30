import { Client } from "@notionhq/client";

import {
  formatLocalConfigErrors,
  loadLocalConfig,
  type Env,
} from "@/config/local-config";
import { createSidecarDb } from "@/db/client";
import {
  createDrizzleLoreEntryRepository,
  type LoreEntrySyncStateRepository,
  type LoreEntrySyncTarget,
} from "@/db/lore-entry-repository";
import { createNotionSdkLoreEntrySyncClient } from "@/notion/notion-sdk-lore-entry-sync-client";
import { classifyNotionSyncFailure } from "@/notion/notion-sync-failures";
import {
  syncLoreEntriesFromNotion,
  type LoreEntrySyncRepository,
  type NotionLoreEntrySyncClient,
} from "@/notion/lore-entry-sync";

export type LoreEntrySyncFlowResult =
  | {
      ok: true;
      syncedCount: number;
    }
  | {
      ok: false;
      errors: string[];
    };

type LoreEntrySyncStateWriter = Pick<
  LoreEntrySyncStateRepository,
  | "markLoreEntrySyncStarted"
  | "markLoreEntrySyncSucceeded"
  | "markLoreEntrySyncFailed"
>;

export async function syncLoreEntriesFromLocalSetup(input?: {
  env?: Env;
}): Promise<LoreEntrySyncFlowResult> {
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
    const repository = createDrizzleLoreEntryRepository(db);
    const target = await repository.findLoreEntrySyncTarget();

    if (!target) {
      return {
        ok: false,
        errors: ["Provision the Lore Entries database before syncing Lore Entries."],
      };
    }

    return await syncLoreEntriesForTarget({
      target,
      notion: createNotionSdkLoreEntrySyncClient(
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

export async function syncLoreEntriesForTarget(input: {
  target: LoreEntrySyncTarget;
  notion: NotionLoreEntrySyncClient;
  repository: LoreEntrySyncRepository & LoreEntrySyncStateWriter;
  now?: Date;
}): Promise<LoreEntrySyncFlowResult> {
  const now = input.now ?? new Date();

  await input.repository.markLoreEntrySyncStarted(input.target.canonId);

  try {
    const result = await syncLoreEntriesFromNotion({
      canonId: input.target.canonId,
      loreEntriesDatabaseId: input.target.loreEntriesDatabaseId,
      notion: input.notion,
      repository: input.repository,
      now,
    });

    await input.repository.markLoreEntrySyncSucceeded(input.target.canonId, now);

    return {
      ok: true,
      syncedCount: result.syncedCount,
    };
  } catch (error) {
    const failure = classifyNotionSyncFailure(error, {
      pluralLabel: "Lore Entries",
      singularLabel: "Lore Entry",
    });

    await input.repository.markLoreEntrySyncFailed({
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
