CREATE TABLE "sponsor_commitments" (
	"id" text PRIMARY KEY NOT NULL,
	"sponsor_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"owner_user_id" text,
	"due_date" date,
	"status" text DEFAULT 'planned' NOT NULL,
	"total_quantity" integer DEFAULT 1 NOT NULL,
	"completed_quantity" integer DEFAULT 0 NOT NULL,
	"proof_url" text,
	"notes" text DEFAULT '' NOT NULL,
	"visible_to_sponsor" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sponsor_commitments" ADD CONSTRAINT "sponsor_commitments_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsor_commitments" ADD CONSTRAINT "sponsor_commitments_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sponsor_commitments_sponsor_idx" ON "sponsor_commitments" USING btree ("sponsor_id");--> statement-breakpoint
CREATE INDEX "sponsor_commitments_status_due_idx" ON "sponsor_commitments" USING btree ("status","due_date");