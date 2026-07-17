ALTER TABLE "incidents" ADD COLUMN "assigned_to_user_id" text;--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "photo_storage_key" text;--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "photo_file_name" text;--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "photo_content_type" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "recipient_user_id" text;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incidents_assignee_idx" ON "incidents" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient_user_id");