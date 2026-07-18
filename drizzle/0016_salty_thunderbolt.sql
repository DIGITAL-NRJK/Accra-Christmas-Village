CREATE TYPE "public"."vendor_entitlement_category" AS ENUM('equipment', 'infrastructure', 'operations', 'marketing', 'location');--> statement-breakpoint
CREATE TYPE "public"."vendor_kind" AS ENUM('general', 'food');--> statement-breakpoint
CREATE TYPE "public"."vendor_package_tier" AS ENUM('standard', 'premium', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."vendor_policy_type" AS ENUM('cancellation', 'operating_hours', 'security', 'setup');--> statement-breakpoint
CREATE TABLE "vendor_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vendor_category_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendor_category_groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vendor_package_entitlements" (
	"id" text PRIMARY KEY NOT NULL,
	"package_id" text NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" "vendor_entitlement_category" NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"vendor_kind" "vendor_kind" NOT NULL,
	"tier" "vendor_package_tier" NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"price_minor" integer,
	"booth_width_cm" integer NOT NULL,
	"booth_depth_cm" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_user_id" text,
	CONSTRAINT "vendor_packages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "vendor_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "vendor_policy_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"effective_from" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_user_id" text
);
--> statement-breakpoint
ALTER TABLE "vendor_categories" ADD CONSTRAINT "vendor_categories_group_id_vendor_category_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."vendor_category_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_package_entitlements" ADD CONSTRAINT "vendor_package_entitlements_package_id_vendor_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."vendor_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_packages" ADD CONSTRAINT "vendor_packages_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_policies" ADD CONSTRAINT "vendor_policies_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vendor_categories_group_idx" ON "vendor_categories" USING btree ("group_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_package_entitlements_package_code_unique" ON "vendor_package_entitlements" USING btree ("package_id","code");--> statement-breakpoint
CREATE INDEX "vendor_package_entitlements_package_idx" ON "vendor_package_entitlements" USING btree ("package_id","sort_order");--> statement-breakpoint
CREATE INDEX "vendor_packages_kind_tier_idx" ON "vendor_packages" USING btree ("vendor_kind","tier");--> statement-breakpoint
CREATE INDEX "vendor_policies_type_active_idx" ON "vendor_policies" USING btree ("type","active");
--> statement-breakpoint
INSERT INTO "vendor_category_groups" ("id", "slug", "name", "description", "sort_order") VALUES
('vendor-group-food-beverage', 'food-beverage', 'Food & Beverage', 'Prepared food, drinks, desserts and festive treats.', 10),
('vendor-group-retail', 'retail', 'Retail', 'Fashion, accessories, jewellery, home and beauty products.', 20),
('vendor-group-children', 'childrens-products', 'Children''s Products', 'Toys, books, education products and games.', 30),
('vendor-group-arts-crafts', 'arts-crafts', 'Arts & Crafts', 'Handmade, personalised and workshop-led offers.', 40),
('vendor-group-corporate', 'corporate-services', 'Corporate & Services', 'Financial, travel, real-estate and insurance services.', 50),
('vendor-group-gifts', 'gifts-souvenirs', 'Gift Shop & Souvenirs', 'Christmas gifts, keepsakes and seasonal merchandise.', 60);
--> statement-breakpoint
INSERT INTO "vendor_categories" ("id", "group_id", "slug", "name", "sort_order") VALUES
('vendor-category-specialty-foods', 'vendor-group-food-beverage', 'specialty-foods', 'Specialty Foods', 10),
('vendor-category-desserts', 'vendor-group-food-beverage', 'desserts', 'Desserts', 20),
('vendor-category-christmas-treats', 'vendor-group-food-beverage', 'christmas-treats', 'Christmas Treats', 30),
('vendor-category-beverages', 'vendor-group-food-beverage', 'beverages', 'Beverages', 40),
('vendor-category-fashion', 'vendor-group-retail', 'fashion', 'Fashion', 10),
('vendor-category-accessories', 'vendor-group-retail', 'accessories', 'Accessories', 20),
('vendor-category-jewellery', 'vendor-group-retail', 'jewellery', 'Jewellery', 30),
('vendor-category-home-decor', 'vendor-group-retail', 'home-decor', 'Home Decor', 40),
('vendor-category-beauty', 'vendor-group-retail', 'beauty-products', 'Beauty Products', 50),
('vendor-category-toys', 'vendor-group-children', 'toys', 'Toys', 10),
('vendor-category-books', 'vendor-group-children', 'books', 'Books', 20),
('vendor-category-education', 'vendor-group-children', 'educational-products', 'Educational Products', 30),
('vendor-category-games', 'vendor-group-children', 'games', 'Games', 40),
('vendor-category-handmade-gifts', 'vendor-group-arts-crafts', 'handmade-gifts', 'Handmade Gifts', 10),
('vendor-category-decorations', 'vendor-group-arts-crafts', 'christmas-decorations', 'Christmas Decorations', 20),
('vendor-category-personalised', 'vendor-group-arts-crafts', 'personalised-items', 'Personalised Items', 30),
('vendor-category-workshops', 'vendor-group-arts-crafts', 'workshops', 'Workshops', 40),
('vendor-category-financial', 'vendor-group-corporate', 'financial-services', 'Financial Services', 10),
('vendor-category-travel', 'vendor-group-corporate', 'travel', 'Travel', 20),
('vendor-category-real-estate', 'vendor-group-corporate', 'real-estate', 'Real Estate', 30),
('vendor-category-insurance', 'vendor-group-corporate', 'insurance', 'Insurance', 40),
('vendor-category-mugs', 'vendor-group-gifts', 'mugs', 'Mugs', 10),
('vendor-category-chocolate', 'vendor-group-gifts', 'chocolate-candy', 'Chocolate & Candy', 20),
('vendor-category-cards', 'vendor-group-gifts', 'christmas-cards', 'Christmas Cards', 30),
('vendor-category-candles', 'vendor-group-gifts', 'holiday-candles', 'Holiday Candles', 40),
('vendor-category-socks', 'vendor-group-gifts', 'holiday-socks', 'Holiday Socks', 50),
('vendor-category-sweaters', 'vendor-group-gifts', 'christmas-sweaters', 'Christmas Sweaters', 60);
--> statement-breakpoint
INSERT INTO "vendor_packages" ("id", "code", "name", "vendor_kind", "tier", "description", "price_minor", "booth_width_cm", "booth_depth_cm") VALUES
('vendor-package-general-standard', 'GEN-STANDARD', 'Standard Booth', 'general', 'standard', 'Entry-level retail and service booth from the 2026 Vendor Pack.', NULL, 300, 300),
('vendor-package-general-premium', 'GEN-PREMIUM', 'Premium Booth', 'general', 'premium', 'Larger booth with power and additional social visibility.', NULL, 400, 400),
('vendor-package-general-platinum', 'GEN-PLATINUM', 'Platinum Vendor', 'general', 'platinum', 'Largest general Vendor footprint with premium placement and event visibility.', NULL, 600, 600),
('vendor-package-food-standard', 'FOOD-STANDARD', 'Standard Food Booth', 'food', 'standard', 'Food booth with power and waste-management support.', NULL, 300, 300),
('vendor-package-food-premium', 'FOOD-PREMIUM', 'Premium Food Booth', 'food', 'premium', 'Larger food booth with power, waste support and social visibility.', NULL, 400, 400),
('vendor-package-food-platinum', 'FOOD-PLATINUM', 'Platinum Food Vendor', 'food', 'platinum', 'Largest food footprint with premium placement and promotional opportunities.', NULL, 600, 600);
--> statement-breakpoint
INSERT INTO "vendor_package_entitlements" ("id", "package_id", "code", "label", "category", "quantity", "unit", "sort_order") VALUES
('ent-gen-std-table', 'vendor-package-general-standard', 'table', 'Table', 'equipment', 1, 'item', 10),
('ent-gen-std-chairs', 'vendor-package-general-standard', 'chairs', 'Chairs', 'equipment', 2, 'items', 20),
('ent-gen-std-fan', 'vendor-package-general-standard', 'fan', 'Fan', 'equipment', 1, 'item', 30),
('ent-gen-std-signage', 'vendor-package-general-standard', 'vendor-signage', 'Vendor signage', 'marketing', 1, 'placement', 40),
('ent-gen-std-social', 'vendor-package-general-standard', 'social-promotion', 'Social media promotion', 'marketing', 1, 'promotion', 50),
('ent-gen-std-directory', 'vendor-package-general-standard', 'vendor-directory', 'Vendor directory inclusion', 'marketing', 1, 'listing', 60),
('ent-gen-std-website', 'vendor-package-general-standard', 'website-listing', 'Event website listing', 'marketing', 1, 'listing', 70),
('ent-gen-pre-table', 'vendor-package-general-premium', 'table', 'Table', 'equipment', 1, 'item', 10),
('ent-gen-pre-chairs', 'vendor-package-general-premium', 'chairs', 'Chairs', 'equipment', 2, 'items', 20),
('ent-gen-pre-fan', 'vendor-package-general-premium', 'fan', 'Fan', 'equipment', 1, 'item', 30),
('ent-gen-pre-power', 'vendor-package-general-premium', 'power-connection', 'Power connection', 'infrastructure', 1, 'connection', 40),
('ent-gen-pre-social', 'vendor-package-general-premium', 'social-promotion', 'Social media promotion', 'marketing', 1, 'promotion', 50),
('ent-gen-pre-directory', 'vendor-package-general-premium', 'vendor-directory', 'Vendor directory inclusion', 'marketing', 1, 'listing', 60),
('ent-gen-pre-website', 'vendor-package-general-premium', 'website-listing', 'Event website listing', 'marketing', 1, 'listing', 70),
('ent-gen-pla-fans', 'vendor-package-general-platinum', 'fans', 'Fans', 'equipment', 2, 'items', 10),
('ent-gen-pla-location', 'vendor-package-general-platinum', 'premium-location', 'Premium location', 'location', 1, 'placement', 20),
('ent-gen-pla-branding', 'vendor-package-general-platinum', 'branding-opportunities', 'Branding opportunities', 'marketing', 1, 'package', 30),
('ent-gen-pla-stage', 'vendor-package-general-platinum', 'stage-mentions', 'Stage mentions', 'marketing', 1, 'package', 40),
('ent-gen-pla-social', 'vendor-package-general-platinum', 'social-promotion', 'Social media promotions', 'marketing', 1, 'package', 50),
('ent-gen-pla-directory', 'vendor-package-general-platinum', 'vendor-directory', 'Vendor directory inclusion', 'marketing', 1, 'listing', 60),
('ent-gen-pla-website', 'vendor-package-general-platinum', 'website-listing', 'Event website listing', 'marketing', 1, 'listing', 70),
('ent-food-std-table', 'vendor-package-food-standard', 'table', 'Table', 'equipment', 1, 'item', 10),
('ent-food-std-chair', 'vendor-package-food-standard', 'chairs', 'Chair', 'equipment', 1, 'item', 20),
('ent-food-std-fan', 'vendor-package-food-standard', 'fan', 'Fan', 'equipment', 1, 'item', 30),
('ent-food-std-power', 'vendor-package-food-standard', 'power-access', 'Power access', 'infrastructure', 1, 'connection', 40),
('ent-food-std-waste', 'vendor-package-food-standard', 'waste-support', 'Waste-management support', 'operations', 1, 'service', 50),
('ent-food-std-social', 'vendor-package-food-standard', 'social-promotion', 'Social media promotion', 'marketing', 1, 'promotion', 60),
('ent-food-std-directory', 'vendor-package-food-standard', 'vendor-directory', 'Vendor directory inclusion', 'marketing', 1, 'listing', 70),
('ent-food-std-website', 'vendor-package-food-standard', 'website-listing', 'Event website listing', 'marketing', 1, 'listing', 80),
('ent-food-pre-table', 'vendor-package-food-premium', 'table', 'Table', 'equipment', 1, 'item', 10),
('ent-food-pre-chairs', 'vendor-package-food-premium', 'chairs', 'Chairs', 'equipment', 2, 'items', 20),
('ent-food-pre-fan', 'vendor-package-food-premium', 'fan', 'Fan', 'equipment', 1, 'item', 30),
('ent-food-pre-power', 'vendor-package-food-premium', 'power-access', 'Power access', 'infrastructure', 1, 'connection', 40),
('ent-food-pre-waste', 'vendor-package-food-premium', 'waste-support', 'Waste-management support', 'operations', 1, 'service', 50),
('ent-food-pre-social', 'vendor-package-food-premium', 'social-promotion', 'Social media mention', 'marketing', 1, 'mention', 60),
('ent-food-pre-directory', 'vendor-package-food-premium', 'vendor-directory', 'Vendor directory inclusion', 'marketing', 1, 'listing', 70),
('ent-food-pre-website', 'vendor-package-food-premium', 'website-listing', 'Event website listing', 'marketing', 1, 'listing', 80),
('ent-food-pla-table', 'vendor-package-food-platinum', 'table', 'Table', 'equipment', 1, 'item', 10),
('ent-food-pla-chairs', 'vendor-package-food-platinum', 'chairs', 'Chairs', 'equipment', 2, 'items', 20),
('ent-food-pla-fans', 'vendor-package-food-platinum', 'fans', 'Fans', 'equipment', 2, 'items', 30),
('ent-food-pla-location', 'vendor-package-food-platinum', 'premium-location', 'Premium location', 'location', 1, 'placement', 40),
('ent-food-pla-branding', 'vendor-package-food-platinum', 'branding-opportunities', 'Branding opportunities', 'marketing', 1, 'package', 50),
('ent-food-pla-stage', 'vendor-package-food-platinum', 'stage-mentions', 'Stage mentions', 'marketing', 1, 'package', 60),
('ent-food-pla-social', 'vendor-package-food-platinum', 'social-promotion', 'Social media promotions', 'marketing', 1, 'package', 70),
('ent-food-pla-directory', 'vendor-package-food-platinum', 'vendor-directory', 'Vendor directory inclusion', 'marketing', 1, 'listing', 80),
('ent-food-pla-website', 'vendor-package-food-platinum', 'website-listing', 'Event website listing', 'marketing', 1, 'listing', 90);
--> statement-breakpoint
INSERT INTO "vendor_policies" ("id", "type", "title", "body") VALUES
('vendor-policy-cancellation-v1', 'cancellation', 'Booth cancellation policy', 'Full payment confirms the booth reservation. Booth fees are non-refundable after confirmation.'),
('vendor-policy-operating-v1', 'operating_hours', 'Official operating hours', 'All Vendors must operate during the official event hours. Exact daily hours will be published in the Vendor handbook.'),
('vendor-policy-security-v1', 'security', 'Stock and valuables responsibility', 'Basic venue security will be provided. Vendors remain responsible for their own stock and valuables.'),
('vendor-policy-setup-v1', 'setup', 'Vendor setup window', 'Vendor setup begins one day before the event. Exact arrival and setup slots will be communicated in the Vendor handbook.');
