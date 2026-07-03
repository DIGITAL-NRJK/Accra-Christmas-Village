import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { loadLocalEnv } from "./load-env";
import { organizations, users } from "./schema";

loadLocalEnv();

const organizerOrganizationId = "org-festival-ops";

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Add it to .env before running pnpm db:bootstrap-admin.");
  }
}

function getDisplayName(email: string, providedName?: string) {
  if (providedName?.trim()) {
    return providedName.trim();
  }

  return email.split("@")[0] || "Super Admin";
}

async function main() {
  requireDatabaseUrl();

  const email = process.argv[2]?.trim().toLowerCase();
  const fullName = getDisplayName(email ?? "", process.argv[3]);

  if (!email) {
    throw new Error('Usage: pnpm db:bootstrap-admin "admin@example.com" "Full Name"');
  }

  const db = getDb();

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
    .onConflictDoUpdate({
      target: organizations.id,
      set: {
        contactEmail: email,
        status: "active",
      },
    });

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser) {
    await db
      .update(users)
      .set({
        organizationId: organizerOrganizationId,
        role: "super_admin",
        fullName,
      })
      .where(eq(users.id, existingUser.id));
  } else {
    await db.insert(users).values({
      id: crypto.randomUUID(),
      clerkUserId: null,
      organizationId: organizerOrganizationId,
      role: "super_admin",
      fullName,
      email,
      phone: "",
    });
  }

  console.info(`Bootstrapped super_admin user for ${email}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
