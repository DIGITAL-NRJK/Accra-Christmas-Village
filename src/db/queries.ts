import { and, asc, desc, eq, gte, or, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  accessRequests,
  announcements,
  auditLogs,
  documentRequirements,
  documents,
  events,
  heroSlides,
  incidents,
  notificationReads,
  notifications,
  onboardingTasks,
  organizations,
  sponsors,
  sponsorCommitments,
  stands,
  supportMessages,
  supportTickets,
  trafficDaily,
  users,
  vendors,
  zones,
} from "@/db/schema";
import { defaultHeroSlides } from "@/lib/hero-slides";
import { incidents as defaultIncidents } from "@/lib/data";
import type {
  DocumentStatus,
  HeroSlide,
  Incident,
  ParticipantRole,
  Role,
  Sponsor,
  Vendor,
} from "@/lib/types";

const participantRoles: ParticipantRole[] = ["vendor", "sponsor", "partner"];
const organizerOrganizationId = "org-festival-ops";

function isParticipantRole(role: string): role is ParticipantRole {
  return participantRoles.includes(role as ParticipantRole);
}

function normalizeEmail(email: string | null) {
  return email?.trim().toLowerCase() || null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || crypto.randomUUID();
}

function toDateInput(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

const heroSlideColumns = {
  id: heroSlides.id,
  title: heroSlides.title,
  subtitle: heroSlides.subtitle,
  eyebrow: heroSlides.eyebrow,
  imageUrl: heroSlides.imageUrl,
  imageAlt: heroSlides.imageAlt,
  ctaLabel: heroSlides.ctaLabel,
  ctaHref: heroSlides.ctaHref,
  secondaryLabel: heroSlides.secondaryLabel,
  secondaryHref: heroSlides.secondaryHref,
  sortOrder: heroSlides.sortOrder,
  published: heroSlides.published,
};

export type SaveDocumentMetadataInput = {
  id: string;
  organizationId: string;
  requirementId: string;
  uploaderUserId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
  storageUrl: string;
};

export async function saveDocumentMetadata(input: SaveDocumentMetadataInput) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped Neon document metadata write because DATABASE_URL is not set.", input);
    return;
  }

  const db = getDb();

  await db
    .insert(documents)
    .values({
      ...input,
      status: "submitted",
      submittedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [documents.organizationId, documents.requirementId],
      set: {
        uploaderUserId: input.uploaderUserId,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        storageKey: input.storageKey,
        storageUrl: input.storageUrl,
        status: "submitted",
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedByUserId: null,
        rejectionReason: null,
        reviewerNote: null,
      },
    });
}

export async function getDocumentById(documentId: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const db = getDb();
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  return document ?? null;
}

export async function reviewDocument(
  documentId: string,
  status: Extract<DocumentStatus, "approved" | "rejected">,
  reviewerUserId: string,
  reviewerNote: string,
  expiresAt: Date | null = null,
) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped Neon document review because DATABASE_URL is not set.", {
      documentId,
      status,
      reviewerUserId,
      reviewerNote,
      expiresAt,
    });
    return;
  }

  const db = getDb();

  await db
    .update(documents)
    .set({
      status,
      reviewerNote,
      rejectionReason: status === "rejected" ? reviewerNote : null,
      reviewedAt: new Date(),
      reviewedByUserId: reviewerUserId,
      expiresAt: status === "approved" ? expiresAt : null,
    })
    .where(eq(documents.id, documentId));
}

export async function findUserByClerkIdentity(clerkUserId: string, email: string | null) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(
      normalizedEmail
        ? or(eq(users.clerkUserId, clerkUserId), eq(users.email, normalizedEmail))
        : eq(users.clerkUserId, clerkUserId),
    )
    .limit(1);

  if (user && !user.clerkUserId) {
    const [updatedUser] = await db
      .update(users)
      .set({ clerkUserId })
      .where(eq(users.id, user.id))
      .returning();

    return updatedUser;
  }

  return user ?? null;
}

export async function updateUserRole(userId: string, role: Role) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped Neon user role update because DATABASE_URL is not set.", {
      userId,
      role,
    });
    return null;
  }

  const db = getDb();
  const [updatedUser] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning();

  return updatedUser ?? null;
}

export async function getUserDeletionContext(userId: string) {
  if (!process.env.DATABASE_URL || !userId) {
    return null;
  }

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    return null;
  }

  const [organization, organizationUsers, organizationDocuments, vendorRows, sponsorRows] =
    user.organizationId
      ? await Promise.all([
          db.select().from(organizations).where(eq(organizations.id, user.organizationId)).limit(1),
          db.select({ id: users.id }).from(users).where(eq(users.organizationId, user.organizationId)),
          db
            .select({ storageKey: documents.storageKey })
            .from(documents)
            .where(eq(documents.organizationId, user.organizationId)),
          db
            .select({ standId: vendors.standId })
            .from(vendors)
            .where(eq(vendors.organizationId, user.organizationId)),
          db
            .select({ standId: sponsors.standId })
            .from(sponsors)
            .where(eq(sponsors.organizationId, user.organizationId)),
        ])
      : [[], [], [], [], []];
  const organizationRecord = organization[0] ?? null;
  const isParticipantOrganization =
    organizationRecord?.type === "vendor" ||
    organizationRecord?.type === "sponsor" ||
    organizationRecord?.type === "partner";
  const deleteOrganization = Boolean(
    user.organizationId &&
    isParticipantOrganization &&
    organizationUsers.every((organizationUser) => organizationUser.id === user.id),
  );

  return {
    deleteOrganization,
    standIds: deleteOrganization
      ? Array.from(new Set(
          [...vendorRows, ...sponsorRows]
            .map((participant) => participant.standId)
            .filter((standId): standId is string => Boolean(standId)),
        ))
      : [],
    storageKeys: deleteOrganization
      ? organizationDocuments
          .map((document) => document.storageKey)
          .filter((storageKey): storageKey is string => Boolean(storageKey))
      : [],
    user,
  };
}

