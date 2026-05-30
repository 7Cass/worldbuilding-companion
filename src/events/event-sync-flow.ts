import { Client } from "@notionhq/client";

import {
  formatLocalConfigErrors,
  loadLocalConfig,
  type Env,
} from "@/config/local-config";
import { createSidecarDb } from "@/db/client";
import {
  createDrizzleEventRepository,
  type EventSyncStateRepository,
  type EventSyncTarget,
} from "@/db/event-repository";
import {
  syncEventsFromNotion,
  type EventSyncRepository,
  type NotionEventSyncClient,
} from "@/notion/event-sync";
import { createNotionSdkEventSyncClient } from "@/notion/notion-sdk-event-sync-client";
import { classifyNotionSyncFailure } from "@/notion/notion-sync-failures";

export type EventSyncFlowResult =
  | {
      ok: true;
      syncedCount: number;
    }
  | {
      ok: false;
      errors: string[];
    };

type EventSyncStateWriter = Pick<
  EventSyncStateRepository,
  "markEventSyncStarted" | "markEventSyncSucceeded" | "markEventSyncFailed"
>;

export async function syncEventsFromLocalSetup(input?: {
  env?: Env;
}): Promise<EventSyncFlowResult> {
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
    const repository = createDrizzleEventRepository(db);
    const target = await repository.findEventSyncTarget();

    if (!target) {
      return {
        ok: false,
        errors: ["Provision the Events database before syncing Events."],
      };
    }

    return await syncEventsForTarget({
      target,
      notion: createNotionSdkEventSyncClient(
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

export async function syncEventsForTarget(input: {
  target: EventSyncTarget;
  notion: NotionEventSyncClient;
  repository: EventSyncRepository & EventSyncStateWriter;
  now?: Date;
}): Promise<EventSyncFlowResult> {
  const now = input.now ?? new Date();

  await input.repository.markEventSyncStarted(input.target.canonId);

  try {
    const result = await syncEventsFromNotion({
      canonId: input.target.canonId,
      eventsDatabaseId: input.target.eventsDatabaseId,
      notion: input.notion,
      repository: input.repository,
      now,
    });

    await input.repository.markEventSyncSucceeded(input.target.canonId, now);

    return {
      ok: true,
      syncedCount: result.syncedCount,
    };
  } catch (error) {
    const failure = classifyNotionSyncFailure(error, {
      pluralLabel: "Events",
      singularLabel: "Event",
    });

    await input.repository.markEventSyncFailed({
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
