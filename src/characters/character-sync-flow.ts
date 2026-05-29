import { Client } from "@notionhq/client";

import {
  formatLocalConfigErrors,
  loadLocalConfig,
  type Env,
} from "@/config/local-config";
import { createSidecarDb } from "@/db/client";
import { createDrizzleCharacterRepository } from "@/db/character-repository";
import { createNotionSdkCharacterSyncClient } from "@/notion/notion-sdk-character-sync-client";
import { syncCharactersFromNotion } from "@/notion/character-sync";

export type CharacterSyncFlowResult =
  | {
      ok: true;
      syncedCount: number;
    }
  | {
      ok: false;
      errors: string[];
    };

export async function syncCharactersFromLocalSetup(input?: {
  env?: Env;
}): Promise<CharacterSyncFlowResult> {
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
    const repository = createDrizzleCharacterRepository(db);
    const target = await repository.findCharacterSyncTarget();

    if (!target) {
      return {
        ok: false,
        errors: ["Provision the Characters database before syncing Characters."],
      };
    }

    await repository.markCharacterSyncStarted(target.canonId);

    try {
      const now = new Date();
      const result = await syncCharactersFromNotion({
        canonId: target.canonId,
        charactersDatabaseId: target.charactersDatabaseId,
        notion: createNotionSdkCharacterSyncClient(
          new Client({
            auth: configResult.config.notion.token,
          }),
        ),
        repository,
        now,
      });

      await repository.markCharacterSyncSucceeded(target.canonId, now);

      return {
        ok: true,
        syncedCount: result.syncedCount,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Character sync failed unexpectedly.";

      await repository.markCharacterSyncFailed({
        canonId: target.canonId,
        category: "notion_sync_failed",
        message,
      });

      return {
        ok: false,
        errors: [message],
      };
    }
  } finally {
    await pool.end();
  }
}
