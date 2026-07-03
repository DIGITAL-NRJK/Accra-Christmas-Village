ALTER TYPE "public"."access_request_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "access_requests" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "access_requests" ADD COLUMN "cancelled_at" timestamp with time zone;