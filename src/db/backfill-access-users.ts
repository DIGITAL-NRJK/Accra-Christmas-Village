import { eq, or } from "drizzle-orm";
import { getDb } from "./client";
import { loadLocalEnv } from "./load-env";
import { accessRequests, users } from "./schema";

loadLocalEnv();

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Add it to .env before running pnpm db:backfill-access-users.");
  }
}

async function main() {
  requireDatabaseUrl();

  const db = getDb();
  const requests = await db.select().from(accessRequests);
  let created = 0;

  for (const request of requests) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(or(eq(users.clerkUserId, request.clerkUserId), eq(users.email, request.email)))
      .limit(1);

    if (existingUser) {
      continue;
    }

    await db.insert(users).values({
      id: crypto.randomUUID(),
      clerkUserId: request.clerkUserId,
      organizationId: null,
      role: "visitor",
      fullName: request.contactName,
      email: request.email,
      phone: request.phone,
    });

    created += 1;
  }

  console.info(`Backfilled ${created} user(s) from access requests.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
