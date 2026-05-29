import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type {
  CanonNotionDatabaseRecord,
  CanonProvisioningRepository,
  CanonRecord,
} from "@/notion/schema-provisioner";
import * as schema from "./schema";

export type SidecarDb = NodePgDatabase<typeof schema>;

export function createDrizzleCanonProvisioningRepository(
  db: SidecarDb,
): CanonProvisioningRepository {
  return {
    async findCanonByName(name) {
      const [canon] = await db
        .select()
        .from(schema.canons)
        .where(eq(schema.canons.name, name))
        .limit(1);

      return canon ? toCanonRecord(canon) : null;
    },
    async createCanon(input) {
      const [canon] = await db
        .insert(schema.canons)
        .values({
          name: input.name,
          notionParentPageId: input.notionParentPageId,
        })
        .returning();

      if (!canon) {
        throw new Error("Failed to record the Canon identity in sidecar state.");
      }

      return toCanonRecord(canon);
    },
    async listNotionDatabases(canonId) {
      const databases = await db
        .select()
        .from(schema.canonNotionDatabases)
        .where(eq(schema.canonNotionDatabases.canonId, canonId));

      return databases.map(toCanonNotionDatabaseRecord);
    },
    async upsertNotionDatabase(record) {
      await db
        .insert(schema.canonNotionDatabases)
        .values(record)
        .onConflictDoUpdate({
          target: [
            schema.canonNotionDatabases.canonId,
            schema.canonNotionDatabases.elementType,
          ],
          set: {
            notionDatabaseId: record.notionDatabaseId,
            status: record.status,
            lastProvisionedAt: record.lastProvisionedAt,
            attentionReason: record.attentionReason,
            updatedAt: new Date(),
          },
        });
    },
  };
}

function toCanonRecord(canon: typeof schema.canons.$inferSelect): CanonRecord {
  return {
    id: canon.id,
    name: canon.name,
    notionParentPageId: canon.notionParentPageId,
  };
}

function toCanonNotionDatabaseRecord(
  database: typeof schema.canonNotionDatabases.$inferSelect,
): CanonNotionDatabaseRecord {
  return {
    canonId: database.canonId,
    elementType: database.elementType,
    notionDatabaseId: database.notionDatabaseId,
    status: database.status,
    lastProvisionedAt: database.lastProvisionedAt,
    attentionReason: database.attentionReason,
  };
}
