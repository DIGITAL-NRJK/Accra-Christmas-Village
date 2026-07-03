import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { loadLocalEnv } from "./load-env";
import { ensureParticipantRecord } from "./queries";
import { accessRequests, users } from "./schema";
import type { ParticipantRole } from "../lib/types";

loadLocalEnv();

const participantRoles: ParticipantRole[] = ["vendor", "sponsor", "partner"];

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Add it to .env before running pnpm db:backfill-participant-records.");
  }
}

function isParticipantRole(role: string): role is ParticipantRole {
  return participantRoles.includes(role as ParticipantRole);
}

async function main() {
  requireDatabaseUrl();

  const db = getDb();
  const approvedRequests = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.status, "approved"));
  let backfilled = 0;

  for (const request of approvedRequests) {
    if (!isParticipantRole(request.requestedRole)) {
      continue;
    }

    const [user] = await db.select().from(users).where(eq(users.email, request.email)).limit(1);

    if (!user?.organizationId) {
      continue;
    }

    await ensureParticipantRecord(user.organizationId, request.requestedRole, request.organizationName);
    backfilled += 1;
  }

  console.info(`Backfilled participant records for ${backfilled} approved request(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