export async function deleteUserAndRelatedData(userId: string) {
  const context = await getUserDeletionContext(userId);

  if (!context) {
    return false;
  }

  const db = getDb();
  const organizationIdToDelete =
    context.deleteOrganization && context.user.organizationId
      ? context.user.organizationId
      : `preserve-${crypto.randomUUID()}`;
  const accessRequestCondition = context.user.clerkUserId
    ? or(
        eq(accessRequests.clerkUserId, context.user.clerkUserId),
        eq(accessRequests.email, context.user.email),
      )
    : eq(accessRequests.email, context.user.email);

  await db.batch([
    db
      .update(documents)
      .set({ reviewedByUserId: null })
      .where(eq(documents.reviewedByUserId, context.user.id)),
    db
      .update(documents)
      .set({ uploaderUserId: null })
      .where(eq(documents.uploaderUserId, context.user.id)),
    db.delete(auditLogs).where(eq(auditLogs.actorUserId, context.user.id)),
    db.delete(accessRequests).where(accessRequestCondition),
    db.delete(documents).where(eq(documents.organizationId, organizationIdToDelete)),
    db.delete(onboardingTasks).where(eq(onboardingTasks.organizationId, organizationIdToDelete)),
    db.delete(vendors).where(eq(vendors.organizationId, organizationIdToDelete)),
    db.delete(sponsors).where(eq(sponsors.organizationId, organizationIdToDelete)),
    db.delete(users).where(eq(users.id, context.user.id)),
    db.delete(organizations).where(eq(organizations.id, organizationIdToDelete)),
  ] as const);

  await Promise.all(context.standIds.map((standId) => releaseStandIfEmpty(standId)));

  return true;
}

export async function getOrganizationById(organizationId: string | null) {
  if (!process.env.DATABASE_URL || !organizationId) {
    return null;
  }

  const db = getDb();
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  return organization ?? null;
}

export type SyncClerkUserProfileInput = {
  clerkUserId: string;
  email: string | null;
  fullName: string;
  adminEmails: string[];
};

export async function syncClerkUserProfile(input: SyncClerkUserProfileInput) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const email = normalizeEmail(input.email);

  if (!email) {
    return null;
  }

  const db = getDb();
  const adminEmails = input.adminEmails.map((adminEmail) => adminEmail.toLowerCase());
  const isBootstrapAdmin = adminEmails.includes(email);

  if (isBootstrapAdmin) {
    await db
      .insert(organizations)
      .values({
        id: organizerOrganizationId,
        name: "Accra Christmas Village Operations",
        type: "organizer",
        contactEmail: email,
        contactPhone: "",
        status: "active",
      })
      .onConflictDoNothing();
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(or(eq(users.clerkUserId, input.clerkUserId), eq(users.email, email)))
    .limit(1);

  const role: Role = isBootstrapAdmin ? "super_admin" : existingUser?.role ?? "visitor";
  const organizationId = isBootstrapAdmin ? organizerOrganizationId : existingUser?.organizationId ?? null;
  const fullName = input.fullName.trim() || existingUser?.fullName || email;

  if (existingUser) {
    const [updatedUser] = await db
      .update(users)
      .set({
        clerkUserId: input.clerkUserId,
        organizationId,
        role,
        fullName,
        email,
      })
      .where(eq(users.id, existingUser.id))
      .returning();

    return updatedUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      clerkUserId: input.clerkUserId,
      organizationId,
      role,
      fullName,
      email,
      phone: "",
    })
    .returning();

  return createdUser;
}

export type CreateAccessRequestInput = {
  clerkUserId: string;
  email: string;
  requestedRole: ParticipantRole;
  organizationName: string;
  contactName: string;
  phone: string;
  message: string;
};

export async function createOrUpdateAccessRequest(input: CreateAccessRequestInput) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped access request write because DATABASE_URL is not set.", {
      email: input.email,
      requestedRole: input.requestedRole,
      organizationName: input.organizationName,
    });
    return;
  }

  const db = getDb();

  await db
    .insert(accessRequests)
    .values({
      id: crypto.randomUUID(),
      ...input,
      status: "pending",
      reviewerNote: null,
      reviewedAt: null,
      cancellationReason: null,
      cancelledAt: null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: accessRequests.clerkUserId,
      set: {
        email: input.email,
        requestedRole: input.requestedRole,
        organizationName: input.organizationName,
        contactName: input.contactName,
        phone: input.phone,
        message: input.message,
        status: "pending",
        reviewerNote: null,
        reviewedAt: null,
        cancellationReason: null,
        cancelledAt: null,
        updatedAt: new Date(),
      },
    });
}

export async function getAccessRequestForClerkUser(clerkUserId: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const db = getDb();
  const [request] = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.clerkUserId, clerkUserId))
    .limit(1);

  return request ?? null;
}

