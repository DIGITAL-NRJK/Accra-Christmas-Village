CREATE TABLE "document_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"requirement_id" text NOT NULL,
	"uploader_user_id" text,
	"version" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"storage_key" text NOT NULL,
	"status" "document_status" DEFAULT 'submitted' NOT NULL,
	"reviewer_note" text,
	"internal_note" text,
	"issued_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by_user_id" text
);
--> statement-breakpoint
ALTER TABLE "document_requirements" ADD COLUMN "applies_to_categories" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "issued_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "internal_note" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "replacement_requested_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "reminder_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "compliance_status" "compliance_status" DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
UPDATE "document_requirements" SET "applies_to_categories" = '["Food & drinks"]'::jsonb WHERE "id" = 'req-food-safety';--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_requirement_id_document_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."document_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_uploader_user_id_users_id_fk" FOREIGN KEY ("uploader_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_versions_document_idx" ON "document_versions" USING btree ("document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_versions_number_unique" ON "document_versions" USING btree ("document_id","version");--> statement-breakpoint
INSERT INTO "document_versions" ("id", "document_id", "organization_id", "requirement_id", "uploader_user_id", "version", "file_name", "file_type", "file_size", "storage_key", "status", "reviewer_note", "internal_note", "issued_at", "expires_at", "submitted_at", "reviewed_at", "reviewed_by_user_id")
SELECT 'version-' || "id" || '-1', "id", "organization_id", "requirement_id", "uploader_user_id", 1, "file_name", "file_type", "file_size", "storage_key", "status", "reviewer_note", "internal_note", "issued_at", "expires_at", COALESCE("submitted_at", "created_at"), "reviewed_at", "reviewed_by_user_id"
FROM "documents"
WHERE "file_name" IS NOT NULL AND "file_type" IS NOT NULL AND "file_size" IS NOT NULL AND "storage_key" IS NOT NULL;
