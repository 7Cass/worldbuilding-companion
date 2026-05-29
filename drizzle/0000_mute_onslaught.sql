CREATE TYPE "public"."sync_status" AS ENUM('idle', 'syncing', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "canons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"notion_parent_page_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sidecar_sync_state" (
	"canon_id" uuid NOT NULL,
	"source" text NOT NULL,
	"status" "sync_status" DEFAULT 'idle' NOT NULL,
	"last_succeeded_at" timestamp with time zone,
	"failure_category" text,
	"failure_message" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sidecar_sync_state_canon_id_source_pk" PRIMARY KEY("canon_id","source")
);
--> statement-breakpoint
ALTER TABLE "sidecar_sync_state" ADD CONSTRAINT "sidecar_sync_state_canon_id_canons_id_fk" FOREIGN KEY ("canon_id") REFERENCES "public"."canons"("id") ON DELETE cascade ON UPDATE no action;