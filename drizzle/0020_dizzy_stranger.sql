CREATE TYPE "public"."vendor_handbook_audience" AS ENUM('all', 'general', 'food');--> statement-breakpoint
CREATE TYPE "public"."vendor_handbook_section_kind" AS ENUM('setup', 'operating_hours', 'deliveries', 'power', 'waste', 'security', 'branding', 'food_safety', 'emergency', 'other');--> statement-breakpoint
CREATE TYPE "public"."vendor_handbook_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "vendor_handbook_acknowledgements" (
	"id" text PRIMARY KEY NOT NULL,
	"handbook_id" text NOT NULL,
	"section_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"acknowledged_by_user_id" text,
	"acknowledged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_handbook_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"handbook_id" text NOT NULL,
	"kind" "vendor_handbook_section_kind" NOT NULL,
	"audience" "vendor_handbook_audience" DEFAULT 'all' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"quick_reference" text DEFAULT '' NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_handbooks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"version" integer NOT NULL,
	"status" "vendor_handbook_status" DEFAULT 'draft' NOT NULL,
	"effective_from" date,
	"created_by_user_id" text,
	"published_by_user_id" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendor_handbook_acknowledgements" ADD CONSTRAINT "vendor_handbook_acknowledgements_handbook_id_vendor_handbooks_id_fk" FOREIGN KEY ("handbook_id") REFERENCES "public"."vendor_handbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_handbook_acknowledgements" ADD CONSTRAINT "vendor_handbook_acknowledgements_section_id_vendor_handbook_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."vendor_handbook_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_handbook_acknowledgements" ADD CONSTRAINT "vendor_handbook_acknowledgements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_handbook_acknowledgements" ADD CONSTRAINT "vendor_handbook_acknowledgements_acknowledged_by_user_id_users_id_fk" FOREIGN KEY ("acknowledged_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_handbook_sections" ADD CONSTRAINT "vendor_handbook_sections_handbook_id_vendor_handbooks_id_fk" FOREIGN KEY ("handbook_id") REFERENCES "public"."vendor_handbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_handbooks" ADD CONSTRAINT "vendor_handbooks_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_handbooks" ADD CONSTRAINT "vendor_handbooks_published_by_user_id_users_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_handbook_ack_section_org_unique" ON "vendor_handbook_acknowledgements" USING btree ("section_id","organization_id");--> statement-breakpoint
CREATE INDEX "vendor_handbook_ack_org_idx" ON "vendor_handbook_acknowledgements" USING btree ("organization_id","handbook_id");--> statement-breakpoint
CREATE INDEX "vendor_handbook_sections_handbook_idx" ON "vendor_handbook_sections" USING btree ("handbook_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_handbooks_version_unique" ON "vendor_handbooks" USING btree ("version");--> statement-breakpoint
CREATE INDEX "vendor_handbooks_status_idx" ON "vendor_handbooks" USING btree ("status","version");