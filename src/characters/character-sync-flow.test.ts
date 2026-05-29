import { describe, expect, it } from "vitest";

import type { CharacterSyncStateRepository } from "@/db/character-repository";
import type {
  CharacterSyncRepository,
  DerivedCharacterRecord,
  NotionCharacterSyncClient,
} from "@/notion/character-sync";
import type { SyncFailureCategory } from "@/sync/canon-sync-state";
import { syncCharactersForTarget } from "./character-sync-flow";

describe("syncCharactersForTarget", () => {
  it("records an understandable failure without changing existing derived Characters", async () => {
    const repository = createInMemoryCharacterSyncFlowRepository({
      lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
      characters: [
        createDerivedCharacter({
          notionPageId: "notion-character-page-1",
          name: "Mira Vale",
        }),
      ],
    });
    const notion: NotionCharacterSyncClient = {
      async listCharacterPages() {
        throw {
          code: "restricted_resource",
          message:
            "The integration cannot access this database with token secret_notion_token.",
        };
      },
    };

    const result = await syncCharactersForTarget({
      target: {
        canonId: "canon-1",
        charactersDatabaseId: "characters-database",
      },
      notion,
      repository,
      now: new Date("2026-05-29T13:00:00.000Z"),
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        "Share the Characters database with the internal Notion integration, then retry sync.",
      ],
    });
    expect(repository.characters).toEqual([
      createDerivedCharacter({
        notionPageId: "notion-character-page-1",
        name: "Mira Vale",
      }),
    ]);
    expect(repository.upsertCalls).toBe(0);
    expect(repository.syncState).toEqual({
      status: "failed",
      lastSucceededAt: new Date("2026-05-29T12:00:00.000Z"),
      failureCategory: "missing_permissions",
      failureMessage:
        "Share the Characters database with the internal Notion integration, then retry sync.",
    });
    expect(repository.syncState.failureMessage).not.toContain("secret_notion_token");
  });
});

function createInMemoryCharacterSyncFlowRepository(input: {
  lastSucceededAt: Date | null;
  characters: DerivedCharacterRecord[];
}): CharacterSyncRepository &
  CharacterSyncStateRepository & {
    characters: DerivedCharacterRecord[];
    upsertCalls: number;
    syncState: {
      status: "idle" | "syncing" | "succeeded" | "failed";
      lastSucceededAt: Date | null;
      failureCategory: SyncFailureCategory | null;
      failureMessage: string | null;
    };
  } {
  return {
    characters: [...input.characters],
    upsertCalls: 0,
    syncState: {
      status: "succeeded",
      lastSucceededAt: input.lastSucceededAt,
      failureCategory: null,
      failureMessage: null,
    },
    async findCharacterSyncTarget() {
      return {
        canonId: "canon-1",
        charactersDatabaseId: "characters-database",
      };
    },
    async markCharacterSyncStarted() {
      this.syncState = {
        status: "syncing",
        lastSucceededAt: this.syncState.lastSucceededAt,
        failureCategory: null,
        failureMessage: null,
      };
    },
    async markCharacterSyncSucceeded(_canonId, succeededAt) {
      this.syncState = {
        status: "succeeded",
        lastSucceededAt: succeededAt,
        failureCategory: null,
        failureMessage: null,
      };
    },
    async markCharacterSyncFailed(failure) {
      this.syncState = {
        status: "failed",
        lastSucceededAt: this.syncState.lastSucceededAt,
        failureCategory: failure.category as SyncFailureCategory,
        failureMessage: failure.message,
      };
    },
    async upsertCharacters(records) {
      this.upsertCalls += 1;
      this.characters = records;
    },
  };
}

function createDerivedCharacter(input: {
  notionPageId: string;
  name: string;
}): DerivedCharacterRecord {
  return {
    canonId: "canon-1",
    notionPageId: input.notionPageId,
    name: input.name,
    notionUrl: `https://notion.so/${input.notionPageId}`,
    notionCreatedAt: new Date("2026-05-28T10:00:00.000Z"),
    notionLastEditedAt: new Date("2026-05-29T11:00:00.000Z"),
    lastSyncedAt: new Date("2026-05-29T12:00:00.000Z"),
  };
}
