CREATE TYPE "public"."accreditation_status" AS ENUM('draft', 'issued', 'active', 'revoked', 'expired');--> statement-breakpoint
CREATE TABLE "accreditation_quotas" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"maximum_badges" integer DEFAULT 8 NOT NULL,
	"updated_by_user_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accreditation_quotas_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "accreditation_scans" (
	"id" text PRIMARY KEY NOT NULL,
	"accreditation_id" text NOT NULL,
	"scanned_by_user_id" text,
	"checkpoint" text NOT NULL,
	"direction" text NOT NULL,
	"outcome" text NOT NULL,
	"denial_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accreditations" (
	"id" text PRIMARY KEY NOT NULL,
	"staff_member_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"badge_number" text NOT NULL,
	"badge_type" text NOT NULL,
	"status" "accreditation_status" DEFAULT 'draft' NOT NULL,
	"token_version" integer DEFAULT 1 NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"issued_at" timestamp with time zone,
	"issued_by_user_id" text,
	"revoked_at" timestamp with time zone,
	"revoked_by_user_id" text,
	"revocation_reason" text,
	"last_scanned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accreditations_badge_number_unique" UNIQUE("badge_number")
);
--> statement-breakpoint
CREATE TABLE "staff_members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"full_name" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"role_label" text NOT NULL,
	"staff_type" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accreditation_quotas" ADD CONSTRAINT "accreditation_quotas_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accreditation_quotas" ADD CONSTRAINT "accreditation_quotas_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accreditation_scans" ADD CONSTRAINT "accreditation_scans_accreditation_id_accreditations_id_fk" FOREIGN KEY ("accreditation_id") REFERENCES "public"."accreditations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accreditation_scans" ADD CONSTRAINT "accreditation_scans_scanned_by_user_id_users_id_fk" FOREIGN KEY ("scanned_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accreditations" ADD CONSTRAINT "accreditations_staff_member_id_staff_members_id_fk" FOREIGN KEY ("staff_member_id") REFERENCES "public"."staff_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accreditations" ADD CONSTRAINT "accreditations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accreditations" ADD CONSTRAINT "accreditations_issued_by_user_id_users_id_fk" FOREIGN KEY ("issued_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accreditations" ADD CONSTRAINT "accreditations_revoked_by_user_id_users_id_fk" FOREIGN KEY ("revoked_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accreditation_scans_badge_idx" ON "accreditation_scans" USING btree ("accreditation_id","created_at");--> statement-breakpoint
CREATE INDEX "accreditation_scans_checkpoint_idx" ON "accreditation_scans" USING btree ("checkpoint","created_at");--> statement-breakpoint
CREATE INDEX "accreditations_organization_idx" ON "accreditations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "accreditations_staff_idx" ON "accreditations" USING btree ("staff_member_id");--> statement-breakpoint
CREATE INDEX "accreditations_status_idx" ON "accreditations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "staff_members_organization_idx" ON "staff_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "staff_members_user_idx" ON "staff_members" USING btree ("user_id");