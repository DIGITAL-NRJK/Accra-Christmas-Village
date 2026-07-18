CREATE TYPE "public"."vendor_payment_method" AS ENUM('momo', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."vendor_payment_proof_status" AS ENUM('submitted', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."vendor_payment_status" AS ENUM('pending', 'under_review', 'partially_paid', 'paid', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "vendor_payment_proofs" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_id" text NOT NULL,
	"payment_method" "vendor_payment_method" NOT NULL,
	"payer_name" text NOT NULL,
	"payer_phone" text NOT NULL,
	"transaction_reference" text NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by_user_id" text,
	"status" "vendor_payment_proof_status" DEFAULT 'submitted' NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by_user_id" text,
	"reviewer_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_payment_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"momo_enabled" boolean DEFAULT false NOT NULL,
	"momo_network" text DEFAULT '' NOT NULL,
	"momo_name" text DEFAULT '' NOT NULL,
	"momo_phone" text DEFAULT '' NOT NULL,
	"bank_enabled" boolean DEFAULT false NOT NULL,
	"bank_name" text DEFAULT '' NOT NULL,
	"bank_account_name" text DEFAULT '' NOT NULL,
	"bank_account_number" text DEFAULT '' NOT NULL,
	"bank_branch" text DEFAULT '' NOT NULL,
	"instructions" text DEFAULT 'Use your payment reference in the transaction description.' NOT NULL,
	"payment_due_days" integer DEFAULT 7 NOT NULL,
	"updated_by_user_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"application_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"vendor_id" text,
	"package_id" text,
	"stand_id" text,
	"amount_minor" integer NOT NULL,
	"received_amount_minor" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"status" "vendor_payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" "vendor_payment_method",
	"payer_name" text DEFAULT '' NOT NULL,
	"payer_phone" text DEFAULT '' NOT NULL,
	"transaction_reference" text DEFAULT '' NOT NULL,
	"proof_storage_key" text,
	"proof_file_name" text,
	"proof_content_type" text,
	"proof_file_size" integer,
	"proof_uploaded_by_user_id" text,
	"submitted_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"reviewed_by_user_id" text,
	"reviewer_note" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_payments_reference_unique" UNIQUE("reference"),
	CONSTRAINT "vendor_payments_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
ALTER TABLE "vendor_payment_proofs" ADD CONSTRAINT "vendor_payment_proofs_payment_id_vendor_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."vendor_payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payment_proofs" ADD CONSTRAINT "vendor_payment_proofs_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payment_proofs" ADD CONSTRAINT "vendor_payment_proofs_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payment_settings" ADD CONSTRAINT "vendor_payment_settings_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_application_id_vendor_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."vendor_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_package_id_vendor_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."vendor_packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_stand_id_stands_id_fk" FOREIGN KEY ("stand_id") REFERENCES "public"."stands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_proof_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("proof_uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vendor_payment_proofs_payment_idx" ON "vendor_payment_proofs" USING btree ("payment_id","created_at");--> statement-breakpoint
CREATE INDEX "vendor_payment_proofs_status_idx" ON "vendor_payment_proofs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vendor_payments_status_idx" ON "vendor_payments" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "vendor_payments_organization_idx" ON "vendor_payments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "vendor_payments_stand_idx" ON "vendor_payments" USING btree ("stand_id");--> statement-breakpoint
INSERT INTO "vendor_payment_settings" ("id") VALUES ('vendor-payment-settings') ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
INSERT INTO "vendor_payments" (
	"id",
	"reference",
	"application_id",
	"organization_id",
	"vendor_id",
	"package_id",
	"amount_minor",
	"currency",
	"due_at"
)
SELECT
	'vendor-payment-' || applications."id",
	'ACV26-' || upper(substr(md5(applications."id"), 1, 8)),
	applications."id",
	applications."organization_id",
	vendor."id",
	applications."package_id",
	(applications."package_snapshot" ->> 'priceMinor')::integer,
	coalesce(applications."package_snapshot" ->> 'currency', 'GHS'),
	now() + interval '7 days'
FROM "vendor_applications" applications
INNER JOIN "vendors" vendor ON vendor."organization_id" = applications."organization_id"
WHERE applications."status" = 'approved'
	AND applications."organization_id" IS NOT NULL
	AND applications."package_snapshot" ->> 'priceMinor' ~ '^[0-9]+$'
	AND (applications."package_snapshot" ->> 'priceMinor')::integer > 0
ON CONFLICT ("application_id") DO NOTHING;
