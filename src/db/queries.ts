import { desc, eq, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accessRequests, documents, organizations, users } from "@/db/schema";
import type { DocumentStatus, ParticipantRole, Role } from "@/lib/types";

const participantRoles: ParticipantRole[] = ["vendor", "sponsor", "partner"];
const organizerOrganizationId = "org-festival-ops";

function isParticipantRole(role: string): role is ParticipantRole {
  return participantRoles.includes(role as ParticipantRole);
}

function normalizeEmail(email: string | null) {
  return email?.trim().toLowerCase() || null;
}

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

export async function reviewDocument(
  documentId: string,
  status: Extract<DocumentStatus, "approved" | "rejected">,
  reviewerUserId: string,
  reviewerNote: string,
) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped Neon document review because DATABASE_URL is not set.", {
      documentId,
      status,
      reviewerUserId,
      reviewerNote,
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

export async function listAccessRequests() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const db = getDb();

  return db.select().from(accessRequests).orderBy(desc(accessRequests.createdAt));
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
