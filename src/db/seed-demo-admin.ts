import { getDb } from "./client";
import { loadLocalEnv } from "./load-env";
import * as schema from "./schema";
import {
  announcements,
  documentRequirements,
  documents,
  incidents,
  onboardingTasks,
  organizations,
  programmeItems,
  sponsors,
  stands,
  users,
  vendors,
  zones,
} from "../lib/data";
import { defaultHeroSlides } from "../lib/hero-slides";

loadLocalEnv();

const demoAccessRequests: Array<typeof schema.accessRequests.$inferInsert> = [
  {
    id: "access-demo-pending-vendor",
    clerkUserId: "demo-clerk-pending-vendor",
    email: "newvendor@demo.example",
    requestedRole: "vendor",
    organizationName: "Nkyinkyim Crafts",
    contactName: "Adjoa Nkrumah",
    phone: "+233 20 000 0501",
    message: "Handmade ornaments and family craft kits for the Made in Ghana market.",
    status: "pending",
    reviewerNote: null,
    reviewedAt: null,
    cancellationReason: null,
    cancelledAt: null,
    createdAt: new Date("2026-09-20T09:00:00Z"),
    updatedAt: new Date("2026-09-20T09:00:00Z"),
  },
  {
    id: "access-demo-pending-sponsor",
    clerkUserId: "demo-clerk-pending-sponsor",
    email: "brand@sunrise-demo.example",
    requestedRole: "sponsor",
    organizationName: "Sunrise Cocoa",
    contactName: "Esi Appiah",
    phone: "+233 30 000 0502",
    message: "Sampling activation with hot chocolate service and branded cups.",
    status: "pending",
    reviewerNote: null,
    reviewedAt: null,
    cancellationReason: null,
    cancelledAt: null,
    createdAt: new Date("2026-09-21T10:30:00Z"),
    updatedAt: new Date("2026-09-21T10:30:00Z"),
  },
  {
    id: "access-demo-approved-partner",
    clerkUserId: "demo-clerk-approved-partner",
    email: "liaison@arts-demo.example",
    requestedRole: "partner",
    organizationName: "Accra Arts Council",
    contactName: "Nana Osei",
    phone: "+233 30 000 0503",
    message: "Volunteer cultural programming support.",
    status: "approved",
    reviewerNote: "Approved for partner dashboard testing.",
    reviewedAt: new Date("2026-09-22T12:00:00Z"),
    cancellationReason: null,
    cancelledAt: null,
    createdAt: new Date("2026-09-18T08:00:00Z"),
    updatedAt: new Date("2026-09-22T12:00:00Z"),
  },
  {
    id: "access-demo-rejected-vendor",
    clerkUserId: "demo-clerk-rejected-vendor",
    email: "incomplete@demo.example",
    requestedRole: "vendor",
    organizationName: "Incomplete Food Stall",
    contactName: "Kwame Owusu",
    phone: "+233 20 000 0504",
    message: "Food service request without food safety details.",
    status: "rejected",
    reviewerNote: "Please provide food safety documentation before approval.",
    reviewedAt: new Date("2026-09-19T15:00:00Z"),
    cancellationReason: null,
    cancelledAt: null,
    createdAt: new Date("2026-09-17T08:00:00Z"),
    updatedAt: new Date("2026-09-19T15:00:00Z"),
  },
  {
    id: "access-demo-cancelled-sponsor",
    clerkUserId: "demo-clerk-cancelled-sponsor",
    email: "cancelled@demo.example",
    requestedRole: "sponsor",
    organizationName: "Cancelled Brand Demo",
    contactName: "Akosua Darko",
    phone: "+233 30 000 0505",
    message: "Initial sponsor enquiry.",
    status: "cancelled",
    reviewerNote: null,
    reviewedAt: null,
    cancellationReason: "Budget moved to another market.",
    cancelledAt: new Date("2026-09-23T16:00:00Z"),
    createdAt: new Date("2026-09-16T08:00:00Z"),
    updatedAt: new Date("2026-09-23T16:00:00Z"),
  },
];

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Add it to .env before running pnpm db:seed-demo-admin.");
  }
}

function getUploaderUserId(organizationId: string) {
  return users.find((user) => user.organizationId === organizationId)?.id ?? "user-demo-admin";
}

