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
  "operations_manager",
  "content_manager",
  "compliance_manager",
  "stand_manager",
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

export const accreditationStatusEnum = pgEnum("accreditation_status", [
  "draft",
  "issued",
  "active",
  "revoked",
  "expired",
]);

export const vendorKindEnum = pgEnum("vendor_kind", ["general", "food"]);

export const vendorPackageTierEnum = pgEnum("vendor_package_tier", [
  "standard",
  "premium",
  "platinum",
]);

export const vendorEntitlementCategoryEnum = pgEnum("vendor_entitlement_category", [
  "equipment",
  "infrastructure",
  "operations",
  "marketing",
  "location",
]);

export const vendorPolicyTypeEnum = pgEnum("vendor_policy_type", [
  "cancellation",
  "operating_hours",
  "security",
  "setup",
]);

export const vendorApplicationStatusEnum = pgEnum("vendor_application_status", [
  "draft",
  "submitted",
  "under_review",
  "changes_requested",
  "approved",
  "rejected",
  "withdrawn",
]);

export const vendorPaymentStatusEnum = pgEnum("vendor_payment_status", [
  "pending",
  "under_review",
  "partially_paid",
  "paid",
  "rejected",
  "cancelled",
]);

export const vendorPaymentMethodEnum = pgEnum("vendor_payment_method", [
  "momo",
  "bank_transfer",
]);

