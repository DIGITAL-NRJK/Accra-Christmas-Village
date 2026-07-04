CREATE TABLE "hero_slides" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"eyebrow" text DEFAULT '20-26 Dec / Accra' NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text DEFAULT 'Accra Christmas Village festival scene' NOT NULL,
	"cta_label" text DEFAULT 'Open map' NOT NULL,
	"cta_href" text DEFAULT '/map' NOT NULL,
	"secondary_label" text DEFAULT 'See programme' NOT NULL,
	"secondary_href" text DEFAULT '/programme' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "hero_slides_publication_idx" ON "hero_slides" USING btree ("published","sort_order");