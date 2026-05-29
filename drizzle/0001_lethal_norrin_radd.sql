CREATE TYPE "public"."canon_element_type" AS ENUM('Character', 'Location', 'Faction', 'Event', 'Lore Entry', 'Relationship', 'Source');--> statement-breakpoint
CREATE TYPE "public"."provisioning_status" AS ENUM('created', 'reused', 'needs_attention');--> statement-breakpoint
CREATE TABLE "canon_notion_databases" (
	"canon_id" uuid NOT NULL,
	"element_type" "canon_element_type" NOT NULL,
	"notion_database_id" text,
	"status" "provisioning_status" NOT NULL,
	"last_provisioned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attention_reason" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "canon_notion_databases_canon_id_element_type_pk" PRIMARY KEY("canon_id","element_type")
);
--> statement-breakpoint
ALTER TABLE "canon_notion_databases" ADD CONSTRAINT "canon_notion_databases_canon_id_canons_id_fk" FOREIGN KEY ("canon_id") REFERENCES "public"."canons"("id") ON DELETE cascade ON UPDATE no action;