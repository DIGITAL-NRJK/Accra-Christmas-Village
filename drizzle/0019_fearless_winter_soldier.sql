CREATE TYPE "public"."vendor_brand_asset_kind" AS ENUM('logo', 'cover', 'product');--> statement-breakpoint
CREATE TYPE "public"."vendor_brand_asset_status" AS ENUM('submitted', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."vendor_brand_profile_status" AS ENUM('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'published');--> statement-breakpoint
CREATE TABLE "vendor_brand_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"kind" "vendor_brand_asset_kind" NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"storage_key" text NOT NULL,
	"alt_text" text NOT NULL,
	"status" "vendor_brand_asset_status" DEFAULT 'submitted' NOT NULL,
	"reviewer_note" text DEFAULT '' NOT NULL,
	"reviewed_by_user_id" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_brand_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"product_highlights" text DEFAULT '' NOT NULL,
	"website_url" text DEFAULT '' NOT NULL,
	"instagram_handle" text DEFAULT '' NOT NULL,
	"social_promotion_consent" boolean DEFAULT false NOT NULL,
	"status" "vendor_brand_profile_status" DEFAULT 'draft' NOT NULL,
	"reviewer_note" text DEFAULT '' NOT NULL,
	"reviewed_by_user_id" text,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendor_brand_assets" ADD CONSTRAINT "vendor_brand_assets_profile_id_vendor_brand_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."vendor_brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_brand_assets" ADD CONSTRAINT "vendor_brand_assets_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_brand_profiles" ADD CONSTRAINT "vendor_brand_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_brand_profiles" ADD CONSTRAINT "vendor_brand_profiles_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vendor_brand_assets_profile_idx" ON "vendor_brand_assets" USING btree ("profile_id","kind","created_at");--> statement-breakpoint
CREATE INDEX "vendor_brand_assets_status_idx" ON "vendor_brand_assets" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_brand_profiles_organization_unique" ON "vendor_brand_profiles" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_brand_profiles_slug_unique" ON "vendor_brand_profiles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "vendor_brand_profiles_status_idx" ON "vendor_brand_profiles" USING btree ("status","updated_at");