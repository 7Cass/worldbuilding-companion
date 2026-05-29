import { desc, eq } from "drizzle-orm";

import type { CharacterBrowserItem } from "@/characters/character-browser";
import type { CanonDashboardRepository, DashboardCharacter } from "@/dashboard/canon-dashboard";
import type { CharacterSyncRepository } from "@/notion/character-sync";
import type { CharacterWorkspaceRecord } from "@/workspace/character-workspace";
import type { SidecarDb } from "./canon-provisioning-repository";
import * as schema from "./schema";

const CHARACTER_SYNC_SOURCE = "Characters";

export type CharacterSyncTarget = {
  canonId: string;
  charactersDatabaseId: string;
};

export type CharacterReadRepository = {
  listCharacters(): Promise<CharacterBrowserItem[]>;
  findCharacterById(id: string): Promise<CharacterWorkspaceRecord | null>;
};

export type CharacterSyncStateRepository = {
  findCharacterSyncTarget(): Promise<CharacterSyncTarget | null>;
  markCharacterSyncStarted(canonId: string): Promise<void>;
  markCharacterSyncSucceeded(canonId: string, succeededAt: Date): Promise<void>;
  markCharacterSyncFailed(input: {
    canonId: string;
    category: string;
    message: string;
  }): Promise<void>;
};

export type CharacterRepository = CharacterSyncRepository &
  CanonDashboardRepository &
  CharacterReadRepository &
  CharacterSyncStateRepository;

export function createDrizzleCharacterRepository(db: SidecarDb): CharacterRepository {
  return {
    async findCharacterSyncTarget() {
      const [database] = await db
        .select({
          canonId: schema.canonNotionDatabases.canonId,
          notionDatabaseId: schema.canonNotionDatabases.notionDatabaseId,
          status: schema.canonNotionDatabases.status,
        })
        .from(schema.canonNotionDatabases)
        .where(eq(schema.canonNotionDatabases.elementType, "Character"))
        .limit(1);

      if (!database?.notionDatabaseId || database.status === "needs_attention") {
        return null;
      }

      return {
        canonId: database.canonId,
        charactersDatabaseId: database.notionDatabaseId,
      };
    },
    async markCharacterSyncStarted(canonId) {
      await upsertSyncState(db, {
        canonId,
        status: "syncing",
        lastSucceededAt: null,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markCharacterSyncSucceeded(canonId, succeededAt) {
      await upsertSyncState(db, {
        canonId,
        status: "succeeded",
        lastSucceededAt: succeededAt,
        failureCategory: null,
        failureMessage: null,
      });
    },
    async markCharacterSyncFailed(input) {
      await upsertSyncState(db, {
        canonId: input.canonId,
        status: "failed",
        lastSucceededAt: null,
        failureCategory: input.category,
        failureMessage: input.message,
      });
    },
    async upsertCharacters(records) {
      for (const record of records) {
        await db
          .insert(schema.characters)
          .values(record)
          .onConflictDoUpdate({
            target: [schema.characters.canonId, schema.characters.notionPageId],
            set: {
              name: record.name,
              notionUrl: record.notionUrl,
              notionCreatedAt: record.notionCreatedAt,
              notionLastEditedAt: record.notionLastEditedAt,
              lastSyncedAt: record.lastSyncedAt,
              updatedAt: new Date(),
            },
          });
      }
    },
    async listCharactersForDashboard() {
      const characters = await db
        .select()
        .from(schema.characters)
        .orderBy(desc(schema.characters.notionLastEditedAt));

      return characters.map(toDashboardCharacter);
    },
    async listCharacters() {
      const characters = await db
        .select()
        .from(schema.characters)
        .orderBy(desc(schema.characters.notionLastEditedAt));

      return characters.map(toCharacterBrowserItem);
    },
    async findCharacterById(id) {
      const [character] = await db
        .select()
        .from(schema.characters)
        .where(eq(schema.characters.id, id))
        .limit(1);

      return character ? toCharacterWorkspaceRecord(character) : null;
    },
  };
}

async function upsertSyncState(
  db: SidecarDb,
  input: {
    canonId: string;
    status: "syncing" | "succeeded" | "failed";
    lastSucceededAt: Date | null;
    failureCategory: string | null;
    failureMessage: string | null;
  },
) {
  await db
    .insert(schema.sidecarSyncState)
    .values({
      canonId: input.canonId,
      source: CHARACTER_SYNC_SOURCE,
      status: input.status,
      lastSucceededAt: input.lastSucceededAt,
      failureCategory: input.failureCategory,
      failureMessage: input.failureMessage,
    })
    .onConflictDoUpdate({
      target: [schema.sidecarSyncState.canonId, schema.sidecarSyncState.source],
      set: {
        status: input.status,
        lastSucceededAt: input.lastSucceededAt,
        failureCategory: input.failureCategory,
        failureMessage: input.failureMessage,
        updatedAt: new Date(),
      },
    });
}

function toDashboardCharacter(
  character: typeof schema.characters.$inferSelect,
): DashboardCharacter {
  return {
    id: character.id,
    name: character.name,
    notionLastEditedAt: character.notionLastEditedAt,
    lastSyncedAt: character.lastSyncedAt,
  };
}

function toCharacterBrowserItem(
  character: typeof schema.characters.$inferSelect,
): CharacterBrowserItem {
  return {
    id: character.id,
    name: character.name,
    notionLastEditedAt: character.notionLastEditedAt,
    lastSyncedAt: character.lastSyncedAt,
  };
}

function toCharacterWorkspaceRecord(
  character: typeof schema.characters.$inferSelect,
): CharacterWorkspaceRecord {
  return {
    id: character.id,
    name: character.name,
    notionPageId: character.notionPageId,
    notionUrl: character.notionUrl,
    notionCreatedAt: character.notionCreatedAt,
    notionLastEditedAt: character.notionLastEditedAt,
    lastSyncedAt: character.lastSyncedAt,
  };
}
