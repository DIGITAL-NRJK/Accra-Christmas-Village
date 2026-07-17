import { eq, ne } from "drizzle-orm";
import { getDb } from "@/db/client";
import { loadLocalEnv } from "@/db/load-env";
import { syncOrganizationCompliance } from "@/db/queries";
import { documentRequirements, organizations } from "@/db/schema";

async function main() {
  loadLocalEnv();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const db = getDb();
  await db
    .update(documentRequirements)
    .set({ appliesToCategories: ["Food & drinks"] })
    .where(eq(documentRequirements.id, "req-food-safety"));
  const participants = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(ne(organizations.type, "organizer"));

  for (const participant of participants) {
    await syncOrganizationCompliance(participant.id);
  }

  console.log(`Compliance recalculated for ${participants.length} participant organizations.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
