# Accra Christmas Village PWA

V1 web application for Accra Christmas Village: public visitor guide, participant portal and organizer admin workspace.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Neon Serverless PostgreSQL
- Drizzle ORM and Drizzle Kit
- Netlify deployment with `@netlify/plugin-nextjs`
- GitHub Actions CI using pnpm

## Setup

1. Clone the repo.
2. Install dependencies:

```bash
pnpm install
```

3. Create a Neon database.
4. Set `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL=postgres://...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. Generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

6. Seed the database:

```bash
pnpm db:seed
```

7. Run the dev server:

```bash
pnpm dev
```

8. Deploy to Netlify. Connect the GitHub repo, add `DATABASE_URL`, and let Netlify run `pnpm build` using `netlify.toml`.

## Demo Access

The public site is available without an account. The participant portal and admin workspace are protected by Clerk authentication and Accra Christmas Village roles stored in Neon.

For local bootstrap access, set `CLERK_ADMIN_EMAILS` to a comma-separated list of trusted admin emails. For vendor and sponsor access, link the Clerk user to a row in the `users` table using `clerk_user_id`, or use an email that already exists in the seeded `users` table.

Clerk handles identity and sign-in. Neon stores the application role, organization and approval status. When a signed-in Clerk user opens a protected workspace, the app syncs that Clerk profile into the Neon `users` table. Emails listed in `CLERK_ADMIN_EMAILS` are promoted to `super_admin`.

To create a super admin directly in Neon for testing:

```bash
pnpm db:bootstrap-admin "dkhennys@gmail.com" "Khenny D"
```

To create missing `visitor` rows for people who already submitted participant access requests:

```bash
pnpm db:backfill-access-users
```

## Document Uploads

V1 uses a storage abstraction in `src/lib/storage.ts`. The local mock upload flow stores document metadata through Drizzle when `DATABASE_URL` is configured and returns a `local://` mock object URL for UI testing.

TODO: replace the mock storage adapter with Netlify Blobs, S3 or Cloudflare R2 before production document handling.

## Useful Scripts

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:bootstrap-admin "admin@example.com" "Admin Name"
pnpm db:backfill-access-users
pnpm db:seed
```
