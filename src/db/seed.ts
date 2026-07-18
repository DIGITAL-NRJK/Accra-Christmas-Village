import { getDb } from "./client";
import { loadLocalEnv } from "./load-env";
import * as schema from "./schema";
import {
  documentRequirements,
  stands,
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
  await db.delete(schema.vendorBrandAssets);
  await db.delete(schema.vendorBrandProfiles);
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
  await db.insert(schema.stands).values(
    stands.map((stand) => ({
      ...stand,
      status: "available" as const,
    })),
  );
  await db.insert(schema.documentRequirements).values(documentRequirements);

  console.log("Seeded Accra Christmas Village baseline zones, stands and document requirements.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