function getFileType(fileName: string | null) {
  if (!fileName) {
    return null;
  }

  if (fileName.endsWith(".zip")) {
    return "application/zip";
  }

  if (fileName.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  return "application/pdf";
}

async function main() {
  requireDatabaseUrl();
  const db = getDb();

  for (const zone of zones) {
    await db
      .insert(schema.zones)
      .values(zone)
      .onConflictDoUpdate({
        target: schema.zones.id,
        set: {
          code: zone.code,
          name: zone.name,
          kind: zone.kind,
          description: zone.description,
          gridColumn: zone.gridColumn,
          gridRow: zone.gridRow,
        },
      });
  }

  for (const stand of stands) {
    await db
      .insert(schema.stands)
      .values(stand)
      .onConflictDoUpdate({
        target: schema.stands.id,
        set: {
          code: stand.code,
          name: stand.name,
          zoneId: stand.zoneId,
          category: stand.category,
          size: stand.size,
          powerAmps: stand.powerAmps,
          status: stand.status,
          notes: stand.notes,
        },
      });
  }

  for (const organization of organizations) {
    await db
      .insert(schema.organizations)
      .values(organization)
      .onConflictDoUpdate({
        target: schema.organizations.id,
        set: {
          name: organization.name,
          type: organization.type,
          contactEmail: organization.contactEmail,
          contactPhone: organization.contactPhone,
          status: organization.status,
        },
      });
  }

  for (const user of users) {
    await db
      .insert(schema.users)
      .values({ ...user, clerkUserId: null })
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          organizationId: user.organizationId,
          role: user.role,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
      });
  }

  for (const requirement of documentRequirements) {
    await db
      .insert(schema.documentRequirements)
      .values(requirement)
      .onConflictDoUpdate({
        target: schema.documentRequirements.id,
        set: {
          organizationType: requirement.organizationType,
          name: requirement.name,
          description: requirement.description,
          required: requirement.required,
          appliesToCategories: requirement.appliesToCategories ?? [],
          sortOrder: requirement.sortOrder,
        },
      });
  }

  for (const vendor of vendors) {
    await db
      .insert(schema.vendors)
      .values(vendor)
      .onConflictDoUpdate({
        target: schema.vendors.id,
        set: {
          organizationId: vendor.organizationId,
          tradingName: vendor.tradingName,
          category: vendor.category,
          standId: vendor.standId,
          onboardingStatus: vendor.onboardingStatus,
          complianceStatus: vendor.complianceStatus,
          approved: vendor.approved,
        },
      });
  }

  for (const sponsor of sponsors) {
    await db
      .insert(schema.sponsors)
      .values(sponsor)
      .onConflictDoUpdate({
        target: schema.sponsors.id,
        set: {
          organizationId: sponsor.organizationId,
          slug: sponsor.slug,
          brandName: sponsor.brandName,
          packageLevel: sponsor.packageLevel,
          activationLocation: sponsor.activationLocation,
          standId: sponsor.standId,
          status: sponsor.status,
          summary: sponsor.summary,
          activationPlan: sponsor.activationPlan,
        },
      });
  }

  for (const event of programmeItems) {
    await db
      .insert(schema.events)
      .values(event)
      .onConflictDoUpdate({
        target: schema.events.id,
        set: {
          title: event.title,
          day: event.day,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          category: event.category,
          location: event.location,
          audience: event.audience,
          description: event.description,
          published: event.published,
        },
      });
  }

  for (const slide of defaultHeroSlides) {
    await db
      .insert(schema.heroSlides)
      .values({
        ...slide,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.heroSlides.id,
        set: {
          title: slide.title,
          subtitle: slide.subtitle,
          eyebrow: slide.eyebrow,
          imageUrl: slide.imageUrl,
          imageAlt: slide.imageAlt,
          ctaLabel: slide.ctaLabel,
          ctaHref: slide.ctaHref,
          secondaryLabel: slide.secondaryLabel,
          secondaryHref: slide.secondaryHref,
          sortOrder: slide.sortOrder,
          published: slide.published,
          updatedAt: new Date(),
        },
      });
  }

  for (const document of documents) {
    const documentValues = {
      organizationId: document.organizationId,
      requirementId: document.requirementId,
      uploaderUserId: document.fileName ? getUploaderUserId(document.organizationId) : null,
      fileName: document.fileName,
      fileType: getFileType(document.fileName),
      fileSize: document.fileName ? 180000 : null,
      storageKey: null,
      storageUrl: null,
      status: document.status,
      rejectionReason: document.status === "rejected" ? document.reviewerNote : null,
      reviewerNote: document.reviewerNote,
      submittedAt: document.submittedAt ? new Date(document.submittedAt) : null,
      reviewedAt: document.reviewedAt ? new Date(document.reviewedAt) : null,
      reviewedByUserId: document.reviewedAt ? "user-demo-admin" : null,
    };

    await db
      .insert(schema.documents)
      .values({
        id: document.id,
        ...documentValues,
      })
      .onConflictDoUpdate({
        target: schema.documents.id,
        set: documentValues,
      });
  }

  for (const task of onboardingTasks) {
    await db
      .insert(schema.onboardingTasks)
      .values(task)
      .onConflictDoUpdate({
        target: schema.onboardingTasks.id,
        set: {
          organizationId: task.organizationId,
          requirementId: task.requirementId,
          title: task.title,
          status: task.status,
          dueDate: task.dueDate,
          notes: task.notes,
        },
      });
  }

  for (const announcement of announcements) {
    await db
      .insert(schema.announcements)
      .values({
        ...announcement,
        startsAt: new Date(announcement.startsAt),
        endsAt: null,
      })
      .onConflictDoUpdate({
        target: schema.announcements.id,
        set: {
          title: announcement.title,
          body: announcement.body,
          audience: announcement.audience,
          priority: announcement.priority,
          published: announcement.published,
          startsAt: new Date(announcement.startsAt),
          endsAt: null,
        },
      });
  }

  for (const incident of incidents) {
    await db
      .insert(schema.incidents)
      .values({
        ...incident,
        occurredAt: new Date(incident.occurredAt),
      })
      .onConflictDoUpdate({
        target: schema.incidents.id,
        set: {
          title: incident.title,
          zoneId: incident.zoneId,
          severity: incident.severity,
          status: incident.status,
          occurredAt: new Date(incident.occurredAt),
          description: incident.description,
        },
      });
  }

  for (const request of demoAccessRequests) {
    await db
      .insert(schema.accessRequests)
      .values(request)
      .onConflictDoUpdate({
        target: schema.accessRequests.id,
        set: {
          clerkUserId: request.clerkUserId,
          email: request.email,
          requestedRole: request.requestedRole,
          organizationName: request.organizationName,
          contactName: request.contactName,
          phone: request.phone,
          message: request.message,
          status: request.status,
          reviewerNote: request.reviewerNote,
          reviewedAt: request.reviewedAt,
          cancellationReason: request.cancellationReason,
          cancelledAt: request.cancelledAt,
          updatedAt: request.updatedAt,
        },
      });
  }

  console.info("Seeded demo admin data without clearing existing records.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
