CREATE TYPE "public"."vendor_application_status" AS ENUM('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TABLE "vendor_application_policy_acceptances" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"policy_id" text,
	"policy_type" "vendor_policy_type" NOT NULL,
	"policy_version" integer NOT NULL,
	"policy_title" text NOT NULL,
	"policy_body" text NOT NULL,
	"accepted_by_user_id" text,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"applicant_user_id" text,
	"access_request_id" text,
	"organization_id" text,
	"category_id" text,
	"package_id" text,
	"organization_name" text DEFAULT '' NOT NULL,
	"trading_name" text DEFAULT '' NOT NULL,
	"vendor_kind" "vendor_kind",
	"business_description" text DEFAULT '' NOT NULL,
	"products_summary" text DEFAULT '' NOT NULL,
	"website_url" text DEFAULT '' NOT NULL,
	"instagram_handle" text DEFAULT '' NOT NULL,
	"contact_name" text DEFAULT '' NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"contact_phone" text DEFAULT '' NOT NULL,
	"operations_contact_name" text DEFAULT '' NOT NULL,
	"operations_contact_email" text DEFAULT '' NOT NULL,
	"operations_contact_phone" text DEFAULT '' NOT NULL,
	"status" "vendor_application_status" DEFAULT 'draft' NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"package_version" integer,
	"package_snapshot" jsonb,
	"category_snapshot" jsonb,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"reviewed_by_user_id" text,
	"reviewer_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_applications_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "vendor_applications_access_request_id_unique" UNIQUE("access_request_id")
);
--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "package_id" text;--> statement-breakpoint
ALTER TABLE "vendor_application_policy_acceptances" ADD CONSTRAINT "vendor_application_policy_acceptances_application_id_vendor_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_application_policy_acceptances" ADD CONSTRAINT "vendor_application_policy_acceptances_policy_id_vendor_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."vendor_policies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_application_policy_acceptances" ADD CONSTRAINT "vendor_application_policy_acceptances_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_access_request_id_access_requests_id_fk" FOREIGN KEY ("access_request_id") REFERENCES "public"."access_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_category_id_vendor_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."vendor_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_package_id_vendor_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."vendor_packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_application_policy_unique" ON "vendor_application_policy_acceptances" USING btree ("application_id","policy_type");--> statement-breakpoint
CREATE INDEX "vendor_application_policy_application_idx" ON "vendor_application_policy_acceptances" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "vendor_applications_status_idx" ON "vendor_applications" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "vendor_applications_category_idx" ON "vendor_applications" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "vendor_applications_package_idx" ON "vendor_applications" USING btree ("package_id");--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_category_id_vendor_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."vendor_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_package_id_vendor_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."vendor_packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vendors_category_idx" ON "vendors" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "vendors_package_idx" ON "vendors" USING btree ("package_id");