export async function getAccessRequestById(requestId: string) {
  if (!process.env.DATABASE_URL || !requestId) {
    return null;
  }

  const db = getDb();
  const [request] = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.id, requestId))
    .limit(1);

  return request ?? null;
}

export async function listAccessRequests() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const db = getDb();

  return db.select().from(accessRequests).orderBy(desc(accessRequests.createdAt));
}

export async function ensureParticipantRecord(
  organizationId: string,
  role: ParticipantRole,
  organizationName: string,
) {
  const db = getDb();

  if (role === "vendor") {
    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.organizationId, organizationId))
      .limit(1);

    if (!existingVendor) {
      await db.insert(vendors).values({
        id: crypto.randomUUID(),
        organizationId,
        tradingName: organizationName,
        category: "Pending classification",
        standId: null,
        onboardingStatus: "not_started",
        complianceStatus: "not_started",
        approved: true,
      });
    }
  }

  if (role === "sponsor") {
    const [existingSponsor] = await db
      .select()
      .from(sponsors)
      .where(eq(sponsors.organizationId, organizationId))
      .limit(1);

    if (!existingSponsor) {
      await db.insert(sponsors).values({
        id: crypto.randomUUID(),
        organizationId,
        slug: slugify(organizationName),
        brandName: organizationName,
        packageLevel: "community",
        activationLocation: "Pending allocation",
        standId: null,
        status: "confirmed",
        summary: "Sponsor profile created from approved access request.",
        activationPlan: "Activation plan pending organizer setup.",
      });
    }
  }
}

export async function approveAccessRequest(
  requestId: string,
  reviewerNote: string,
  reviewerUserId: string | null,
) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped access request approval because DATABASE_URL is not set.", {
      requestId,
      reviewerNote,
      reviewerUserId,
    });
    return;
  }

  const db = getDb();
  const [request] = await db.select().from(accessRequests).where(eq(accessRequests.id, requestId)).limit(1);

  if (!request) {
    return;
  }

  if (!isParticipantRole(request.requestedRole)) {
    await db
      .update(accessRequests)
      .set({
        status: "rejected",
        reviewerNote: "Only vendor, sponsor and partner access requests can be approved here.",
        reviewedAt: new Date(),
        cancellationReason: null,
        cancelledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(accessRequests.id, requestId));
    return;
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(or(eq(users.clerkUserId, request.clerkUserId), eq(users.email, request.email)))
    .limit(1);
  const organizationId = existingUser?.organizationId ?? crypto.randomUUID();

  if (!existingUser?.organizationId) {
    await db
      .insert(organizations)
      .values({
        id: organizationId,
        name: request.organizationName,
        type: request.requestedRole,
        contactEmail: request.email,
        contactPhone: request.phone,
        status: "active",
      })
      .onConflictDoNothing();
  }

  if (existingUser) {
    await db
      .update(users)
      .set({
        clerkUserId: request.clerkUserId,
        organizationId,
        role: request.requestedRole,
        fullName: request.contactName,
        email: request.email,
        phone: request.phone,
      })
      .where(eq(users.id, existingUser.id));
  } else {
    await db.insert(users).values({
      id: crypto.randomUUID(),
      clerkUserId: request.clerkUserId,
      organizationId,
      role: request.requestedRole,
      fullName: request.contactName,
      email: request.email,
      phone: request.phone,
    });
  }

  await ensureParticipantRecord(organizationId, request.requestedRole, request.organizationName);

  await db
    .update(accessRequests)
    .set({
      status: "approved",
      reviewerNote,
      reviewedAt: new Date(),
      cancellationReason: null,
      cancelledAt: null,
      updatedAt: new Date(),
    })
    .where(eq(accessRequests.id, requestId));
}

export async function rejectAccessRequest(
  requestId: string,
  reviewerNote: string,
  reviewerUserId: string | null,
) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped access request rejection because DATABASE_URL is not set.", {
      requestId,
      reviewerNote,
      reviewerUserId,
    });
    return;
  }

  const db = getDb();

  await db
    .update(accessRequests)
    .set({
      status: "rejected",
      reviewerNote,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(accessRequests.id, requestId));
}

export async function cancelAccessRequestForClerkUser(clerkUserId: string, cancellationReason: string) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped access request cancellation because DATABASE_URL is not set.", {
      clerkUserId,
      cancellationReason,
    });
    return;
  }

  const db = getDb();

  await db
    .update(accessRequests)
    .set({
      status: "cancelled",
      cancellationReason,
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(accessRequests.clerkUserId, clerkUserId));
}

