CREATE TYPE "public"."compliance_status" AS ENUM('not_started', 'in_progress', 'compliant', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('missing', 'submitted', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."incident_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."incident_status" AS ENUM('open', 'monitoring', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('vendor', 'sponsor', 'partner', 'organizer');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('visitor', 'vendor', 'sponsor', 'partner', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."sponsor_package" AS ENUM('headline', 'gold', 'silver', 'community');--> statement-breakpoint
CREATE TYPE "public"."stand_status" AS ENUM('available', 'reserved', 'assigned', 'maintenance');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"audience" text DEFAULT 'all' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_type" "organization_type" NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"requirement_id" text NOT NULL,
	"uploader_user_id" text,
	"file_name" text,
	"file_type" text,
	"file_size" integer,
	"storage_key" text,
	"storage_url" text,
	"status" "document_status" DEFAULT 'missing' NOT NULL,
	"rejection_reason" text,
	"reviewer_note" text,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"reviewed_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"day" date NOT NULL,
	"starts_at" text NOT NULL,
	"ends_at" text NOT NULL,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"audience" text NOT NULL,
	"description" text NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"zone_id" text NOT NULL,
	"severity" "incident_severity" NOT NULL,
	"status" "incident_status" DEFAULT 'open' NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"requirement_id" text,
	"title" text NOT NULL,
	"status" "document_status" DEFAULT 'missing' NOT NULL,
	"due_date" date NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "organization_type" NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"status" "organization_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"slug" text NOT NULL,
	"brand_name" text NOT NULL,
	"package_level" "sponsor_package" NOT NULL,
	"activation_location" text NOT NULL,
	"stand_id" text,
	"status" text DEFAULT 'prospect' NOT NULL,
	"summary" text NOT NULL,
	"activation_plan" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sponsors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "stands" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"zone_id" text NOT NULL,
	"category" text NOT NULL,
	"size" text NOT NULL,
	"power_amps" integer DEFAULT 0 NOT NULL,
	"status" "stand_status" DEFAULT 'available' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stands_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"role" "role" DEFAULT 'visitor' NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"trading_name" text NOT NULL,
	"category" text NOT NULL,
	"stand_id" text NOT NULL,
	"onboarding_status" "compliance_status" NOT NULL,
	"compliance_status" "compliance_status" NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"description" text NOT NULL,
	"grid_column" text NOT NULL,
	"grid_row" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "zones_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_requirement_id_document_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."document_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploader_user_id_users_id_fk" FOREIGN KEY ("uploader_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_requirement_id_document_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."document_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_stand_id_stands_id_fk" FOREIGN KEY ("stand_id") REFERENCES "public"."stands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stands" ADD CONSTRAINT "stands_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_stand_id_stands_id_fk" FOREIGN KEY ("stand_id") REFERENCES "public"."stands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "documents_org_idx" ON "documents" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "documents_requirement_idx" ON "documents" USING btree ("requirement_id");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_org_requirement_unique" ON "documents" USING btree ("organization_id","requirement_id");--> statement-breakpoint
CREATE INDEX "events_day_category_idx" ON "events" USING btree ("day","category");--> statement-breakpoint
CREATE INDEX "incidents_zone_idx" ON "incidents" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "onboarding_tasks_org_idx" ON "onboarding_tasks" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sponsors_organization_idx" ON "sponsors" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sponsors_stand_idx" ON "sponsors" USING btree ("stand_id");--> statement-breakpoint
CREATE INDEX "stands_zone_idx" ON "stands" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "users_organization_idx" ON "users" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "vendors_organization_idx" ON "vendors" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "vendors_stand_idx" ON "vendors" USING btree ("stand_id");