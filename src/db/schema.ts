import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const syncStatus = pgEnum("sync_status", [
  "idle",
  "syncing",
  "succeeded",
  "failed",
]);

export const canons = pgTable("canons", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  notionParentPageId: text("notion_parent_page_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sidecarSyncState = pgTable(
  "sidecar_sync_state",
  {
    canonId: uuid("canon_id")
      .notNull()
      .references(() => canons.id, { onDelete: "cascade" }),
    source: text("source").notNull(),
    status: syncStatus("status").notNull().default("idle"),
    lastSucceededAt: timestamp("last_succeeded_at", { withTimezone: true }),
    failureCategory: text("failure_category"),
    failureMessage: text("failure_message"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.canonId, table.source] }),
  }),
);

export const canonsRelations = relations(canons, ({ many }) => ({
  syncStates: many(sidecarSyncState),
}));

export const sidecarSyncStateRelations = relations(sidecarSyncState, ({ one }) => ({
  canon: one(canons, {
    fields: [sidecarSyncState.canonId],
    references: [canons.id],
  }),
}));