export async function listAdminData() {
  if (!process.env.DATABASE_URL) {
    return {
      accessRequests: [],
      announcements: [],
      auditLogs: [],
      documents: [],
      documentRequirements: [],
      events: [],
      heroSlides: defaultHeroSlides,
      incidents: defaultIncidents,
      notifications: [],
      organizations: [],
      sponsors: [],
      sponsorCommitments: [],
      stands: [],
      users: [],
      vendors: [],
      zones: [],
    };
  }

  const db = getDb();

  const [
    accessRequestRows,
    announcementRows,
    auditLogRows,
    documentRows,
    documentRequirementRows,
    eventRows,
    heroSlideRows,
    incidentRows,
    notificationRows,
    organizationRows,
    sponsorRows,
    sponsorCommitmentRows,
    standRows,
    userRows,
    vendorRows,
    zoneRows,
  ] = await Promise.all([
    db.select().from(accessRequests).orderBy(desc(accessRequests.createdAt)),
    db.select().from(announcements).orderBy(desc(announcements.createdAt)),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)),
    db.select().from(documents).orderBy(desc(documents.createdAt)),
    db.select().from(documentRequirements).orderBy(asc(documentRequirements.sortOrder)),
    db.select().from(events).orderBy(asc(events.day), asc(events.startsAt)),
    db.select(heroSlideColumns).from(heroSlides).orderBy(asc(heroSlides.sortOrder), desc(heroSlides.createdAt)),
    db.select().from(incidents).orderBy(desc(incidents.occurredAt)),
    db.select().from(notifications).orderBy(desc(notifications.createdAt)),
    db.select().from(organizations).orderBy(asc(organizations.name)),
    db.select().from(sponsors).orderBy(asc(sponsors.brandName)),
    db.select().from(sponsorCommitments).orderBy(asc(sponsorCommitments.dueDate), asc(sponsorCommitments.title)),
    db.select().from(stands).orderBy(asc(stands.code)),
    db.select().from(users).orderBy(asc(users.fullName)),
    db.select().from(vendors).orderBy(asc(vendors.tradingName)),
    db.select().from(zones).orderBy(asc(zones.name)),
  ]);

  return {
    accessRequests: accessRequestRows,
    announcements: announcementRows,
    auditLogs: auditLogRows,
    documents: documentRows,
    documentRequirements: documentRequirementRows,
    events: eventRows,
    heroSlides: heroSlideRows,
    incidents: incidentRows,
    notifications: notificationRows,
    organizations: organizationRows,
    sponsors: sponsorRows,
    sponsorCommitments: sponsorCommitmentRows,
    stands: standRows,
    users: userRows,
    vendors: vendorRows,
    zones: zoneRows,
  };
}

export type SaveSponsorCommitmentInput = {
  sponsorId: string;
  kind: string;
  title: string;
  category: string;
  description: string;
  ownerUserId: string | null;
  dueDate: string | null;
  status: string;
  totalQuantity: number;
  completedQuantity: number;
  proofUrl: string | null;
  notes: string;
  visibleToSponsor: boolean;
};

export async function createSponsorCommitment(input: SaveSponsorCommitmentInput) {
  if (!process.env.DATABASE_URL) return null;
  const id = crypto.randomUUID();
  await getDb().insert(sponsorCommitments).values({ id, ...input });
  return id;
}

export async function updateSponsorCommitment(id: string, input: SaveSponsorCommitmentInput) {
  if (!process.env.DATABASE_URL || !id) return false;
  const [updated] = await getDb().update(sponsorCommitments).set({ ...input, updatedAt: new Date() }).where(eq(sponsorCommitments.id, id)).returning({ id: sponsorCommitments.id });
  return Boolean(updated);
}

export async function deleteSponsorCommitment(id: string) {
  if (!process.env.DATABASE_URL || !id) return;
  await getDb().delete(sponsorCommitments).where(eq(sponsorCommitments.id, id));
}

export async function recordAuditLog(input: {
  action: string;
  actorUserId: string | null;
  entityId: string;
  entityType: string;
  metadata?: Record<string, unknown>;
}) {
  if (!process.env.DATABASE_URL) return;

  const db = getDb();
  await db.insert(auditLogs).values({
    ...input,
    id: crypto.randomUUID(),
    metadata: input.metadata ?? {},
  });
}

export async function listTicketsForOrganization(organizationId: string) {
  if (!process.env.DATABASE_URL || !organizationId) return [];
  return getDb().select().from(supportTickets).where(eq(supportTickets.organizationId, organizationId)).orderBy(desc(supportTickets.lastActivityAt));
}

export async function listAllSupportTickets() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select().from(supportTickets).orderBy(desc(supportTickets.lastActivityAt));
}

export async function getSupportTicket(ticketId: string) {
  if (!process.env.DATABASE_URL || !ticketId) return null;
  const [ticket] = await getDb().select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
  return ticket ?? null;
}

export async function listSupportMessages(ticketId: string, includeInternal: boolean) {
  if (!process.env.DATABASE_URL || !ticketId) return [];
  const db = getDb();
  return db.select().from(supportMessages).where(
    includeInternal
      ? eq(supportMessages.ticketId, ticketId)
      : and(eq(supportMessages.ticketId, ticketId), eq(supportMessages.internal, false)),
  ).orderBy(asc(supportMessages.createdAt));
}

export async function createSupportTicket(input: {
  organizationId: string;
  createdByUserId: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
}) {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const ticketId = crypto.randomUUID();
  const now = new Date();
  await db.batch([
    db.insert(supportTickets).values({ id: ticketId, organizationId: input.organizationId, createdByUserId: input.createdByUserId, subject: input.subject, category: input.category, priority: input.priority, status: "open", lastActivityAt: now, updatedAt: now }),
    db.insert(supportMessages).values({ id: crypto.randomUUID(), ticketId, authorUserId: input.createdByUserId, body: input.message, internal: false }),
  ] as const);
  return ticketId;
}

export async function addSupportMessage(input: { ticketId: string; authorUserId: string; body: string; internal: boolean }) {
  if (!process.env.DATABASE_URL) return;
  const db = getDb();
  const now = new Date();
  await db.batch([
    db.insert(supportMessages).values({ id: crypto.randomUUID(), ...input }),
    db.update(supportTickets).set({ lastActivityAt: now, updatedAt: now }).where(eq(supportTickets.id, input.ticketId)),
  ] as const);
}

