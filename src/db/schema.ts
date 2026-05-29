import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const syncStatus = pgEnum("sync_status", [
  "idle",
  "syncing",
  "succeeded",
  "failed",
]);

export const canonElementType = pgEnum("canon_element_type", [
  "Character",
  "Location",
  "Faction",
  "Event",
  "Lore Entry",
  "Relationship",
  "Source",
]);

export const provisioningStatus = pgEnum("provisioning_status", [
  "created",
  "reused",
  "needs_attention",
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

export const canonNotionDatabases = pgTable(
  "canon_notion_databases",
  {
    canonId: uuid("canon_id")
      .notNull()
      .references(() => canons.id, { onDelete: "cascade" }),
    elementType: canonElementType("element_type").notNull(),
    notionDatabaseId: text("notion_database_id"),
    status: provisioningStatus("status").notNull(),
    lastProvisionedAt: timestamp("last_provisioned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    attentionReason: text("attention_reason"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.canonId, table.elementType] }),
  }),
);

export const characters = pgTable(
  "characters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    canonId: uuid("canon_id")
      .notNull()
      .references(() => canons.id, { onDelete: "cascade" }),
    notionPageId: text("notion_page_id").notNull(),
    name: text("name").notNull(),
    notionUrl: text("notion_url"),
    notionCreatedAt: timestamp("notion_created_at", { withTimezone: true }).notNull(),
    notionLastEditedAt: timestamp("notion_last_edited_at", {
      withTimezone: true,
    }).notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    canonNotionPageIdx: uniqueIndex("characters_canon_notion_page_idx").on(
      table.canonId,
      table.notionPageId,
    ),
  }),
);

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    canonId: uuid("canon_id")
      .notNull()
      .references(() => canons.id, { onDelete: "cascade" }),
    notionPageId: text("notion_page_id").notNull(),
    name: text("name").notNull(),
    notionUrl: text("notion_url"),
    notionCreatedAt: timestamp("notion_created_at", { withTimezone: true }).notNull(),
    notionLastEditedAt: timestamp("notion_last_edited_at", {
      withTimezone: true,
    }).notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    canonNotionPageIdx: uniqueIndex("locations_canon_notion_page_idx").on(
      table.canonId,
      table.notionPageId,
    ),
  }),
);

export const factions = pgTable(
  "factions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    canonId: uuid("canon_id")
      .notNull()
      .references(() => canons.id, { onDelete: "cascade" }),
    notionPageId: text("notion_page_id").notNull(),
    name: text("name").notNull(),
    notionUrl: text("notion_url"),
    notionCreatedAt: timestamp("notion_created_at", { withTimezone: true }).notNull(),
    notionLastEditedAt: timestamp("notion_last_edited_at", {
      withTimezone: true,
    }).notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    canonNotionPageIdx: uniqueIndex("factions_canon_notion_page_idx").on(
      table.canonId,
      table.notionPageId,
    ),
  }),
);

export const canonsRelations = relations(canons, ({ many }) => ({
  syncStates: many(sidecarSyncState),
  notionDatabases: many(canonNotionDatabases),
  characters: many(characters),
  locations: many(locations),
  factions: many(factions),
}));

export const sidecarSyncStateRelations = relations(sidecarSyncState, ({ one }) => ({
  canon: one(canons, {
    fields: [sidecarSyncState.canonId],
    references: [canons.id],
  }),
}));

export const canonNotionDatabasesRelations = relations(
  canonNotionDatabases,
  ({ one }) => ({
    canon: one(canons, {
      fields: [canonNotionDatabases.canonId],
      references: [canons.id],
    }),
  }),
);

export const charactersRelations = relations(characters, ({ one }) => ({
  canon: one(canons, {
    fields: [characters.canonId],
    references: [canons.id],
  }),
}));

export const locationsRelations = relations(locations, ({ one }) => ({
  canon: one(canons, {
    fields: [locations.canonId],
    references: [canons.id],
  }),
}));

export const factionsRelations = relations(factions, ({ one }) => ({
  canon: one(canons, {
    fields: [factions.canonId],
    references: [canons.id],
  }),
}));
