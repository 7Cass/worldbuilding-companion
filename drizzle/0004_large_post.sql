CREATE TABLE "factions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canon_id" uuid NOT NULL,
	"notion_page_id" text NOT NULL,
	"name" text NOT NULL,
	"notion_url" text,
	"notion_created_at" timestamp with time zone NOT NULL,
	"notion_last_edited_at" timestamp with time zone NOT NULL,
	"last_synced_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "factions" ADD CONSTRAINT "factions_canon_id_canons_id_fk" FOREIGN KEY ("canon_id") REFERENCES "public"."canons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "factions_canon_notion_page_idx" ON "factions" USING btree ("canon_id","notion_page_id");