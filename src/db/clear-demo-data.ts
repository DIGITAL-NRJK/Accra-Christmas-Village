import { inArray } from "drizzle-orm";
import { getDb } from "./client";
import { loadLocalEnv } from "./load-env";
import {
  accessRequests,
  announcements,
  auditLogs,
  documents,
  events,
  incidents,
  onboardingTasks,
  organizations,
  sponsors,
  users,
  vendors,
} from "./schema";

loadLocalEnv();

const demoOrganizationIds = [
  "org-akwaaba-grill",
  "org-kente-studio",
  "org-adinkra-gifts",
  "org-heritage-bank",
  "org-goldline",
  "org-city-tourism-board",
];

const demoUserIds = [
  "user-demo-vendor",
  "user-demo-sponsor",
  "user-demo-admin",
  "user-demo-partner",
];

const seededEventIds = [
  "event-opening-carols",
  "event-kids-santa",
  "event-food-demo",
  "event-highlife-night",
  "event-vendor-briefing",
  "event-sponsor-giveaway",
];

const seededAnnouncementIds = [
  "ann-gate-b",
  "ann-vendor-setup",
  "ann-sponsor-assets",
];

const seededIncidentIds = [
  "incident-first-aid-drill",
  "incident-power-check",
];

const seededAccessRequestIds = [
  "access-demo-pending-vendor",
  "access-demo-pending-sponsor",
  "access-demo-approved-partner",
  "access-demo-rejected-vendor",
  "access-demo-cancelled-sponsor",
];

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Add it to .env before running pnpm db:clear-demo-data.");
  }
}

async function main() {
  requireDatabaseUrl();
  const db = getDb();

  await db.delete(accessRequests).where(inArray(accessRequests.id, seededAccessRequestIds));
  await db.delete(auditLogs).where(inArray(auditLogs.actorUserId, demoUserIds));
  await db.delete(incidents).where(inArray(incidents.id, seededIncidentIds));
  await db.delete(announcements).where(inArray(announcements.id, seededAnnouncementIds));
  await db.delete(documents).where(inArray(documents.organizationId, demoOrganizationIds));
  await db.delete(onboardingTasks).where(inArray(onboardingTasks.organizationId, demoOrganizationIds));
  await db.delete(events).where(inArray(events.id, seededEventIds));
  await db.delete(sponsors).where(inArray(sponsors.organizationId, demoOrganizationIds));
  await db.delete(vendors).where(inArray(vendors.organizationId, demoOrganizationIds));
  await db.delete(users).where(inArray(users.id, demoUserIds));
  await db.delete(organizations).where(inArray(organizations.id, demoOrganizationIds));

  console.info("Cleared seeded demo participant/programme/announcement data. Site zones and stand inventory were preserved.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
