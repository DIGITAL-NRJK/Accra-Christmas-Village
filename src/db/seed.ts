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

loadLocalEnv();

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Add it to .env before running pnpm db:seed.");
  }
}

async function main() {
  requireDatabaseUrl();
  const db = getDb();

  await db.delete(schema.accessRequests);
  await db.delete(schema.auditLogs);
  await db.delete(schema.incidents);
  await db.delete(schema.announcements);
  await db.delete(schema.documents);
  await db.delete(schema.onboardingTasks);
  await db.delete(schema.documentRequirements);
  await db.delete(schema.events);
  await db.delete(schema.sponsors);
  await db.delete(schema.vendors);
  await db.delete(schema.users);
  await db.delete(schema.organizations);
  await db.delete(schema.stands);
  await db.delete(schema.zones);

  await db.insert(schema.zones).values(zones);
  await db.insert(schema.stands).values(stands);
  await db.insert(schema.organizations).values(organizations);
  await db.insert(schema.users).values(users);
  await db.insert(schema.vendors).values(vendors);
  await db.insert(schema.sponsors).values(sponsors);
  await db.insert(schema.events).values(
    programmeItems.map((event) => ({
      ...event,
      day: event.day,
    })),
  );
  await db.insert(schema.documentRequirements).values(documentRequirements);
  await db.insert(schema.onboardingTasks).values(onboardingTasks);
  await db.insert(schema.documents).values(
    documents.map((document) => ({
      ...document,
      id: document.id,
      uploaderUserId: null,
      fileType: document.fileName?.endsWith(".zip") ? "application/zip" : "application/pdf",
      fileSize: document.fileName ? 240000 : null,
      storageKey: document.fileName
        ? `seed/${document.organizationId}/${document.requirementId}/${document.fileName}`
        : null,
      storageUrl: document.fileName
        ? `local://seed/${document.organizationId}/${document.requirementId}/${document.fileName}`
        : null,
      rejectionReason: document.status === "rejected" ? document.reviewerNote : null,
      reviewerNote: document.reviewerNote,
      submittedAt: document.submittedAt ? new Date(document.submittedAt) : null,
      reviewedAt: document.reviewedAt ? new Date(document.reviewedAt) : null,
      reviewedByUserId: document.reviewedAt ? "user-demo-admin" : null,
    })),
  );
  await db.insert(schema.announcements).values(
    announcements.map((announcement) => ({
      ...announcement,
      startsAt: new Date(announcement.startsAt),
      endsAt: null,
    })),
  );
  await db.insert(schema.incidents).values(
    incidents.map((incident) => ({
      ...incident,
      occurredAt: new Date(incident.occurredAt),
    })),
  );
  await db.insert(schema.auditLogs).values([
    {
      id: "audit-seed-complete",
      actorUserId: "user-demo-admin",
      action: "seed",
      entityType: "database",
      entityId: "accra-christmas-village",
      metadata: { source: "src/db/seed.ts" },
    },
  ]);

  console.log("Seeded Accra Christmas Village demo data.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
