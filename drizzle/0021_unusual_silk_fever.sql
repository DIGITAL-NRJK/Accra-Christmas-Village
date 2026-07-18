ALTER TABLE "document_requirements" ADD COLUMN "applies_to_vendor_kinds" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "vendor_kind" "vendor_kind" DEFAULT 'general' NOT NULL;--> statement-breakpoint
UPDATE "vendors"
SET "vendor_kind" = "vendor_packages"."vendor_kind"
FROM "vendor_packages"
WHERE "vendors"."package_id" = "vendor_packages"."id";--> statement-breakpoint
UPDATE "vendors"
SET "vendor_kind" = "vendor_applications"."vendor_kind"
FROM "vendor_applications"
WHERE "vendors"."organization_id" = "vendor_applications"."organization_id"
  AND "vendor_applications"."vendor_kind" IS NOT NULL;--> statement-breakpoint
UPDATE "vendors"
SET "vendor_kind" = 'food'
WHERE lower("category") IN ('food & drinks', 'specialty foods', 'desserts', 'christmas treats', 'beverages');--> statement-breakpoint
UPDATE "document_requirements"
SET
  "name" = 'Food handling certification',
  "description" = 'Current food handling certification for the team preparing or serving products.',
  "applies_to_categories" = '[]'::jsonb,
  "applies_to_vendor_kinds" = '["food"]'::jsonb,
  "sort_order" = 2
WHERE "id" = 'req-food-safety';--> statement-breakpoint
INSERT INTO "document_requirements" (
  "id", "organization_type", "name", "description", "required", "applies_to_categories", "applies_to_vendor_kinds", "sort_order"
) VALUES
  ('req-food-health-permit', 'vendor', 'Health permit', 'Current health permit covering the Food Vendor activity and event period.', true, '[]'::jsonb, '["food"]'::jsonb, 3),
  ('req-food-waste-plan', 'vendor', 'Waste disposal plan', 'Documented plan for sorting, storing and removing food, oil and packaging waste.', true, '[]'::jsonb, '["food"]'::jsonb, 4)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "required" = EXCLUDED."required",
  "applies_to_categories" = EXCLUDED."applies_to_categories",
  "applies_to_vendor_kinds" = EXCLUDED."applies_to_vendor_kinds",
  "sort_order" = EXCLUDED."sort_order";--> statement-breakpoint
UPDATE "vendors"
SET "compliance_status" = 'in_progress'
WHERE "vendor_kind" = 'food' AND "compliance_status" = 'compliant';--> statement-breakpoint
UPDATE "organizations"
SET "compliance_status" = 'in_progress'
WHERE "id" IN (SELECT "organization_id" FROM "vendors" WHERE "vendor_kind" = 'food')
  AND "compliance_status" = 'compliant';