export async function updateSupportTicket(ticketId: string, input: { status: string; priority: string; assignedToUserId: string | null }) {
  if (!process.env.DATABASE_URL || !ticketId) return;
  await getDb().update(supportTickets).set({ ...input, updatedAt: new Date() }).where(eq(supportTickets.id, ticketId));
}

export async function incrementAnonymousPageView(input: { path: string; device: string; source: string }) {
  if (!process.env.DATABASE_URL) return;
  const db = getDb();
  const day = new Date().toISOString().slice(0, 10);
  await db.insert(trafficDaily).values({ id: crypto.randomUUID(), day, ...input, views: 1 }).onConflictDoUpdate({
    target: [trafficDaily.day, trafficDaily.path, trafficDaily.device, trafficDaily.source],
    set: { views: sql`${trafficDaily.views} + 1`, updatedAt: new Date() },
  });
}

export async function listAnonymousTraffic(sinceDay: string) {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select().from(trafficDaily).where(gte(trafficDaily.day, sinceDay)).orderBy(asc(trafficDaily.day));
}

export type CreateNotificationInput = {
  actionHref: string | null;
  audience: string;
  body: string;
  createdByUserId: string | null;
  expiresAt: Date | null;
  organizationId: string | null;
  recipientUserId?: string | null;
  title: string;
  type: string;
};

export async function createNotification(input: CreateNotificationInput) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped notification creation because DATABASE_URL is not set.", input);
    return;
  }

  const db = getDb();
  await db.insert(notifications).values({ ...input, id: crypto.randomUUID() });
}

export async function deleteNotification(notificationId: string) {
  if (!process.env.DATABASE_URL || !notificationId) {
    return;
  }

  const db = getDb();
  await db.delete(notifications).where(eq(notifications.id, notificationId));
}

export async function listNotificationsForUser(
  userId: string,
  role: Role,
  organizationId: string | null,
) {
  if (!process.env.DATABASE_URL || !userId) {
    return [];
  }

  const db = getDb();
  const [notificationRows, readRows] = await Promise.all([
    db.select().from(notifications).orderBy(desc(notifications.createdAt)),
    db.select().from(notificationReads).where(eq(notificationReads.userId, userId)),
  ]);
  const readIds = new Set(readRows.map((read) => read.notificationId));
  const now = new Date();

  return notificationRows
    .filter((notification) => {
      const active = !notification.expiresAt || notification.expiresAt >= now;
      const audienceMatches =
        notification.audience === "all" ||
        notification.audience === role ||
        (notification.audience === "internal" &&
          ["admin", "super_admin", "operations_manager", "content_manager", "compliance_manager", "stand_manager"].includes(role));
      const organizationMatches =
        !notification.organizationId || notification.organizationId === organizationId;
      const recipientMatches =
        !notification.recipientUserId || notification.recipientUserId === userId;

      return active && audienceMatches && organizationMatches && recipientMatches;
    })
    .map((notification) => ({ ...notification, read: readIds.has(notification.id) }));
}

export async function markNotificationRead(notificationId: string, userId: string) {
  if (!process.env.DATABASE_URL || !notificationId || !userId) {
    return;
  }

  const db = getDb();
  await db
    .insert(notificationReads)
    .values({ id: crypto.randomUUID(), notificationId, userId })
    .onConflictDoNothing();
}

export async function markAllNotificationsRead(notificationIds: string[], userId: string) {
  if (!process.env.DATABASE_URL || !userId || notificationIds.length === 0) {
    return;
  }

  const db = getDb();
  await db
    .insert(notificationReads)
    .values(
      notificationIds.map((notificationId) => ({
        id: crypto.randomUUID(),
        notificationId,
        userId,
      })),
    )
    .onConflictDoNothing();
}

export async function listPublishedEvents() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const db = getDb();

  return db
    .select()
    .from(events)
    .where(eq(events.published, true))
    .orderBy(asc(events.day), asc(events.startsAt));
}

export async function listPublishedAnnouncements(audience: string) {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const db = getDb();
  const now = new Date();
  const rows = await db.select().from(announcements).orderBy(desc(announcements.createdAt));

  return rows.filter((announcement) => {
    const audienceMatches = announcement.audience === "all" || announcement.audience === audience;
    const withinWindow =
      announcement.startsAt <= now &&
      (!announcement.endsAt || announcement.endsAt >= now);

    return announcement.published && audienceMatches && withinWindow;
  });
}

export async function listTopbarAnnouncements() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const db = getDb();
  const rows = await db.select().from(announcements).orderBy(desc(announcements.createdAt));

  return rows
    .filter((announcement) => announcement.published)
    .sort((first, second) => {
      if (first.priority === second.priority) {
        return second.createdAt.getTime() - first.createdAt.getTime();
      }

      if (first.priority === "high") {
        return -1;
      }

      if (second.priority === "high") {
        return 1;
      }

      return 0;
    });
}

export async function getParticipantPlacement(organizationId: string) {
  if (!process.env.DATABASE_URL) {
    return { vendor: null, sponsor: null, stand: null, zone: null };
  }

  const db = getDb();
  const [vendor] = await db.select().from(vendors).where(eq(vendors.organizationId, organizationId)).limit(1);
  const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.organizationId, organizationId)).limit(1);
  const standId = vendor?.standId ?? sponsor?.standId ?? null;
  const [stand] = standId ? await db.select().from(stands).where(eq(stands.id, standId)).limit(1) : [];
  const [zone] = stand ? await db.select().from(zones).where(eq(zones.id, stand.zoneId)).limit(1) : [];

  return {
    vendor: vendor ?? null,
    sponsor: sponsor ?? null,
    stand: stand ?? null,
    zone: zone ?? null,
  };
}

