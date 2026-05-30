import { Client } from "@notionhq/client";

import {
  formatLocalConfigErrors,
  loadLocalConfig,
  type Env,
} from "@/config/local-config";
import { createSidecarDb } from "@/db/client";
import {
  createDrizzleCharacterRepository,
  type CharacterSyncStateRepository,
  type CharacterSyncTarget,
} from "@/db/character-repository";
import { createNotionSdkCharacterSyncClient } from "@/notion/notion-sdk-character-sync-client";
import {
  syncCharactersFromNotion,
  type CharacterSyncRepository,
  type NotionCharacterSyncClient,
} from "@/notion/character-sync";
import { classifyNotionSyncFailure } from "@/notion/notion-sync-failures";

export type CharacterSyncFlowResult =
  | {
      ok: true;
      syncedCount: number;
    }
  | {
      ok: false;
      errors: string[];
    };

type CharacterSyncStateWriter = Pick<
  CharacterSyncStateRepository,
  "markCharacterSyncStarted" | "markCharacterSyncSucceeded" | "markCharacterSyncFailed"
>;

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

    return await syncCharactersForTarget({
      target,
      notion: createNotionSdkCharacterSyncClient(
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

export async function syncCharactersForTarget(input: {
  target: CharacterSyncTarget;
  notion: NotionCharacterSyncClient;
  repository: CharacterSyncRepository & CharacterSyncStateWriter;
  now?: Date;
}): Promise<CharacterSyncFlowResult> {
  const now = input.now ?? new Date();

  await input.repository.markCharacterSyncStarted(input.target.canonId);

  try {
    const result = await syncCharactersFromNotion({
      canonId: input.target.canonId,
      charactersDatabaseId: input.target.charactersDatabaseId,
      notion: input.notion,
      repository: input.repository,
      now,
    });

    await input.repository.markCharacterSyncSucceeded(input.target.canonId, now);

    return {
      ok: true,
      syncedCount: result.syncedCount,
    };
  } catch (error) {
    const failure = classifyNotionSyncFailure(error);

    await input.repository.markCharacterSyncFailed({
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