export const vendorPaymentProofStatusEnum = pgEnum("vendor_payment_proof_status", [
  "submitted",
  "accepted",
  "rejected",
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
  complianceStatus: complianceStatusEnum("compliance_status").notNull().default("not_started"),
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
    categoryId: text("category_id").references(() => vendorCategories.id, { onDelete: "set null" }),
    packageId: text("package_id").references(() => vendorPackages.id, { onDelete: "set null" }),
    standId: text("stand_id").references(() => stands.id),
    onboardingStatus: complianceStatusEnum("onboarding_status").notNull(),
    complianceStatus: complianceStatusEnum("compliance_status").notNull(),
    approved: boolean("approved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vendors_organization_idx").on(table.organizationId),
    index("vendors_category_idx").on(table.categoryId),
    index("vendors_package_idx").on(table.packageId),
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

export const sponsorCommitments = pgTable(
  "sponsor_commitments",
  {
    id: text("id").primaryKey(),
    sponsorId: text("sponsor_id").notNull().references(() => sponsors.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull().default(""),
    ownerUserId: text("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    dueDate: date("due_date"),
    status: text("status").notNull().default("planned"),
    totalQuantity: integer("total_quantity").notNull().default(1),
    completedQuantity: integer("completed_quantity").notNull().default(0),
    proofUrl: text("proof_url"),
    notes: text("notes").notNull().default(""),
    visibleToSponsor: boolean("visible_to_sponsor").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sponsor_commitments_sponsor_idx").on(table.sponsorId),
    index("sponsor_commitments_status_due_idx").on(table.status, table.dueDate),
  ],
);

export const vendorCategoryGroups = pgTable("vendor_category_groups", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vendorCategories = pgTable(
  "vendor_categories",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => vendorCategoryGroups.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("vendor_categories_group_idx").on(table.groupId, table.sortOrder)],
);

export const vendorPackages = pgTable(
  "vendor_packages",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    vendorKind: vendorKindEnum("vendor_kind").notNull(),
    tier: vendorPackageTierEnum("tier").notNull(),
    description: text("description").notNull().default(""),
    currency: text("currency").notNull().default("GHS"),
    priceMinor: integer("price_minor"),
    boothWidthCm: integer("booth_width_cm").notNull(),
    boothDepthCm: integer("booth_depth_cm").notNull(),
    version: integer("version").notNull().default(1),
    active: boolean("active").notNull().default(true),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    updatedByUserId: text("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [index("vendor_packages_kind_tier_idx").on(table.vendorKind, table.tier)],
);

export const vendorPackageEntitlements = pgTable(
  "vendor_package_entitlements",
  {
    id: text("id").primaryKey(),
    packageId: text("package_id")
      .notNull()
      .references(() => vendorPackages.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    label: text("label").notNull(),
    description: text("description").notNull().default(""),
    category: vendorEntitlementCategoryEnum("category").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unit: text("unit").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("vendor_package_entitlements_package_code_unique").on(table.packageId, table.code),
    index("vendor_package_entitlements_package_idx").on(table.packageId, table.sortOrder),
  ],
);

export const vendorPolicies = pgTable(
  "vendor_policies",
  {
    id: text("id").primaryKey(),
    type: vendorPolicyTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    version: integer("version").notNull().default(1),
    active: boolean("active").notNull().default(true),
    effectiveFrom: date("effective_from"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    updatedByUserId: text("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [index("vendor_policies_type_active_idx").on(table.type, table.active)],
);

export const staffMembers = pgTable(
  "staff_members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    roleLabel: text("role_label").notNull(),
    staffType: text("staff_type").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("staff_members_organization_idx").on(table.organizationId),
    index("staff_members_user_idx").on(table.userId),
  ],
);

export const accreditationQuotas = pgTable("accreditation_quotas", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" })
    .unique(),
  maximumBadges: integer("maximum_badges").notNull().default(8),
  updatedByUserId: text("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accreditations = pgTable(
  "accreditations",
  {
    id: text("id").primaryKey(),
    staffMemberId: text("staff_member_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    badgeNumber: text("badge_number").notNull().unique(),
    badgeType: text("badge_type").notNull(),
    status: accreditationStatusEnum("status").notNull().default("draft"),
    tokenVersion: integer("token_version").notNull().default(1),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    issuedByUserId: text("issued_by_user_id").references(() => users.id, { onDelete: "set null" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedByUserId: text("revoked_by_user_id").references(() => users.id, { onDelete: "set null" }),
    revocationReason: text("revocation_reason"),
    lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("accreditations_organization_idx").on(table.organizationId),
    index("accreditations_staff_idx").on(table.staffMemberId),
    index("accreditations_status_idx").on(table.status),
  ],
);

export const accreditationScans = pgTable(
  "accreditation_scans",
  {
    id: text("id").primaryKey(),
    accreditationId: text("accreditation_id")
      .notNull()
      .references(() => accreditations.id, { onDelete: "cascade" }),
    scannedByUserId: text("scanned_by_user_id").references(() => users.id, { onDelete: "set null" }),
    checkpoint: text("checkpoint").notNull(),
    direction: text("direction").notNull(),
    outcome: text("outcome").notNull(),
    denialReason: text("denial_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("accreditation_scans_badge_idx").on(table.accreditationId, table.createdAt),
    index("accreditation_scans_checkpoint_idx").on(table.checkpoint, table.createdAt),
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

export const heroSlides = pgTable(
  "hero_slides",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    eyebrow: text("eyebrow").notNull().default("20-26 Dec / Accra"),
    imageUrl: text("image_url").notNull(),
    imageAlt: text("image_alt").notNull().default("Accra Christmas Village festival scene"),
    ctaLabel: text("cta_label").notNull().default("Open map"),
    ctaHref: text("cta_href").notNull().default("/map"),
    secondaryLabel: text("secondary_label").notNull().default("See programme"),
    secondaryHref: text("secondary_href").notNull().default("/programme"),
    sortOrder: integer("sort_order").notNull().default(0),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("hero_slides_publication_idx").on(table.published, table.sortOrder)],
);

export const documentRequirements = pgTable("document_requirements", {
  id: text("id").primaryKey(),
  organizationType: organizationTypeEnum("organization_type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  required: boolean("required").notNull().default(true),
  appliesToCategories: jsonb("applies_to_categories").$type<string[]>().notNull().default([]),
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
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    internalNote: text("internal_note"),
    replacementRequestedAt: timestamp("replacement_requested_at", { withTimezone: true }),
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
    version: integer("version").notNull().default(1),
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

export const documentVersions = pgTable(
  "document_versions",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    requirementId: text("requirement_id")
      .notNull()
      .references(() => documentRequirements.id),
    uploaderUserId: text("uploader_user_id").references(() => users.id, { onDelete: "set null" }),
    version: integer("version").notNull(),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storageKey: text("storage_key").notNull(),
    status: documentStatusEnum("status").notNull().default("submitted"),
    reviewerNote: text("reviewer_note"),
    internalNote: text("internal_note"),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [
    index("document_versions_document_idx").on(table.documentId),
    uniqueIndex("document_versions_number_unique").on(table.documentId, table.version),
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

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    type: text("type").notNull().default("info"),
    audience: text("audience").notNull().default("all"),
    organizationId: text("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    recipientUserId: text("recipient_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    actionHref: text("action_href"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdByUserId: text("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_audience_idx").on(table.audience),
    index("notifications_organization_idx").on(table.organizationId),
    index("notifications_recipient_idx").on(table.recipientUserId),
  ],
);

export const notificationReads = pgTable(
  "notification_reads",
  {
    id: text("id").primaryKey(),
    notificationId: text("notification_id")
      .notNull()
      .references(() => notifications.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("notification_reads_notification_user_unique").on(
      table.notificationId,
      table.userId,
    ),
  ],
);

export const supportTickets = pgTable(
  "support_tickets",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    createdByUserId: text("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    assignedToUserId: text("assigned_to_user_id").references(() => users.id, { onDelete: "set null" }),
    subject: text("subject").notNull(),
    category: text("category").notNull(),
    priority: text("priority").notNull().default("normal"),
    status: text("status").notNull().default("open"),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("support_tickets_organization_idx").on(table.organizationId),
    index("support_tickets_status_activity_idx").on(table.status, table.lastActivityAt),
  ],
);

export const supportMessages = pgTable(
  "support_messages",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    internal: boolean("internal").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("support_messages_ticket_idx").on(table.ticketId, table.createdAt)],
);

export const trafficDaily = pgTable(
  "traffic_daily",
  {
    id: text("id").primaryKey(),
    day: date("day").notNull(),
    path: text("path").notNull(),
    device: text("device").notNull(),
    source: text("source").notNull(),
    views: integer("views").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("traffic_daily_dimensions_unique").on(table.day, table.path, table.device, table.source),
    index("traffic_daily_day_idx").on(table.day),
  ],
);

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
    assignedToUserId: text("assigned_to_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    photoStorageKey: text("photo_storage_key"),
    photoFileName: text("photo_file_name"),
    photoContentType: text("photo_content_type"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("incidents_zone_idx").on(table.zoneId),
    index("incidents_assignee_idx").on(table.assignedToUserId),
  ],
);

export const operationalTasks = pgTable(
  "operational_tasks",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    taskType: text("task_type").notNull(),
    description: text("description").notNull().default(""),
    zoneId: text("zone_id").references(() => zones.id, { onDelete: "set null" }),
    standId: text("stand_id").references(() => stands.id, { onDelete: "set null" }),
    assignedToUserId: text("assigned_to_user_id").references(() => users.id, { onDelete: "set null" }),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    priority: text("priority").notNull().default("normal"),
    status: text("status").notNull().default("todo"),
    proofStorageKey: text("proof_storage_key"),
    proofFileName: text("proof_file_name"),
    proofContentType: text("proof_content_type"),
    createdByUserId: text("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("operational_tasks_status_due_idx").on(table.status, table.dueAt),
    index("operational_tasks_assignee_idx").on(table.assignedToUserId),
  ],
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

export const vendorApplications = pgTable(
  "vendor_applications",
  {
    id: text("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    applicantUserId: text("applicant_user_id").references(() => users.id, { onDelete: "set null" }),
    accessRequestId: text("access_request_id").references(() => accessRequests.id, { onDelete: "set null" }).unique(),
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "set null" }),
    categoryId: text("category_id").references(() => vendorCategories.id, { onDelete: "set null" }),
    packageId: text("package_id").references(() => vendorPackages.id, { onDelete: "set null" }),
    organizationName: text("organization_name").notNull().default(""),
    tradingName: text("trading_name").notNull().default(""),
    vendorKind: vendorKindEnum("vendor_kind"),
    businessDescription: text("business_description").notNull().default(""),
    productsSummary: text("products_summary").notNull().default(""),
    websiteUrl: text("website_url").notNull().default(""),
    instagramHandle: text("instagram_handle").notNull().default(""),
    contactName: text("contact_name").notNull().default(""),
    contactEmail: text("contact_email").notNull().default(""),
    contactPhone: text("contact_phone").notNull().default(""),
    operationsContactName: text("operations_contact_name").notNull().default(""),
    operationsContactEmail: text("operations_contact_email").notNull().default(""),
    operationsContactPhone: text("operations_contact_phone").notNull().default(""),
    status: vendorApplicationStatusEnum("status").notNull().default("draft"),
    currentStep: integer("current_step").notNull().default(1),
    packageVersion: integer("package_version"),
    packageSnapshot: jsonb("package_snapshot").$type<Record<string, unknown> | null>(),
    categorySnapshot: jsonb("category_snapshot").$type<Record<string, unknown> | null>(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, { onDelete: "set null" }),
    reviewerNote: text("reviewer_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vendor_applications_status_idx").on(table.status, table.updatedAt),
    index("vendor_applications_category_idx").on(table.categoryId),
    index("vendor_applications_package_idx").on(table.packageId),
  ],
);

export const vendorApplicationPolicyAcceptances = pgTable(
  "vendor_application_policy_acceptances",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => vendorApplications.id, { onDelete: "cascade" }),
    policyId: text("policy_id").references(() => vendorPolicies.id, { onDelete: "set null" }),
    policyType: vendorPolicyTypeEnum("policy_type").notNull(),
    policyVersion: integer("policy_version").notNull(),
    policyTitle: text("policy_title").notNull(),
    policyBody: text("policy_body").notNull(),
    acceptedByUserId: text("accepted_by_user_id").references(() => users.id, { onDelete: "set null" }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("vendor_application_policy_unique").on(table.applicationId, table.policyType),
    index("vendor_application_policy_application_idx").on(table.applicationId),
  ],
);

export const vendorPaymentSettings = pgTable("vendor_payment_settings", {
  id: text("id").primaryKey(),
  momoEnabled: boolean("momo_enabled").notNull().default(false),
  momoNetwork: text("momo_network").notNull().default(""),
  momoName: text("momo_name").notNull().default(""),
  momoPhone: text("momo_phone").notNull().default(""),
  bankEnabled: boolean("bank_enabled").notNull().default(false),
  bankName: text("bank_name").notNull().default(""),
  bankAccountName: text("bank_account_name").notNull().default(""),
  bankAccountNumber: text("bank_account_number").notNull().default(""),
  bankBranch: text("bank_branch").notNull().default(""),
  instructions: text("instructions").notNull().default("Use your payment reference in the transaction description."),
  paymentDueDays: integer("payment_due_days").notNull().default(7),
  updatedByUserId: text("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vendorPayments = pgTable(
  "vendor_payments",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    applicationId: text("application_id")
      .notNull()
      .references(() => vendorApplications.id, { onDelete: "cascade" })
      .unique(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    vendorId: text("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
    packageId: text("package_id").references(() => vendorPackages.id, { onDelete: "set null" }),
    standId: text("stand_id").references(() => stands.id, { onDelete: "set null" }),
    amountMinor: integer("amount_minor").notNull(),
    receivedAmountMinor: integer("received_amount_minor").notNull().default(0),
    currency: text("currency").notNull().default("GHS"),
    status: vendorPaymentStatusEnum("status").notNull().default("pending"),
    paymentMethod: vendorPaymentMethodEnum("payment_method"),
    payerName: text("payer_name").notNull().default(""),
    payerPhone: text("payer_phone").notNull().default(""),
    transactionReference: text("transaction_reference").notNull().default(""),
    proofStorageKey: text("proof_storage_key"),
    proofFileName: text("proof_file_name"),
    proofContentType: text("proof_content_type"),
    proofFileSize: integer("proof_file_size"),
    proofUploadedByUserId: text("proof_uploaded_by_user_id").references(() => users.id, { onDelete: "set null" }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    dueAt: timestamp("due_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, { onDelete: "set null" }),
    reviewerNote: text("reviewer_note"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vendor_payments_status_idx").on(table.status, table.updatedAt),
    index("vendor_payments_organization_idx").on(table.organizationId),
    index("vendor_payments_stand_idx").on(table.standId),
  ],
);

export const vendorPaymentProofs = pgTable(
  "vendor_payment_proofs",
  {
    id: text("id").primaryKey(),
    paymentId: text("payment_id")
      .notNull()
      .references(() => vendorPayments.id, { onDelete: "cascade" }),
    paymentMethod: vendorPaymentMethodEnum("payment_method").notNull(),
    payerName: text("payer_name").notNull(),
    payerPhone: text("payer_phone").notNull(),
    transactionReference: text("transaction_reference").notNull(),
    storageKey: text("storage_key").notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    fileSize: integer("file_size").notNull(),
    uploadedByUserId: text("uploaded_by_user_id").references(() => users.id, { onDelete: "set null" }),
    status: vendorPaymentProofStatusEnum("status").notNull().default("submitted"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, { onDelete: "set null" }),
    reviewerNote: text("reviewer_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vendor_payment_proofs_payment_idx").on(table.paymentId, table.createdAt),
    index("vendor_payment_proofs_status_idx").on(table.status),
  ],
);
