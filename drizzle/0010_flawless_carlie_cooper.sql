CREATE TABLE "traffic_daily" (
	"id" text PRIMARY KEY NOT NULL,
	"day" date NOT NULL,
	"path" text NOT NULL,
	"device" text NOT NULL,
	"source" text NOT NULL,
	"views" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "traffic_daily_dimensions_unique" ON "traffic_daily" USING btree ("day","path","device","source");--> statement-breakpoint
CREATE INDEX "traffic_daily_day_idx" ON "traffic_daily" USING btree ("day");