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

8. Deploy to Netlify. Connect the GitHub repo, add `DATABASE_URL`, set `DOCUMENT_STORAGE_DRIVER=netlify-blobs`, and let Netlify run `pnpm build` using `netlify.toml`.

## Access And Roles

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

To create missing vendor/sponsor operational records for already approved access requests:

```bash
pnpm db:backfill-participant-records
```

To remove seeded sample participants, sponsors, vendors, programme items and announcements while preserving site zones and stand inventory:

```bash
pnpm db:clear-demo-data
```

## Document Uploads

V1 uses a storage abstraction in `src/lib/storage.ts`. Local development defaults to an in-memory mock upload flow that stores document metadata through Drizzle when `DATABASE_URL` is configured and returns a `local://` object URL for UI testing.

Production document handling uses Netlify Blobs when `DOCUMENT_STORAGE_DRIVER=netlify-blobs` is set. On Netlify, the Blobs client reads site credentials from the function environment automatically. For local or CI access to a real store, set:

```env
DOCUMENT_STORAGE_DRIVER=netlify-blobs
NETLIFY_BLOBS_STORE=participant-documents
NETLIFY_BLOBS_SITE_ID=your-netlify-site-id
NETLIFY_BLOBS_TOKEN=your-netlify-personal-access-token
```

Document uploads are limited to 10 MB by default through `DOCUMENT_UPLOAD_MAX_BYTES`; `DOCUMENT_UPLOAD_BODY_SIZE_LIMIT` controls the matching Next.js Server Actions body limit.

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

## GitHub + Neon Preview Branches

Pull requests create a temporary Neon branch named `preview/pr-<number>-<branch>`.
The workflow applies Drizzle migrations to that preview database and deletes the
Neon branch when the PR closes.

Configure these in GitHub before opening PRs:

- Repository variable: `NEON_PROJECT_ID`
- Repository secret: `NEON_API_KEY`