export async function getStandById(standId: string) {
  if (!process.env.DATABASE_URL || !standId) {
    return null;
  }

  const db = getDb();
  const [stand] = await db.select().from(stands).where(eq(stands.id, standId)).limit(1);

  return stand ?? null;
}

export type AssignStandInput = {
  standId: string;
  participantType: "vendor" | "sponsor" | "none";
  organizationId: string;
};

export async function assignStand(input: AssignStandInput) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped stand assignment because DATABASE_URL is not set.", input);
    return;
  }

  const db = getDb();

  await db.update(vendors).set({ standId: null }).where(eq(vendors.standId, input.standId));
  await db.update(sponsors).set({ standId: null, activationLocation: "Pending allocation" }).where(eq(sponsors.standId, input.standId));

  if (input.participantType === "none" || !input.organizationId) {
    await db.update(stands).set({ status: "available" }).where(eq(stands.id, input.standId));
    return;
  }

  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, input.organizationId))
    .limit(1);

  if (!organization) {
    return;
  }

  if (input.participantType === "vendor") {
    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.organizationId, input.organizationId))
      .limit(1);

    if (existingVendor) {
      await db.update(vendors).set({ standId: input.standId, approved: true }).where(eq(vendors.id, existingVendor.id));
    } else {
      await db.insert(vendors).values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        tradingName: organization.name,
        category: "Pending classification",
        standId: input.standId,
        onboardingStatus: "in_progress",
        complianceStatus: "in_progress",
        approved: true,
      });
    }
  }

  if (input.participantType === "sponsor") {
    const [stand] = await db.select().from(stands).where(eq(stands.id, input.standId)).limit(1);
    const activationLocation = stand ? `${stand.code} / ${stand.name}` : "Assigned activation";
    const [existingSponsor] = await db
      .select()
      .from(sponsors)
      .where(eq(sponsors.organizationId, input.organizationId))
      .limit(1);

    if (existingSponsor) {
      await db
        .update(sponsors)
        .set({ standId: input.standId, activationLocation, status: "active" })
        .where(eq(sponsors.id, existingSponsor.id));
    } else {
      await db.insert(sponsors).values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        slug: slugify(organization.name),
        brandName: organization.name,
        packageLevel: "community",
        activationLocation,
        standId: input.standId,
        status: "active",
        summary: "Sponsor profile created during stand assignment.",
        activationPlan: "Activation plan pending organizer setup.",
      });
    }
  }

  await db.update(stands).set({ status: "assigned" }).where(eq(stands.id, input.standId));
}

export type SaveSponsorInput = Pick<
  Sponsor,
  "activationLocation" | "activationPlan" | "brandName" | "packageLevel" | "standId" | "status" | "summary"
> & {
  contactEmail: string;
  contactPhone: string;
};

export type SaveVendorInput = Pick<
  Vendor,
  "approved" | "category" | "complianceStatus" | "onboardingStatus" | "standId" | "tradingName"
> & {
  contactEmail: string;
  contactPhone: string;
};

export async function updateVendor(
  vendorId: string,
  organizationId: string,
  input: SaveVendorInput,
) {
  if (!process.env.DATABASE_URL || !vendorId || !organizationId) {
    console.info("Skipped vendor update because DATABASE_URL is not set or identifiers are missing.", {
      organizationId,
      vendorId,
      input,
    });
    return;
  }

  const db = getDb();
  const [currentVendor] = await db
    .select({
      organizationId: vendors.organizationId,
      standId: vendors.standId,
    })
    .from(vendors)
    .where(eq(vendors.id, vendorId))
    .limit(1);

  if (!currentVendor || currentVendor.organizationId !== organizationId) {
    return false;
  }

  await db
    .update(organizations)
    .set({
      name: input.tradingName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      status: input.approved ? "active" : "pending",
    })
    .where(eq(organizations.id, organizationId));

  await db
    .update(vendors)
    .set({
      approved: input.approved,
      category: input.category,
      complianceStatus: input.complianceStatus,
      onboardingStatus: input.onboardingStatus,
      standId: input.standId,
      tradingName: input.tradingName,
    })
    .where(eq(vendors.id, vendorId));

  if (currentVendor?.standId && currentVendor.standId !== input.standId) {
    await releaseStandIfEmpty(currentVendor.standId);
  }

  if (input.standId) {
    await db.update(stands).set({ status: "assigned" }).where(eq(stands.id, input.standId));
  }

  return true;
}

export async function deleteVendor(vendorId: string) {
  if (!process.env.DATABASE_URL || !vendorId) {
    return;
  }

  const db = getDb();
  const [currentVendor] = await db
    .select({ standId: vendors.standId })
    .from(vendors)
    .where(eq(vendors.id, vendorId))
    .limit(1);

  await db.delete(vendors).where(eq(vendors.id, vendorId));
  await releaseStandIfEmpty(currentVendor?.standId ?? null);
}

