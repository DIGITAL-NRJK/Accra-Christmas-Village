import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "visitor",
  "vendor",
  "sponsor",
  "partner",
  "admin",
  "super_admin",
]);

export const organizationTypeEnum = pgEnum("organization_type", [
  "vendor",
  "sponsor",
  "partner",
  "organizer",
]);

export const organizationStatusEnum = pgEnum("organization_status", [
  "pending",
  "active",
  "suspended",
]);

export const standStatusEnum = pgEnum("stand_status", [
  "available",
  "reserved",
  "assigned",
  "maintenance",
]);

export const complianceStatusEnum = pgEnum("compliance_status", [
  "not_started",
  "in_progress",
  "compliant",
  "blocked",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "missing",
  "submitted",
  "approved",
  "rejected",
]);

export const sponsorPackageEnum = pgEnum("sponsor_package", [
  "headline",
  "gold",
  "silver",
  "community",
]);

export const incidentSeverityEnum = pgEnum("incident_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const incidentStatusEnum = pgEnum("incident_status", [
  "open",
  "monitoring",
  "resolved",
]);

export const accessRequestStatusEnum = pgEnum("access_request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const zones = pgTable("zones", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  description: text("description").notNull(),
  gridColumn: text("grid_column").notNull(),
  gridRow: text("grid_row").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const stands = pgTable(
  "stands",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    zoneId: text("zone_id")
      .notNull()
      .references(() => zones.id),
    category: text("category").notNull(),
    size: text("size").notNull(),
    powerAmps: integer("power_amps").notNull().default(0),
    status: standStatusEnum("status").notNull().default("available"),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("stands_zone_idx").on(table.zoneId)],
);

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: organizationTypeEnum("type").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  status: organizationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id"),
    organizationId: text("organization_id").references(() => organizations.id),
    role: roleEnum("role").notNull().default("visitor"),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_clerk_user_id_unique").on(table.clerkUserId),
    index("users_organization_idx").on(table.organizationId),
  ],
);

export const vendors = pgTable(
  "vendors",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    tradingName: text("trading_name").notNull(),
    category: text("category").notNull(),
    standId: text("stand_id").references(() => stands.id),
    onboardingStatus: complianceStatusEnum("onboarding_status").notNull(),
    complianceStatus: complianceStatusEnum("compliance_status").notNull(),
    approved: boolean("approved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vendors_organization_idx").on(table.organizationId),
    index("vendors_stand_idx").on(table.standId),
  ],
);

export const sponsors = pgTable(
  "sponsors",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    slug: text("slug").notNull().unique(),
    brandName: text("brand_name").notNull(),
    packageLevel: sponsorPackageEnum("package_level").notNull(),
    activationLocation: text("activation_location").notNull(),
    standId: text("stand_id").references(() => stands.id),
    status: text("status").notNull().default("prospect"),
    summary: text("summary").notNull(),
    activationPlan: text("activation_plan").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sponsors_organization_idx").on(table.organizationId),
    index("sponsors_stand_idx").on(table.standId),
  ],
);

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    day: date("day").notNull(),
    startsAt: text("starts_at").notNull(),
    endsAt: text("ends_at").notNull(),
    category: text("category").notNull(),
    location: text("location").notNull(),
    audience: text("audience").notNull(),
    description: text("description").notNull(),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("events_day_category_idx").on(table.day, table.category)],
);

export const documentRequirements = pgTable("document_requirements", {
  id: text("id").primaryKey(),
  organizationType: organizationTypeEnum("organization_type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  required: boolean("required").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const onboardingTasks = pgTable(
  "onboarding_tasks",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    requirementId: text("requirement_id").references(() => documentRequirements.id),
    title: text("title").notNull(),
    status: documentStatusEnum("status").notNull().default("missing"),
    dueDate: date("due_date").notNull(),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("onboarding_tasks_org_idx").on(table.organizationId)],
);

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    requirementId: text("requirement_id")
      .notNull()
      .references(() => documentRequirements.id),
    uploaderUserId: text("uploader_user_id").references(() => users.id),
    fileName: text("file_name"),
    fileType: text("file_type"),
    fileSize: integer("file_size"),
    storageKey: text("storage_key"),
    storageUrl: text("storage_url"),
    status: documentStatusEnum("status").notNull().default("missing"),
    rejectionReason: text("rejection_reason"),
    reviewerNote: text("reviewer_note"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedByUserId: text("reviewed_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("documents_org_idx").on(table.organizationId),
    index("documents_requirement_idx").on(table.requirementId),
    index("documents_status_idx").on(table.status),
    uniqueIndex("documents_org_requirement_unique").on(
      table.organizationId,
      table.requirementId,
    ),
  ],
);

export const announcements = pgTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audience: text("audience").notNull().default("all"),
  priority: text("priority").notNull().default("normal"),
  published: boolean("published").notNull().default(false),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const incidents = pgTable(
  "incidents",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    zoneId: text("zone_id")
      .notNull()
      .references(() => zones.id),
    severity: incidentSeverityEnum("severity").notNull(),
    status: incidentStatusEnum("status").notNull().default("open"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("incidents_zone_idx").on(table.zoneId)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("audit_logs_entity_idx").on(table.entityType, table.entityId)],
);

export const accessRequests = pgTable(
  "access_requests",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email").notNull(),
    requestedRole: roleEnum("requested_role").notNull(),
    organizationName: text("organization_name").notNull(),
    contactName: text("contact_name").notNull(),
    phone: text("phone").notNull().default(""),
    message: text("message").notNull().default(""),
    status: accessRequestStatusEnum("status").notNull().default("pending"),
    reviewerNote: text("reviewer_note"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("access_requests_clerk_user_id_unique").on(table.clerkUserId),
    index("access_requests_status_idx").on(table.status),
  ],
);
