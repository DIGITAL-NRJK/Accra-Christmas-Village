CREATE TABLE "operational_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"task_type" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"zone_id" text,
	"stand_id" text,
	"assigned_to_user_id" text,
	"due_at" timestamp with time zone NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"proof_storage_key" text,
	"proof_file_name" text,
	"proof_content_type" text,
	"created_by_user_id" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "operational_tasks" ADD CONSTRAINT "operational_tasks_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operational_tasks" ADD CONSTRAINT "operational_tasks_stand_id_stands_id_fk" FOREIGN KEY ("stand_id") REFERENCES "public"."stands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operational_tasks" ADD CONSTRAINT "operational_tasks_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operational_tasks" ADD CONSTRAINT "operational_tasks_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "operational_tasks_status_due_idx" ON "operational_tasks" USING btree ("status","due_at");--> statement-breakpoint
CREATE INDEX "operational_tasks_assignee_idx" ON "operational_tasks" USING btree ("assigned_to_user_id");