async function createUniqueSponsorSlug(brandName: string, currentSponsorId?: string) {
  const db = getDb();
  const baseSlug = slugify(brandName);

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const [existingSponsor] = await db
      .select({ id: sponsors.id })
      .from(sponsors)
      .where(eq(sponsors.slug, candidate))
      .limit(1);

    if (!existingSponsor || existingSponsor.id === currentSponsorId) {
      return candidate;
    }
  }

  return `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
}

async function releaseStandIfEmpty(standId: string | null) {
  if (!standId || !process.env.DATABASE_URL) {
    return;
  }

  const db = getDb();
  const [assignedVendor] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.standId, standId))
    .limit(1);
  const [assignedSponsor] = await db
    .select({ id: sponsors.id })
    .from(sponsors)
    .where(eq(sponsors.standId, standId))
    .limit(1);

  if (!assignedVendor && !assignedSponsor) {
    await db.update(stands).set({ status: "available" }).where(eq(stands.id, standId));
  }
}

export async function createSponsor(input: SaveSponsorInput) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped sponsor creation because DATABASE_URL is not set.", input);
    return;
  }

  const db = getDb();
  const organizationId = crypto.randomUUID();
  const sponsorId = crypto.randomUUID();
  const slug = await createUniqueSponsorSlug(input.brandName);

  await db.insert(organizations).values({
    id: organizationId,
    name: input.brandName,
    type: "sponsor",
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    status: input.status === "prospect" ? "pending" : "active",
  });

  await db.insert(sponsors).values({
    id: sponsorId,
    organizationId,
    slug,
    brandName: input.brandName,
    packageLevel: input.packageLevel,
    activationLocation: input.activationLocation,
    standId: input.standId,
    status: input.status,
    summary: input.summary,
    activationPlan: input.activationPlan,
  });

  if (input.standId) {
    await db.update(stands).set({ status: "assigned" }).where(eq(stands.id, input.standId));
  }
}

export async function updateSponsor(sponsorId: string, organizationId: string, input: SaveSponsorInput) {
  if (!process.env.DATABASE_URL || !sponsorId || !organizationId) {
    console.info("Skipped sponsor update because DATABASE_URL is not set or identifiers are missing.", {
      organizationId,
      sponsorId,
      input,
    });
    return;
  }

  const db = getDb();
  const [currentSponsor] = await db
    .select({ standId: sponsors.standId })
    .from(sponsors)
    .where(eq(sponsors.id, sponsorId))
    .limit(1);
  const slug = await createUniqueSponsorSlug(input.brandName, sponsorId);

  await db
    .update(organizations)
    .set({
      name: input.brandName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      status: input.status === "prospect" ? "pending" : "active",
    })
    .where(eq(organizations.id, organizationId));

  await db
    .update(sponsors)
    .set({
      slug,
      brandName: input.brandName,
      packageLevel: input.packageLevel,
      activationLocation: input.activationLocation,
      standId: input.standId,
      status: input.status,
      summary: input.summary,
      activationPlan: input.activationPlan,
    })
    .where(eq(sponsors.id, sponsorId));

  if (currentSponsor?.standId && currentSponsor.standId !== input.standId) {
    await releaseStandIfEmpty(currentSponsor.standId);
  }

  if (input.standId) {
    await db.update(stands).set({ status: "assigned" }).where(eq(stands.id, input.standId));
  }
}

export async function updateSponsorStatus(sponsorId: string, status: Sponsor["status"]) {
  if (!process.env.DATABASE_URL || !sponsorId) {
    return;
  }

  const db = getDb();
  await db.update(sponsors).set({ status }).where(eq(sponsors.id, sponsorId));
}

export async function deleteSponsor(sponsorId: string) {
  if (!process.env.DATABASE_URL || !sponsorId) {
    return;
  }

  const db = getDb();
  const [currentSponsor] = await db
    .select({ standId: sponsors.standId })
    .from(sponsors)
    .where(eq(sponsors.id, sponsorId))
    .limit(1);

  await db.delete(sponsors).where(eq(sponsors.id, sponsorId));
  await releaseStandIfEmpty(currentSponsor?.standId ?? null);
}

export type SaveIncidentInput = Omit<Incident, "id" | "occurredAt"> & {
  occurredAt: Date;
};

export async function createIncident(input: SaveIncidentInput, incidentId = crypto.randomUUID()) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped incident creation because DATABASE_URL is not set.", input);
    return null;
  }

  const db = getDb();
  await db.insert(incidents).values({
    ...input,
    id: incidentId,
  });
  return incidentId;
}

export async function getIncidentById(incidentId: string) {
  if (!process.env.DATABASE_URL || !incidentId) return null;
  const [incident] = await getDb().select().from(incidents).where(eq(incidents.id, incidentId)).limit(1);
  return incident ?? null;
}

export async function updateIncident(incidentId: string, input: SaveIncidentInput) {
  if (!process.env.DATABASE_URL || !incidentId) {
    return false;
  }

  const db = getDb();
  const [updatedIncident] = await db
    .update(incidents)
    .set(input)
    .where(eq(incidents.id, incidentId))
    .returning({ id: incidents.id });

  return Boolean(updatedIncident);
}

export async function updateIncidentStatus(
  incidentId: string,
  status: Incident["status"],
) {
  if (!process.env.DATABASE_URL || !incidentId) {
    return false;
  }

  const db = getDb();
  const [updatedIncident] = await db
    .update(incidents)
    .set({ status })
    .where(eq(incidents.id, incidentId))
    .returning({ id: incidents.id });

  return Boolean(updatedIncident);
}

export async function deleteIncident(incidentId: string) {
  if (!process.env.DATABASE_URL || !incidentId) {
    return;
  }

  const db = getDb();
  await db.delete(incidents).where(eq(incidents.id, incidentId));
}

export type CreateProgrammeItemInput = {
  title: string;
  day: string;
  startsAt: string;
  endsAt: string;
  category: string;
  location: string;
  audience: string;
  description: string;
  published: boolean;
};

export type SaveProgrammeItemInput = CreateProgrammeItemInput;

export type SaveHeroSlideInput = Omit<HeroSlide, "id"> & {
  id?: string;
};

export async function listHeroSlides() {
  if (!process.env.DATABASE_URL) {
    return defaultHeroSlides;
  }

  const db = getDb();
  const rows = await db
    .select(heroSlideColumns)
    .from(heroSlides)
    .orderBy(asc(heroSlides.sortOrder), desc(heroSlides.createdAt));

  return rows.length > 0 ? rows : defaultHeroSlides;
}

export async function createHeroSlide(input: SaveHeroSlideInput) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped hero slide creation because DATABASE_URL is not set.", input);
    return;
  }

  const db = getDb();

  await db.insert(heroSlides).values({
    id: input.id ?? crypto.randomUUID(),
    title: input.title,
    subtitle: input.subtitle,
    eyebrow: input.eyebrow,
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    secondaryLabel: input.secondaryLabel,
    secondaryHref: input.secondaryHref,
    sortOrder: input.sortOrder,
    published: input.published,
    updatedAt: new Date(),
  });
}

export async function updateHeroSlide(slideId: string, input: SaveHeroSlideInput) {
  if (!process.env.DATABASE_URL || !slideId) {
    return;
  }

  const db = getDb();
  const values = {
    title: input.title,
    subtitle: input.subtitle,
    eyebrow: input.eyebrow,
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    secondaryLabel: input.secondaryLabel,
    secondaryHref: input.secondaryHref,
    sortOrder: input.sortOrder,
    published: input.published,
    updatedAt: new Date(),
  };

  await db
    .insert(heroSlides)
    .values({
      id: slideId,
      ...values,
    })
    .onConflictDoUpdate({
      target: heroSlides.id,
      set: values,
    });
}

export async function updateHeroSlidePublication(slideId: string, published: boolean) {
  if (!process.env.DATABASE_URL || !slideId) {
    return;
  }

  const db = getDb();

  await db
    .update(heroSlides)
    .set({ published, updatedAt: new Date() })
    .where(eq(heroSlides.id, slideId));
}

export async function deleteHeroSlide(slideId: string) {
  if (!process.env.DATABASE_URL || !slideId) {
    return;
  }

  const db = getDb();

  await db.delete(heroSlides).where(eq(heroSlides.id, slideId));
}

export async function createProgrammeItem(input: CreateProgrammeItemInput) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped programme item creation because DATABASE_URL is not set.", input);
    return;
  }

  const db = getDb();

  await db.insert(events).values({
    id: crypto.randomUUID(),
    ...input,
  });
}

export async function updateProgrammePublication(eventId: string, published: boolean) {
  if (!process.env.DATABASE_URL || !eventId) {
    return;
  }

  const db = getDb();

  await db.update(events).set({ published }).where(eq(events.id, eventId));
}

export async function updateProgrammeItem(eventId: string, input: SaveProgrammeItemInput) {
  if (!process.env.DATABASE_URL || !eventId) {
    console.info("Skipped programme item update because DATABASE_URL is not set.", {
      eventId,
      input,
    });
    return;
  }

  const db = getDb();

  await db.update(events).set(input).where(eq(events.id, eventId));
}

export async function deleteProgrammeItem(eventId: string) {
  if (!process.env.DATABASE_URL || !eventId) {
    return;
  }

  const db = getDb();

  await db.delete(events).where(eq(events.id, eventId));
}

export type CreateAnnouncementInput = {
  title: string;
  body: string;
  audience: string;
  priority: string;
  published: boolean;
  startsAt: Date;
  endsAt: Date | null;
};

export async function createAnnouncement(input: CreateAnnouncementInput) {
  const announcementId = crypto.randomUUID();

  if (!process.env.DATABASE_URL) {
    console.info("Skipped announcement creation because DATABASE_URL is not set.", input);
    return announcementId;
  }

  const db = getDb();

  await db.insert(announcements).values({
    id: announcementId,
    ...input,
  });

  return announcementId;
}

export async function getAnnouncementById(announcementId: string) {
  if (!process.env.DATABASE_URL || !announcementId) {
    return null;
  }

  const db = getDb();
  const [announcement] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, announcementId))
    .limit(1);

  return announcement ?? null;
}

export async function updateAnnouncement(announcementId: string, input: CreateAnnouncementInput) {
  if (!process.env.DATABASE_URL || !announcementId) {
    console.info("Skipped announcement update because DATABASE_URL is not set or identifier is missing.", {
      announcementId,
      input,
    });
    return;
  }

  const db = getDb();

  await db.update(announcements).set(input).where(eq(announcements.id, announcementId));
}

export async function updateAnnouncementPublication(announcementId: string, published: boolean) {
  if (!process.env.DATABASE_URL || !announcementId) {
    return;
  }

  const db = getDb();

  await db.update(announcements).set({ published }).where(eq(announcements.id, announcementId));
}

export async function deleteAnnouncement(announcementId: string) {
  if (!process.env.DATABASE_URL || !announcementId) {
    return;
  }

  const db = getDb();

  await db.delete(announcements).where(eq(announcements.id, announcementId));
}

export function getDateValue(formData: FormData, name: string) {
  return toDateInput(formData.get(name));
}
